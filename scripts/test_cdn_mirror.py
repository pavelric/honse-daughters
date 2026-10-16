"""Run: python -m unittest discover -s scripts -p test_cdn_mirror.py"""
import hashlib
from pathlib import Path
import tempfile
import unittest

import aiohttp
from aiohttp import web
import lz4.frame

from cdn_mirror import Mirror, completed_sizes, read_manifest


def vlq(value):
    result = [value & 127]
    while value > 127:
        value >>= 7
        result.insert(0, (value & 127) | 128)
    return bytes(result)


def fixture(full=False):
    schemas = b'@@\x11\x11\x12\x21\x08\x13' if full else b'@\x12\x21\x08'
    header = vlq(1) + vlq(100) + vlq(17 if full else 32) + vlq(7 if full else 3) + schemas
    row = b'example\0' + (b'dependency\0\x01\x00' if full else b'')
    row += vlq(684) + (123456).to_bytes(8, 'big')
    if full:
        row += b'\xff' * 8
    return lz4.frame.compress(b'\xbf\x11' + len(header).to_bytes(2, 'big') + header + row)


class ManifestTests(unittest.TestCase):
    def test_hash_and_global_extra_field(self):
        import base64
        expected = base64.b32encode(hashlib.sha1(
            (123456).to_bytes(8, 'big') + (684).to_bytes(8, 'big') + b'example'
        ).digest()).decode()
        for full in [False, True]:
            with self.subTest(full=full):
                self.assertEqual(read_manifest(fixture(full)), [{'name': 'example', 'size': 684, 'hash': expected}])

    def test_reject_truncation_and_trailing_data(self):
        data = lz4.frame.decompress(fixture(True))
        for malformed in [data[:-1], data + b'\0']:
            with self.assertRaises(ValueError):
                read_manifest(lz4.frame.compress(malformed))

    def test_resume_inventory_uses_nested_completed_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'resources' / 'AB').mkdir(parents=True)
            (root / 'resources' / 'AB' / 'blob').write_bytes(b'complete')
            (root / 'resources' / 'AB' / 'other.part').write_bytes(b'partial')
            self.assertEqual(completed_sizes(root), {'resources/AB/blob': 8})


class DownloadTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.directory = Path(self.temp.name)
        self.requests = 0
        self.status = 200
        self.payload = b'complete resource'

        async def handler(request):
            self.requests += 1
            return web.Response(status=self.status, body=self.payload)

        app = web.Application()
        app.router.add_get('/{path:.*}', handler)
        self.runner = web.AppRunner(app)
        await self.runner.setup()
        site = web.TCPSite(self.runner, '127.0.0.1', 0)
        await site.start()
        port = site._server.sockets[0].getsockname()[1]
        from unittest.mock import patch
        self.patch = patch('cdn_mirror.BASE_URL', f'http://127.0.0.1:{port}')
        self.patch.start()
        self.session = aiohttp.ClientSession()
        self.mirror = Mirror(self.directory, self.session)

    async def asyncTearDown(self):
        await self.session.close()
        await self.runner.cleanup()
        self.patch.stop()
        self.temp.cleanup()

    async def test_resume_replaces_partial_and_skips_completed(self):
        (self.directory / 'blob').write_bytes(b'bad')
        (self.directory / 'blob.part').write_bytes(b'interrupted')
        result = await self.mirror.fetch('blob', len(self.payload))
        self.assertEqual(result.read_bytes(), self.payload)
        self.assertFalse((self.directory / 'blob.part').exists())
        await self.mirror.fetch('blob', len(self.payload))
        self.assertEqual(self.requests, 1)

    async def test_403_is_failure_and_never_published(self):
        self.status = 403
        with self.assertRaises(aiohttp.ClientResponseError):
            await self.mirror.fetch('blob', len(self.payload))
        self.assertFalse((self.directory / 'blob').exists())
        self.assertEqual(self.requests, 1)

    async def test_truncated_body_retried_and_never_published(self):
        from unittest.mock import AsyncMock, patch
        with patch('cdn_mirror.asyncio.sleep', new_callable=AsyncMock):
            with self.assertRaises(ValueError):
                await self.mirror.fetch('blob', len(self.payload) + 10)
        self.assertFalse((self.directory / 'blob').exists())
        self.assertEqual(self.requests, 4)


if __name__ == '__main__':
    unittest.main()
