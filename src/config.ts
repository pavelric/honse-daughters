import { readFileSync } from 'fs';
import path from 'path';

const cdnConfig = JSON.parse(readFileSync(path.join(__dirname, '..', 'cdn-config.json'), 'utf8'));
export const RESOURCE_VERSION: string = process.env.RESOURCE_VERSION ?? cdnConfig.resourceVersion;
if (typeof RESOURCE_VERSION !== 'string' || !/^\d+$/.test(RESOURCE_VERSION)) {
    throw new Error('RESOURCE_VERSION must be a string containing only digits');
}

// Host + path the client prefixes asset requests with (no scheme: the client adds it).
// The default suits the mitmproxy redirect. "auto" echoes the Host the client reached this
// server through, for a patched direct-connect client (.preserve build, scheme patched to http://).
export const RESOURCE_SERVER: string = process.env.RESOURCE_SERVER ?? 'assets-umamusume-en.akamaized.net/dl/vertical/';

export function resourceServerFor(requestHost: string): string {
    return RESOURCE_SERVER === 'auto' ? `${requestHost}/assets/dl/vertical/` : RESOURCE_SERVER;
}
