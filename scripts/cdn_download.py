# This script downloads the contents of the game's live CDN server for the purpose of emulating the CDN for Honse Daughters

import os
import asyncio
import aiohttp
import lz4.frame
import apsw
import struct
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import List
from progress.bar import IncrementalBar
from math import floor
from threading import Thread, enumerate, current_thread

"""
Have to dug this up more to ensure it's the right one.
This is the resource server URL sent by the game on the initial connection/signup process, so chances are decent.
TODO: need to figure out how are assets stored on the Global CDN server.
Met with forbidden access errors, need to figure out how to get around it.
"""
EN_CDN_URL = "http://assets-umamusume-en.akamaized.net/dl/vertical"
JP_CDN_URL = "https://prd-storage-game-umamusume.akamaized.net/dl"
resVer = "10003850"


"""
ASSETS_ENDPOINT = JP_CDN_URL + '/Android/assetbundles/{0:.2}/{0}'
GENERIC_ENDPOINT = JP_CDN_URL + '/Generic/{0:.2}/{0}'
MANIFEST_ENDPOINT = JP_CDN_URL + '/Manifest/{0:.2}/{0}'
            
In the meanwhile, these URLs seem to work with the (Android?) JP meta file.
"manifest" or "manifest2" or "manifest3" => "https://prd-storage-app-umamusume.akamaized.net/dl/resources/Manifest",
                    _ => "https://prd-storage-game-umamusume.akamaized.net/dl/resources/Windows/assetbundles"
                    "https://prd-storage-game-umamusume.akamaized.net/dl/resources/Android/assetbundles"
                } : "https://prd-storage-game-umamusume.akamaized.net/dl/resources/Generic";
"""

ROOT = os.path.dirname(os.path.realpath(__file__))
OUTPUT_DIR = os.path.join(ROOT, "..", ".cdn")
ASSET_LISTS_DIR = os.path.join(ROOT, "..", "assets/asset_lists")

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Constants from data_download.py
BLOB_TABLE = 'a'
BLOB_TABLE_PATH = 'n'
BLOB_TABLE_HASH = 'h'
BLOB_TABLE_KIND = 'm'

# Keys from utils.py
DB_BASE_KEY = b'\xF1\x70\xCE\xA4\xDF\xCE\xA3\xE1\xA5\xD8\xC7\x0B\xD1\x00\x00\x00'
DB_KEY = b'\x6D\x5B\x65\x33\x63\x36\x63\x25\x54\x71\x2D\x73\x50\x53\x63\x38\x6D\x34\x37\x7B\x35\x63\x70\x23\x37\x34\x53\x29\x73\x43\x36\x33'

@dataclass
class BlobRow:
    path: str
    hash: str
    kind: str
    language: str  # 'en' or 'jp'
    platform: str  # 'android' or 'windows'
    source_filename: str = ''

    def __str__(self):
        return self.path

def dict_factory(cursor, row):
    description = [d[0] for d in cursor.get_description()]
    return {key: value for key, value in zip(description, row)}

def _derive_decryption_key(key, base_key):
    key = bytearray(key)
    if len(base_key) < 13:
        raise ValueError("Invalid Base Key length.")
    for i in range(len(key)):
        key[i] ^= base_key[i % 13]
    return bytes(key)

def get_meta_conn(db_path):
    conn = apsw.Connection(str(db_path))
    conn.row_trace = dict_factory
    
    # Try to query the table directly to check if it's already decrypted
    try:
        next(conn.execute(f'SELECT count(*) FROM sqlite_master WHERE type="table" AND name="{BLOB_TABLE}"'))

        conn.execute(f'SELECT * FROM "{BLOB_TABLE}" LIMIT 1')
        print(f"File {db_path} appears to be decrypted, skipping decryption.")
        return conn
    except Exception:
        pass

    conn.close()
    conn = apsw.Connection(str(db_path))
    conn.row_trace = dict_factory
    
    final_key = _derive_decryption_key(DB_KEY, DB_BASE_KEY)
    conn.pragma("cipher", "chacha20")
    conn.pragma("hexkey", final_key.hex())
    return conn

# game's meta file from appdata, adapted to server & device
asset_lists_paths = {
    "en-windows": [
        os.path.join(ASSET_LISTS_DIR, "en-windows-meta")
    ],
    "en-android": [
        os.path.join(ASSET_LISTS_DIR, "en-android-meta")
    ],
    "jp-windows": [
        os.path.join(ASSET_LISTS_DIR, "jp-windows-meta")
    ],
    "jp-android": [
        os.path.join(ASSET_LISTS_DIR, "jp-android-meta")
    ],
}

def get_asset_blobs(languages=[]) -> List[BlobRow]:
    blobs = []
    limit = 200
    
    for lang_key in languages:
        # Parse language and platform from key (e.g. "en-windows")
        parts = lang_key.split('-')
        if len(parts) >= 2:
            language = parts[0]
            platform = parts[1]
        else:
            language = 'jp' # Default fallback
            platform = 'windows'

        paths = asset_lists_paths.get(lang_key) or []
        for path in paths:
            if not os.path.exists(path):
                print(f"Warning: Asset list file not found: {path}")
                continue
            
            source_filename = os.path.basename(path)

            try:
                conn = get_meta_conn(path)
                
                # Check total blobs
                try:
                    total_blobs = next(conn.execute(f'SELECT COUNT(*) FROM "{BLOB_TABLE}"'))['COUNT(*)']
                except Exception as e:
                    # Fallback if table doesn't exist or query fails
                    print(f"Error querying table {BLOB_TABLE} in {path}: {e}")
                    conn.close()
                    continue

                offset = 0
                while offset < total_blobs:
                    rows_fetched = 0
                    for row in conn.execute(f'SELECT "{BLOB_TABLE_PATH}" as n, "{BLOB_TABLE_HASH}" as h, "{BLOB_TABLE_KIND}" as m FROM "{BLOB_TABLE}" LIMIT {limit} OFFSET {offset}'):
                        blob_row = BlobRow(
                            path=row['n'], 
                            hash=row['h'], 
                            kind=row['m'],
                            language=language,
                            platform=platform,
                            source_filename=source_filename
                        )
                        
                        if blob_row.path.startswith('//'):
                            blob_row.path = f'{blob_row.kind}/{blob_row.path[2:]}'
                        
                        blobs.append(blob_row)
                        rows_fetched += 1
                    
                    if rows_fetched == 0:
                        break
                    offset += rows_fetched
                
                conn.close()
            except Exception as e:
                print(f"Error parsing asset list {path}: {e}")
                
    return blobs

