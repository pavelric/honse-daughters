"""Mirror Global CDN from its versioned manifest tree (no local meta required).

BSV structure and hash derivation reference:
https://github.com/katboi01/UmaViewer/tree/master/Assets/Scripts/Manifest
The Global schema also includes an opaque final 8-byte field; preserve the
original compressed files, including encrypted bundles, exactly as received.
"""
import argparse
import asyncio
import base64
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys

import aiohttp
import lz4.frame

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = 'https://assets-umamusume-en.akamaized.net/dl/vertical'


class BsvReader:
    def __init__(self, data):
        self.data = data
        self.offset = 0

    def take(self, size):
        end = self.offset + size
        if end > len(self.data):
            raise ValueError('Truncated BSV')
        result = self.data[self.offset:end]
        self.offset = end
        return result

    def vlq(self):
        value = 0
        for _ in range(10):
            byte = self.take(1)[0]
            value = (value << 7) | (byte & 127)
            if byte < 128:
                return value
        raise ValueError('Invalid BSV integer')

    def text(self):
        end = self.data.index(0, self.offset)
        return self.take(end - self.offset + 1)[:-1].decode('utf-8')


def read_manifest(compressed):
    reader = BsvReader(lz4.frame.decompress(compressed))
    if reader.take(2) != b'\xbf\x11':
        raise ValueError('Unsupported BSV format')
    header_size = int.from_bytes(reader.take(2), 'big')
    row_count = reader.vlq()
    reader.vlq()  # maximum row size
    version = reader.vlq()
    schemas = []
    for _ in range(reader.vlq()):
        kind = reader.take(1)[0]
        size = reader.vlq() if kind in (33, 49, 65) else None
        schemas.append((kind, size))
    if reader.offset != header_size + 4:
        raise ValueError('Unexpected BSV header length')
    kinds = [kind for kind, _ in schemas]
    if kinds not in ([64, 18, 33], [64, 64, 17, 17, 18, 33, 19]):
        raise ValueError(f'Unsupported manifest schema {version}: {schemas}')
    rows = []
    for _ in range(row_count):
        fields = []
        for kind, size in schemas:
            if kind == 64:
                fields.append(reader.text())
            elif kind in (17, 18):
                fields.append(reader.vlq())
            elif kind == 33:
                fields.append(int.from_bytes(reader.take(size), 'big'))
            elif kind == 19:
                fields.append(reader.take(8))  # Global opaque field
        if len(fields) == 3:
            name, size, checksum = fields
        else:
            name, _, _, _, size, checksum, _ = fields
        digest = hashlib.sha1(checksum.to_bytes(8, 'big') + size.to_bytes(8, 'big') + name.encode()).digest()
        rows.append({'name': name, 'size': size, 'hash': base64.b32encode(digest).decode()})
    if reader.offset != len(reader.data):
        raise ValueError('Trailing BSV data: schema may have changed')
    return rows


def hashed_path(section, row):
    return f"resources/{section}/{row['hash'][:2]}/{row['hash']}"


def write_json(path, value):
    temp = path.with_suffix(path.suffix + '.part')
    temp.write_text(json.dumps(value, indent=2) + '\n', encoding='utf-8')
    temp.replace(path)


def completed_sizes(directory):
    """Use directory metadata instead of stat'ing 190,000 paths individually."""
    sizes = {}

    def visit(path, prefix):
        with os.scandir(path) as entries:
            for entry in entries:
                relative = prefix + entry.name
                if entry.is_dir(follow_symlinks=False):
                    visit(entry.path, relative + '/')
                elif entry.is_file(follow_symlinks=False) and not entry.name.endswith('.part'):
                    sizes[relative] = entry.stat().st_size

    visit(directory, '')
    return sizes


class Mirror:
    def __init__(self, directory, session):
        self.directory = directory
        self.session = session

    async def fetch(self, relative, expected=None):
        destination = self.directory / relative
        # Only completed, size-checked files are ever stored at the final path.
        if destination.is_file() and (expected is None or destination.stat().st_size == expected):
            return destination
        destination.parent.mkdir(parents=True, exist_ok=True)
        temp = destination.with_name(destination.name + '.part')
        for attempt in range(4):
            try:
                async with self.session.get(f'{BASE_URL}/{relative}') as response:
                    response.raise_for_status()
                    with temp.open('wb') as stream:
                        async for chunk in response.content.iter_chunked(256 * 1024):
                            stream.write(chunk)
                    if expected is not None and temp.stat().st_size != expected:
                        raise ValueError(f'Size mismatch: expected {expected}, got {temp.stat().st_size}')
                    temp.replace(destination)
                    return destination
            except (aiohttp.ClientError, asyncio.TimeoutError, ValueError) as error:
                if isinstance(error, aiohttp.ClientResponseError) and error.status in (403, 404):
                    raise
                if attempt == 3:
                    raise
                await asyncio.sleep(2 ** attempt)

    async def manifest(self, relative, expected=None):
        path = await self.fetch(relative, expected)
        return read_manifest(path.read_bytes())


