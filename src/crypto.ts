import { createCipheriv, createDecipheriv, randomInt, createHash } from 'crypto';
import { pack, unpack } from 'msgpackr';

// Constants
const COMMON_HEADER_LENGTH = 52;
const SID_LENGTH = 16;
const UDID_LENGTH = 16;
const EN_SALT = "co!=Y;(UQCGxJ_n82";

export function computeResponseSid(sid: string): string {
    return createHash('md5').update(sid + EN_SALT).digest('hex');
}

export interface UmaHeader {
    commonHeader: Buffer;
    sid: string; // Hex string
    udid: string; // Hex string
    authKey: Buffer;
    randomBytes: Buffer;
    requestKey: Buffer;
}

export interface DecryptedRequest {
    header: UmaHeader;
    content: any;
}

/**
 * Decrypts the request payload from the game client.
 * 
 * Request Structure:
 * Base64 Decode -> [HeaderLength (4 bytes)][Header][EncryptedContent][Key (32 bytes)]
 * 
 * Header Structure:
 * [CommonHeader (52 bytes)][BinarySid (16 bytes)][BinaryUdid (16 bytes)][AuthKey][Random32Bytes]
 * 
 * EncryptedContent Decrypts to:
 * [ContentLength (4 bytes)][Content (MsgPack)]
 */
export function decryptRequest(base64Payload: string): DecryptedRequest {
    const raw = Buffer.from(base64Payload, 'base64');
    
    // 1. Read Header Length
    if (raw.length < 4) throw new Error("Payload too short");
    const headerLength = raw.readUInt32LE(0);
    
    if (raw.length < 4 + headerLength + 32) throw new Error("Payload shorter than expected header + key");

    // 2. Parse Header
    const headerBuffer = raw.subarray(4, 4 + headerLength);
    
    // Header components
    // [commonHeader][binarySid][binaryUdid]...
    if (headerBuffer.length < COMMON_HEADER_LENGTH + SID_LENGTH + UDID_LENGTH) {
        throw new Error("Header too short to contain required fields");
    }

    let offset = 0;
    const commonHeader = headerBuffer.subarray(offset, offset + COMMON_HEADER_LENGTH);
    offset += COMMON_HEADER_LENGTH;
    
    const binarySid = headerBuffer.subarray(offset, offset + SID_LENGTH);
    offset += SID_LENGTH;
    
    const binaryUdid = headerBuffer.subarray(offset, offset + UDID_LENGTH);
    offset += UDID_LENGTH;
    
    // The rest of the header contains authKey and random32Bytes. 
    // The breakdown isn't strictly defined by length in the doc, but we can store the rest.
    const remainingHeader = headerBuffer.subarray(offset);

    const sid = binarySid.toString('hex');
    const udid = binaryUdid.toString('hex'); // 32 chars

    // 3. Extract Key (last 32 bytes)
    const key = raw.subarray(raw.length - 32);

    const header: UmaHeader = {
        commonHeader,
        sid,
        udid,
        authKey: remainingHeader, // placeholder for now
        randomBytes: Buffer.alloc(0), // placeholder
        requestKey: key
    };

    // 4. Extract Encrypted Content
    const encryptedContent = raw.subarray(4 + headerLength, raw.length - 32);

    // 5. Derive IV from UDID
    // "converts that UDID to a hyphen-less string and takes the first 16 characters"
    // udid is already hex string (hyphen-less).
    const ivString = udid.substring(0, 16);
    const iv = Buffer.from(ivString, 'utf8');

    // 6. Decrypt
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(true); // PKCS7

    let decrypted: Buffer;
    try {
        decrypted = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
    } catch (e) {
        throw new Error("Decryption failed: " + (e as Error).message);
    }

    // 7. Parse Decrypted Content
    // [ContentLength (4 bytes)][Content]
    if (decrypted.length < 4) throw new Error("Decrypted content too short");
    const contentLength = decrypted.readUInt32LE(0);
    
    if (decrypted.length < 4 + contentLength) throw new Error("Decrypted content incomplete");
    
    const contentBytes = decrypted.subarray(4, 4 + contentLength);
    
    const content = unpack(contentBytes);

    return {
        header,
        content
    };
}

/**
 * Encrypts the response payload for the game client.
 * 
 * Response Structure:
 * [EncryptedData][Key] -> Base64
 * 
 * EncryptedData is:
 * AES-256-CBC([ContentLength (4 bytes)][Content (MsgPack)])
 */
export function encryptResponse(content: any, udid: string, key: Buffer): string {
    // 1. Pack Content
    const contentBuffer = pack(content);

    // 2. Prepend Length
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(contentBuffer.length, 0);
    const plainText = Buffer.concat([lengthBuffer, contentBuffer]);

    // 3. Use Provided Key
    // const key = ... (passed in)

    // 4. Derive IV
    // Same logic as request: first 16 chars of UDID hex
    const ivString = udid.substring(0, 16);
    const iv = Buffer.from(ivString, 'utf8');

    // 5. Encrypt
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    cipher.setAutoPadding(true);

    const encryptedData = Buffer.concat([cipher.update(plainText), cipher.final()]);

    // 6. Append Key
    const finalBuffer = Buffer.concat([encryptedData, key]);

    // 7. Base64 Encode
    return finalBuffer.toString('base64');
}

function generateKeyString(): string {
    let sb = "";
    for (let i = 0; i < 32; i++) {
        // Random 0-65535, format as 4-char hex
        const val = randomInt(0, 0x10000);
        sb += val.toString(16).padStart(4, '0');
    }
    
    const ascii = Buffer.from(sb, 'ascii');
    const base64 = ascii.toString('base64');
    
    // Take first 32 chars
    return base64.substring(0, 32);
}
