"""Builds assets/story_choices.json: story_id -> number of choices, for every career story event.

The server has to send one choice_array entry per choice a story offers (the client maps the
tapped button to select_index through it), and that count only exists in the story timeline
assets. This reads them from the CDN mirror (scripts/cdn_mirror.py output in .cdn/en-android-meta).

Global story bundles are encrypted after a 256-byte header: byte k is XORed with
keys[k % len(keys)], where keys[i*8 + j] = BASE_KEYS[i] ^ key[j] and key is the bundle's 8-byte
manifest field read little-endian (Cute.AssetBundle.AssetBundleStream in the client).

Requires: pip install UnityPy lz4
usage: python scripts/masterdb/build_story_choices.py [path to master.mdb]
"""
import base64
import hashlib
import io
import json
import os
import sqlite3
import sys
from pathlib import Path

import lz4.frame
import UnityPy

ROOT = Path(__file__).resolve().parents[2]

META = ROOT / '.cdn' / 'en-android-meta'
OUTPUT_FILE = ROOT / 'assets' / 'story_choices.json'
BASE_KEYS = bytes([0x53, 0x2B, 0x46, 0x31, 0xE4, 0xA7, 0xB9, 0x47, 0x3E, 0x7C, 0xFB])

appdata = os.getenv('APPDATA') or ''
MDB_FILE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(appdata), 'LocalLow', 'Cygames', 'Umamusume', 'master', 'master.mdb')


class BsvReader:
    """Same as scripts/cdn_mirror.py's (copied so this script doesn't need aiohttp)."""

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
    """cdn_mirror.read_manifest, keeping the opaque final field (the bundle key)."""
    reader = BsvReader(lz4.frame.decompress(compressed))
    if reader.take(2) != b'\xbf\x11':
        raise ValueError('Unsupported BSV format')
    header_size = int.from_bytes(reader.take(2), 'big')
    row_count = reader.vlq()
    reader.vlq()
    reader.vlq()
    schemas = []
    for _ in range(reader.vlq()):
        kind = reader.take(1)[0]
        schemas.append((kind, reader.vlq() if kind in (33, 49, 65) else None))
    if reader.offset != header_size + 4:
        raise ValueError('Unexpected BSV header length')
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
                fields.append(reader.take(8))
        if len(fields) == 3:
            (name, size, checksum), key = fields, None
        else:
            name, _, _, _, size, checksum, key = fields
        digest = hashlib.sha1(checksum.to_bytes(8, 'big') + size.to_bytes(8, 'big') + name.encode()).digest()
        rows.append({'name': name, 'hash': base64.b32encode(digest).decode(), 'key': key})
    return rows


def bundle_path(section, row):
    return META / 'resources' / section / row['hash'][:2] / row['hash']


def story_bundles():
    version_dir = next(p for p in META.iterdir() if p.is_dir() and p.name.isdigit())
    root = read_manifest((version_dir / 'manifests/manifestdat/root.manifest.bsv.lz4').read_bytes())
    platform = next(r for r in root if r['name'] == 'Android')
    for cat in read_manifest(bundle_path('Manifest', platform).read_bytes()):
        if cat['name'] != 'story':
            continue
        for row in read_manifest(bundle_path('Manifest', cat).read_bytes()):
            suffix = row['name'].rsplit('_', 1)[-1]
            if '/storytimeline_' in row['name'] and suffix.isdigit():
                yield int(suffix), bundle_path('Android/assetbundles', row), row['key']


def decrypt(data, key):
    if not key or not any(key):
        return data
    key = key[::-1]
    keys = bytes(BASE_KEYS[i] ^ key[j] for i in range(len(BASE_KEYS)) for j in range(8))
    stream = (keys * (len(data) // len(keys) + 1))[:len(data)]
    body = int.from_bytes(data[256:], 'little') ^ int.from_bytes(stream[256:], 'little')
    return data[:256] + body.to_bytes(len(data) - 256, 'little')


def choice_count(path, key):
    env = UnityPy.load(io.BytesIO(decrypt(path.read_bytes(), key)))
    n = 0
    for obj in env.objects:
        if obj.type.name == 'MonoBehaviour':
            n = max(n, len(obj.read_typetree().get('ChoiceDataList') or []))
    return n


def main():
    db = sqlite3.connect(f'file:{MDB_FILE}?mode=ro', uri=True)
    wanted = {r[0] for r in db.execute('SELECT story_id FROM single_mode_story_data')}
    bundles = {sid: (path, key) for sid, path, key in story_bundles() if sid in wanted}
    out, failed = {}, []
    for i, sid in enumerate(sorted(bundles)):
        path, key = bundles[sid]
        try:
            n = choice_count(path, key)
            if n:
                out[str(sid)] = n
        except Exception as error:  # a missing or unreadable bundle just means "no choices known"
            failed.append((sid, str(error)[:80]))
        if i % 1000 == 0:
            print(f'{i}/{len(bundles)}', flush=True)
    OUTPUT_FILE.write_text(json.dumps(out, separators=(',', ':')), encoding='utf-8')
    print(f'Generated {OUTPUT_FILE}: {len(out)} of {len(bundles)} stories have choices; '
          f'{len(wanted) - len(bundles)} not in the mirror, {len(failed)} unreadable {failed[:5]}')


if __name__ == '__main__':
    main()