async def run(args):
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    timeout = aiohttp.ClientTimeout(total=None, connect=30, sock_read=90)
    async with aiohttp.ClientSession(timeout=timeout, auto_decompress=False,
                                   connector=aiohttp.TCPConnector(limit=args.workers)) as session:
        mirror = Mirror(output, session)
        root_path = f'{args.version}/manifests/manifestdat/root.manifest.bsv.lz4'
        root = await mirror.manifest(root_path)
        platform = next(row for row in root if row['name'] == args.platform.capitalize())
        categories = await mirror.manifest(hashed_path('Manifest', platform), platform['size'])
        entries = {}
        for category in categories:
            rows = await mirror.manifest(hashed_path('Manifest', category), category['size'])
            section = 'Generic' if category['name'] in ('master', 'sound', 'movie', 'font') else f'{args.platform.capitalize()}/assetbundles'
            for row in rows:
                relative = hashed_path(section, row)
                entry = {**row, 'category': category['name'], 'path': relative}
                if relative in entries and entries[relative]['size'] != row['size']:
                    raise ValueError(f'Conflicting sizes for {relative}')
                entries[relative] = entry
            print(f"Manifest {category['name']}: {len(rows)} entries", flush=True)
        inventory = {'resourceVersion': args.version, 'platform': args.platform, 'files': list(entries.values())}
        write_json(output / f'mirror-{args.version}.json', inventory)
        existing = completed_sizes(output)
        missing = [entry for entry in entries.values() if existing.get(entry['path']) != entry['size']]
        total_bytes = sum(entry['size'] for entry in entries.values())
        missing_bytes = sum(entry['size'] for entry in missing)
        print(f"{len(entries):,} files, {total_bytes / 2**30:.2f} GiB; missing {len(missing):,}, {missing_bytes / 2**30:.2f} GiB", flush=True)
        if args.manifests_only:
            return 0
        if shutil.disk_usage(output).free < missing_bytes + 2**30:
            raise ValueError('Insufficient disk space (including 1 GiB reserve)')
        queue = asyncio.Queue()
        for entry in missing:
            queue.put_nowait(entry)
        failures = []
        completed = 0

        async def worker():
            nonlocal completed
            while not queue.empty():
                entry = queue.get_nowait()
                try:
                    await mirror.fetch(entry['path'], entry['size'])
                except (aiohttp.ClientError, asyncio.TimeoutError, ValueError, OSError) as error:
                    failures.append({'path': entry['path'], 'error': str(error)})
                    if len(failures) <= 10:
                        print(f"FAILED {entry['path']}: {error}", flush=True)
                finally:
                    completed += 1
                    if completed % 500 == 0:
                        print(f'{completed:,}/{len(missing):,} processed; {len(failures)} failures', flush=True)
                    queue.task_done()

        await asyncio.gather(*(worker() for _ in range(args.workers)))
        report = {'resourceVersion': args.version, 'platform': args.platform,
                  'total': len(entries), 'processed': completed, 'failures': failures}
        write_json(output / f'download-report-{args.version}.json', report)
        print(f"Mirror {'INCOMPLETE' if failures else 'complete'}: {len(failures)} failures. {output}", flush=True)
        return 1 if failures else 0


def main():
    config = json.loads((ROOT / 'cdn-config.json').read_text())
    # Match Node's --env-file=.env semantics: existing process environment wins.
    env = {}
    env_path = ROOT / '.env'
    if env_path.exists():
        for line in env_path.read_text(encoding='utf-8-sig').splitlines():
            if line.strip() and not line.lstrip().startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env[key.strip()] = value.strip().strip('\"\'')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--version', default=os.getenv('RESOURCE_VERSION', env.get('RESOURCE_VERSION', config['resourceVersion'])))
    parser.add_argument('--platform', choices=['android', 'windows'], default='android')
    parser.add_argument('--output', type=Path, help='Mirror root (defaults to CDN_DIR/en-<platform>-meta)')
    parser.add_argument('--workers', type=int, default=8)
    parser.add_argument('--manifests-only', action='store_true', help='Fetch all manifests and write inventory without downloading assets')
    args = parser.parse_args()
    if not args.version.isascii() or not args.version.isdecimal() or not 1 <= args.workers <= 32:
        parser.error('version must be numeric; workers must be between 1 and 32')
    if args.output is None:
        args.output = ROOT / os.getenv('CDN_DIR', env.get('CDN_DIR', '.cdn')) / f'en-{args.platform}-meta'
    try:
        return asyncio.run(run(args))
    except (aiohttp.ClientError, asyncio.TimeoutError, ValueError, OSError, StopIteration) as error:
        print(f'Mirror failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
