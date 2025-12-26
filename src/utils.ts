import { randomInt } from "crypto";
import { FastifyRequest } from "fastify"
import { pack, unpack } from 'msgpackr';

// Needed for things like shop/reset/banners/etc.
let serverTime: Date | null = null;

/**
 * Returns the current server time as a unix epoch.
 * 
 * @param date An optional date; The date to get the time of.
 * @returns The unix epoch.
 */
export function getServerTime(
    date: Date = new Date()
): number {
    return Math.floor((serverTime ?? date).getTime() / 1000)
}

export function setServerTime(date: Date | null) {
    serverTime = date;
}

/**
 * Converts a server time value (unix epoch in seconds) into a Date.
 * 
 * @param serverTime The unix epoch value.
 * @returns The date.
 */
export function getDateFromServerTime(serverTime: number): Date {
    return new Date(serverTime * 1000)
}

/**
 * Generates a random viewer ID using the crypto library.
 * 
 * @returns A number between 100,000,000 and 999,999,999
 */
export function generateViewerId(): number {
    return randomInt(100000000, 999999999)
}

export interface DataHeaders {
    notifications?: string //wrong for now, "NotificationInfo" structure to define as it is its own object
    sid?: string //honestly unsure yet of what logic the server responds with but the client's login request is Md5({viewer_id}{udid}{static_salt}) and for every subsequent request Md5({server_sid}{static_salt}) 
    viewer_id?: number
    servertime?: number
    result_code?: number

    // depending on some requests, notably the first initializations or similar, we also can have:
    resource_version?: string
    nonce?: string
    server_list?: string //wrong as well, need "ServerList" object
}

/**
 * Generates a default data headers object, which is used in communication with the client.
 * 
 * @param customValues A partial DataHeaders object with custom fields to replace the default ones.
 * @returns A DataHeaders object.
 */
export function generateDataHeaders(
    customValues: Partial<DataHeaders> = {},
    fields: (keyof DataHeaders)[] = ['notifications', 'sid', 'viewer_id', 'servertime', 'result_code'],
): Record<string, any> {
    const defaultHeaders: DataHeaders = {
        notifications: "[]",
        sid: "",
        viewer_id: 0,
        servertime: getServerTime(),
        result_code: 1
        //don't need the rest
    }
    const headers: Record<string, any> = {}

    for (const field of fields) {
        const customValue = customValues[field]
        const defaultValue = defaultHeaders[field]
        headers[field] = customValue === undefined ? defaultValue : customValue
    }

    return headers
}

/* Client Requests Payload Format: 

 * Defines some standard / account-related components:
    * [commonHeader]: a standard header object, hard-coded in LibNative.dll - currently: "ayDiq2wxEzD3Ydc3zj8wJXUIUGZe6li2Ny+NL1dQHrNEvbcnCpBn9bY81h8VLPuYbL+/eg=="
    * [binarySid]: the session ID, encoded as a binary string.
    * [binaryUdid]: the unique device ID, encoded as a binary string.
    * [authKey]: the authentication key, used to verify the request.
    * [random32Bytes]: A random 32-byte string, used to obfuscate the request.
    --> All these form what I'll call the "payload's header", [payload_header]

 * It calculates the length's of that "payload header", which we'll note [length_bytes]

 * Then, the game forms the payload (JSON formatted to msgpack) with the following standard fields + request-specific fields:
    * "carrier",
    * "device",
    * "device_id",
    * "device_name",
    * "dmm_onetime_token",
    * "dmm_viewer_id",
    * "graphics_device_name",
    * "ip_address",
    * "keychain",
    * "locale",
    * "platform_os_version",
    * [requestSpecificFields] // any additional fields required for the sent request
    --> All these form the content, [content]

 * Then, the game encrypts the content using a randomly generated 32-byte AES-256 (Rijndael algo) encryption key (done at each request):
    * [encryptionKey]: string, created by concatenating random numbers between 0-65536 32 times and taking the first 32 characters of that result.
    * [iv]: interestingly, it's the 16 first characters of the hyphen-less Udid, so constant throughout the life of an account
    * Rijndael settings: 
        * Mode: CBC
        * Padding: PKCS7
        * KeySize: 256 bits
        * BlockSize: 128 bits
    --> Using those, the game encrypts the [content], resulting in [encrypted_content], and appends at its end the [encryptionKey]

 * Finally, we concatenate everything:
    * [prepared_payload] = [length_bytes] + [commonHeader] + [binarySid] + [binaryUdid] + [authKey] + [random32Bytes] + [encrypted_content] + [encryptionKey]
    * And then we base64-encode the [prepared_payload] to get the final payload.
    
 * [final_payload] = base64([prepared_payload]) = base64([length_bytes][commonHeader][binarySid][binaryUdid][authKey][random32Bytes][encrypted_content][encryptionKey])

 * The headers of the request sent by the client are the following:   
    * "User-Agent": "UnityPlayer/2022.3.62f2 (UnityWebRequest/1.0, libcurl/8.10.1-DEV)"
    * "Accept": "*\/*"
    * "Accept-Encoding": "deflate, gzip"
    * "X-Unity-Version": "2022.3.62f2"
    * "App-Ver": [appver]
    * "Res-Ver": [resver]
    * "Content-Type": "application/x-msgpack"
    * "Device": "2"
*/

/* Server Response Payload Format:
 
 * The server's response payload is a base64-encoded string, which is decoded and then decrypted using the same AES-256 encryption key as the client.
 * The decrypted payload is a JSON-formatted string, which is then parsed as a msgpack object.
 * The msgpack (JSON) object has the following standard fields:
    * notifications
    * sid
    * viewer_id
    * servertime
    * result_code

 * The response headers are the following:
    * "Content-Type": "application/x-msgpack"
    * "Transfer-Encoding": 
    * "Connection": "keep-alive"
    * "Date": [date]
*/