async def save_blob_row(session: aiohttp.ClientSession, blob_row: BlobRow, bar: IncrementalBar):
    # Construct URL based on language and kind
    base_url = EN_CDN_URL if blob_row.language == 'en' else JP_CDN_URL
    base_url = base_url.rstrip('/')
    
    # endpoints Format: 
    #   {Base}/{Platform}/assetbundles/{hash:.2}/{hash} for assets
    #   {Base}/Generic/{hash:.2}/{hash} for master/generic
    #   {Base}/Manifest/{hash:.2}/{hash} for manifest
    
    # Platform capitalization (Windows/Android)
    platform_cap = blob_row.platform.capitalize()
    
    assets_endpoint = base_url + f'/resources/{platform_cap}/assetbundles/{{0:.2}}/{{0}}'
    generic_endpoint = base_url + '/resources/Generic/{0:.2}/{0}'
    manifest_endpoint = base_url + '/resources/Manifest/{0:.2}/{0}'
    manifest3_endpoint = base_url + f'/{resVer}/manifests/manifestdat/root.manifest.bsv.lz4'
    
    # Logic from data_download.py
    if blob_row.kind == 'master':
        endpoint = generic_endpoint
        url = endpoint.format(blob_row.hash)
    elif blob_row.kind in ('sound', 'movie', 'font'):
        endpoint = generic_endpoint
        url = endpoint.format(blob_row.hash)
    elif blob_row.kind in ('manifest', 'manifest2'):
        endpoint = manifest_endpoint
        url = endpoint.format(blob_row.hash)
    elif blob_row.kind == 'manifest3':
        url = manifest3_endpoint
    else:
        endpoint = assets_endpoint
        url = endpoint.format(blob_row.hash)

    # Determine output path based on URL structure (mimicking CDN)
    # Remove base_url from url to get relative path
    # e.g. url: https://.../Generic/hash -> relative_path: Generic/hash
    
    relative_path_from_url = url.replace(base_url, "").lstrip('/')
    
    # We do NOT decompress if we are emulating the CDN, as the client expects compressed assets (if they are compressed on CDN).
    # The CDN file structure usually doesn't have extensions for hashed files, but might for manifests.
    
    output_path = Path(OUTPUT_DIR, blob_row.source_filename, relative_path_from_url)
    
    if output_path.exists():
        bar.next()
        return

    try:
        async with session.get(url) as resp:
            if resp.status == 403:
                # Log error as per data_download.py
                print(f'\nFailed to download (403): {url}')
                bar.next()
                return
            
            if resp.status != 200:
                print(f'\nFailed to download ({resp.status}): {url}')
                bar.next()
                return

            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with output_path.open('wb') as f:
                while True:
                    chunk = await resp.content.read(1024 * 4)
                    if not chunk:
                        break
                    f.write(chunk)
            
            bar.next()
    except Exception as e:
        print(f"\nError downloading {blob_row.path}: {e}")
        bar.next()

async def download_assets_async(blobs: List[BlobRow]):
    bar = IncrementalBar('Downloading CDN Assets', max=len(blobs))
    
    async with aiohttp.ClientSession() as session:
        # Limit concurrency to avoid overwhelming the server or local resources
        semaphore = asyncio.Semaphore(30) 
        
        async def bounded_download(blob):
            async with semaphore:
                await save_blob_row(session, blob, bar)
        
        tasks = [bounded_download(blob) for blob in blobs]
        await asyncio.gather(*tasks)
    
    bar.finish()

if __name__ == '__main__':
    # get user input
    platform_choice = input('Enter the platform to download the CDN for. \nPlatform [ALL/android/windows]:')
    match platform_choice:
        case 'windows':
            platform_choice = 'windows'
        case 'android':
            platform_choice = 'android'
        case _:
            platform_choice = 'all'

    print(f'Selected platform "{platform_choice}".\n')

    lang_choice = input('Enter the language code for the CDN you wish to download. \nLanguage Code [ALL/en/jp]:')
    match lang_choice:
        case 'en':
            lang_choice = 'en'
        case 'jp':
            lang_choice = 'jp'
        case _:
            lang_choice = 'all'

    print(f'Selected language "{lang_choice}".\n')

    languages = []
    for lang in asset_lists_paths.keys():
        if ( lang_choice == 'all' or lang.startswith(lang_choice)) and ( platform_choice == 'all' or lang.endswith(platform_choice) ):
            languages.append(lang)

    # get the assets
    print("Parsing asset lists...")
    blobs = get_asset_blobs(languages)

    if not blobs:
        print("No assets found. Check if asset list files exist in assets/asset_lists.")
        exit()

    choice = input(f'Found {len(blobs)} files. Continue? \n[Y/n]:')
    match choice:
        case 'n':
            exit()

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(download_assets_async(blobs))
        print("CDN Downloaded Successfully to '.cdn'")
    finally:
        loop.close()
