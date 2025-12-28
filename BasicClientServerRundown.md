## Client Requests Payload Format: 

 * Defines some standard / account-related components:
    * [commonHeader]: a standard header object, hard-coded in LibNative.dll - currently: "ayDiq2wxEzD3Ydc3zj8wJXUIUGZe6li2Ny+NL1dQHrNEvbcnCpBn9bY81h8VLPuYbL+/eg=="
    * [binarySid]: the session ID, encoded as a binary string.
    * [binaryUdid]: the unique device ID, encoded as a binary string.
    * [authKey]: the authentication key, used to verify the request (simply omitted before /tool/).
    * [random32Bytes]: A random 32-byte string, used to obfuscate the request.
    --> All these form what I'll call the "payload's header", [payload_header]

 * It calculates the length's of that "payload header", which we'll note [length_bytes], coded on 4 bytes (little-endian).

 * Then, the game forms the payload (JSON formatted to msgpack) with the following standard fields + request-specific fields:,
    * [requestSpecificFields], // any fields required for the sent request
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
    * "platform_os_version"
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

## Server Response Payload Format:
 
 * The server's response payload is a base64-encoded string, which is decoded and then decrypted using the same AES-256 encryption key as the client.

 * Assumption for decrypting the request payload (based on how it should work):
    * Decode Base64: it receives the string and decodes it back to raw bytes ([prepared_payload]).
    * Read Header Length: it reads the first 4 bytes ([length_bytes]).
    * Parse Header (Plaintext): it reads the number of bytes specified by [length_bytes]. This gives it the [payload_header].
    * Extract UDID: it parses the [payload_header] to extract the [binaryUdid].
        * Now the server has the UDID. (Note: it should be at offset 72, after the length (4), the commonHeader (52), and the Sid (16))
    * Derive IV: it converts that UDID to a hyphen-less string and takes the first 16 characters to generate the IV.
    * Extract Key: it looks at the very end of the payload to grab the appended [encryptionKey].
    * Decrypt: now it has the Key (from the last 32 bytes of the base64-decoded payload), the IV (derived from the header), and the Ciphertext ([encrypted_content]). It can now decrypt the body.

 * The decrypted payload is a JSON-formatted string, which is then parsed as a msgpack object.
 * The response object has the following standard fields:
    * data
    * data_headers:
        * notifications
        * result_code
        * servertime 
        * sid
        * viewer_id
    * response_code
    --> We'll note this as [response_content]
 * It calculates the length's of that content, which we'll note [response_length], coded on 4 bytes (little-endian).
 
 * The response object is then encrypted using the same AES-256 encryption key as the client, with the same settings as described above,
 this is noted as [encrypted_response_content]
 * The prepared response payload is then: [prepared_response_payload] = [response_length] + [encrypted_response_content] + [encryptionKey]
 * The encrypted payload is then base64-encoded to get the final response payload, which gives us:
 [final_response_payload] = base64([prepared_response_payload])

 * The response's headers are the following:
    * "Content-Type": "application/x-msgpack"
    * "Transfer-Encoding": 
    * "Connection": "keep-alive"
    * "Date": [date]
 * The response is then sent to the client


Read more: https://lacavapav.wordpress.com/2025/10/29/from-wanting-to-track-numbers-to-reverse-engineering-a-game-api-real-quick/

```csharp
public static byte[] Hex2bin(string content)
{
    return Enumerable.Range(0, content.Length / 2).Select(i => byte.Parse(content[(2 * i)..(2 * i + 2)], NumberStyles.AllowHexSpecifier)).ToArray();
}
public static string Bin2Hex(byte[] content)
{
    return string.Concat(content.Select(x => x.ToString("x2")));
}

public static byte[] MakeMd5(string content)
{
    using MD5 md5 = MD5.Create();
    return md5.ComputeHash(Encoding.UTF8.GetBytes(content + "co!=Y;(UQCGxJ_n82")); // stepped a few hundred times from get_sessionId to find that bitch
    // SID are like that:
        // 1st SID generated is : MD5("{viewer_id}{udid}co!=Y;(UQCGxJ_n82") (without the brackets, all 3 values concatenated)
        // Subsequent SIDs are generated by: MD5("{server_sid}co!=Y;(UQCGxJ_n82") (without the brackets)
}

public string CompressRequest(byte[] header, byte[] content)
{
    if (!crypt) return Convert.ToBase64String(header.Concat(content).ToArray());
    if (header == null || content == null) throw new ArgumentException("Header or content is null.");

    // Based on disassembled Gallop::HttpHelper::CompressRequest: in Clean_Disassembled_GameFunctions.c
    // The header passed in should already contain: [commonHeader][binarySid][binaryUdid][authKey][random32Bytes]
    // We need to prepend the total length of these components as 4 bytes
    
    byte[] lengthBytes = BitConverter.GetBytes(header.Length);
    Console.WriteLine($"[SimpleLz4Frame] Header length bytes: {BitConverter.ToString(lengthBytes)}");
    
    byte[] encryptedWithKey = EncryptAESRJ256(content);
    Console.WriteLine($"[SimpleLz4Frame] Content encrypted with key, length: {encryptedWithKey.Length}");
    
    // Final layout based on disassembled code: [length_bytes][header_components][encrypted_content_with_key]
    // This matches: v23 = System::Linq::Enumerable::Concat::byte(v19, v21, qword_7FFA1935AFB8);
    byte[] final = new byte[lengthBytes.Length + header.Length + encryptedWithKey.Length];
    int offset = 0;
    
    Array.Copy(lengthBytes, 0, final, offset, lengthBytes.Length);
    offset += lengthBytes.Length;
    
    Array.Copy(header, 0, final, offset, header.Length);
    offset += header.Length;
    
    Array.Copy(encryptedWithKey, 0, final, offset, encryptedWithKey.Length);

    Console.WriteLine($"[SimpleLz4Frame] Final payload constructed, total length: {final.Length}");
    Console.WriteLine($"[SimpleLz4Frame] Structure: length({lengthBytes.Length}) + header({header.Length}) + encrypted({encryptedWithKey.Length})");
    
    string resultB64 = Convert.ToBase64String(final);

    if (dbg)
    {
        try
        {
            Console.WriteLine($"[VERIFICATION] Starting payload verification...");
            //VerifyPayload(resultB64, header, content);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[VERIFICATION ERROR] Failed to verify payload: {ex.Message}");
            Console.WriteLine($"[VERIFICATION ERROR] Stack trace: {ex.StackTrace}");
        }
    }

    return resultB64;
}


private byte[] EncryptAESRJ256(byte[] data)
{
    Console.WriteLine($"[EncryptAESRJ256] Starting encryption for data length: {data.Length}");
    
    using (var rijndael = new RijndaelManaged())
    {
        rijndael.Mode = CipherMode.CBC;
        rijndael.Padding = PaddingMode.PKCS7;
        rijndael.KeySize = 256;
        rijndael.BlockSize = 128;

        string keyString = GenerateKeyString();
        if (dbg) Console.WriteLine($"[EncryptAESRJ256] Generated key string: {keyString}");
        
        byte[] keyBytes = Encoding.UTF8.GetBytes(keyString);

        // iv is first 16 characters of udid
        string ivString = GetIvStringFromUdid();
        byte[] iv = Encoding.UTF8.GetBytes(ivString);
        Console.WriteLine($"[EncryptAESRJ256] IV string: {ivString}, IV bytes length: {iv.Length}");

        rijndael.Key = keyBytes;
        rijndael.IV = iv;

        // Prepend data length (4 bytes) to data
        byte[] lengthBytes = BitConverter.GetBytes(data.Length);
        byte[] dataWithLength = new byte[4 + data.Length];
        Array.Copy(lengthBytes, 0, dataWithLength, 0, 4);
        Array.Copy(data, 0, dataWithLength, 4, data.Length);
        Console.WriteLine($"[EncryptAESRJ256] Data with length prefix: {dataWithLength.Length} bytes");

        // Encrypt the length-prefixed data
        using (var encryptor = rijndael.CreateEncryptor())
        using (var msEncrypt = new MemoryStream())
        using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
        {
            csEncrypt.Write(dataWithLength, 0, dataWithLength.Length);
            csEncrypt.FlushFinalBlock();
            
            byte[] encryptedData = msEncrypt.ToArray();
            Console.WriteLine($"[EncryptAESRJ256] Encrypted data length: {encryptedData.Length}");

            // Return [encrypted_data][key_bytes] as per game's logic
            byte[] result = new byte[encryptedData.Length + keyBytes.Length];
            Array.Copy(encryptedData, 0, result, 0, encryptedData.Length);
            Array.Copy(keyBytes, 0, result, encryptedData.Length, keyBytes.Length);
            
            Console.WriteLine($"[EncryptAESRJ256] Final result length: {result.Length} (encrypted: {encryptedData.Length} + key: {keyBytes.Length})");
            return result;
        }
    }
}

/*
 * AES RJ256 response decoder
 */
public byte[] DecompressResponse(string src) {
    if (!crypt) return Convert.FromBase64String(src);
    if (string.IsNullOrEmpty(src)) throw new ArgumentException("src is null or empty");

    byte[] responseData = Convert.FromBase64String(src);
    if (responseData.Length < 32) throw new Exception("Response too short to contain AES key");

    // Split key (last 32 bytes) and ciphertext (rest)
    const int keyLen = 32;
    byte[] key = new byte[keyLen];
    Array.Copy(responseData, responseData.Length - keyLen, key, 0, keyLen);
    byte[] cipher = new byte[responseData.Length - keyLen];
    Array.Copy(responseData, 0, cipher, 0, cipher.Length);

    // IV from UDID
    string ivStr = GetIvStringFromUdid();
    byte[] iv = Encoding.UTF8.GetBytes(ivStr);

    byte[] plain;
    using (var rij = new RijndaelManaged { Mode = CipherMode.CBC, Padding = PaddingMode.PKCS7, KeySize = 256, BlockSize = 128 })
    using (var ms = new MemoryStream())
    using (var cs = new CryptoStream(ms, rij.CreateDecryptor(key, iv), CryptoStreamMode.Write))
    {
        cs.Write(cipher, 0, cipher.Length);
        cs.FlushFinalBlock();
        plain = ms.ToArray();
    }

    if (plain.Length < 4) throw new Exception("Decrypted response too short to contain length");
    int payloadLen = BitConverter.ToInt32(plain, 0);
    if (payloadLen < 0 || payloadLen > plain.Length - 4)
        throw new Exception($"Invalid payload length after decryption: {payloadLen}, decryptedLen={plain.Length}");

    byte[] payload = new byte[payloadLen];
    Array.Copy(plain, 4, payload, 0, payloadLen);
    if (dbg)
    {
        Console.WriteLine($"[AES] Decrypted response payload length: {payload.Length}");
        //Console.WriteLine($"[AES] Decrypted response payload (base64): {Convert.ToBase64String(payload)}");
    }
    return payload;
}

// Helpers
private string GetIvStringFromUdid()
{
    if (string.IsNullOrEmpty(Udid))
        throw new InvalidOperationException("Udid is not set on SimpleLz4Frame; set it before calling crypto methods.");
    string udidHex = Udid.Replace("-", "");
    if (udidHex.Length < 16)
        throw new InvalidOperationException($"UDID hex too short: {udidHex}");
    return udidHex.Substring(0, 16);
}

private byte[] DecryptAESRJ256(byte[] encryptedData)
{
    try
    {
        // Extract the key (last 32 bytes)
        if (encryptedData.Length < 32)
        {
            throw new ArgumentException("Encrypted data too short to contain key");
        }
        
        byte[] key = new byte[32];
        Array.Copy(encryptedData, encryptedData.Length - 32, key, 0, 32);
        
        // Extract the encrypted content (everything except the last 32 bytes)
        byte[] encryptedContent = new byte[encryptedData.Length - 32];
        Array.Copy(encryptedData, 0, encryptedContent, 0, encryptedContent.Length);
        
        Console.WriteLine($"[DECRYPT] Key length: {key.Length}, Encrypted content length: {encryptedContent.Length}");
        Console.WriteLine($"[DECRYPT] Key (first 16 bytes): {BitConverter.ToString(key.Take(16).ToArray())}");
        
        // Get UDID and create IV (first 16 characters) - must match encryption
        string ivString = GetIvStringFromUdid();
        byte[] iv = Encoding.UTF8.GetBytes(ivString);
        Console.WriteLine($"[DECRYPT] IV string: {ivString}, IV bytes length: {iv.Length}");
        
        // Decrypt using RijndaelManaged with CBC mode (same as encryption)
        using (var rijndael = new RijndaelManaged())
        {
            rijndael.Mode = CipherMode.CBC;  // Must match encryption mode
            rijndael.Padding = PaddingMode.PKCS7;
            rijndael.KeySize = 256;
            rijndael.BlockSize = 128;
            rijndael.Key = key;
            rijndael.IV = iv;
            
            using (var decryptor = rijndael.CreateDecryptor())
            {
                byte[] decrypted = decryptor.TransformFinalBlock(encryptedContent, 0, encryptedContent.Length);
                Console.WriteLine($"[DECRYPT] Decrypted length: {decrypted.Length}");
                
                // The decrypted data should start with 4-byte length prefix
                if (decrypted.Length >= 4)
                {
                    int contentLength = BitConverter.ToInt32(decrypted, 0);
                    Console.WriteLine($"[DECRYPT] Content length from prefix: {contentLength}");
                    
                    if (contentLength + 4 <= decrypted.Length)
                    {
                        // Extract the actual content (skip the 4-byte length prefix)
                        byte[] actualContent = new byte[contentLength];
                        Array.Copy(decrypted, 4, actualContent, 0, contentLength);
                        return actualContent;
                    }
                }
                
                return decrypted;
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[DECRYPT ERROR] Failed to decrypt: {ex.Message}");
        throw;
    }
}

private static string GenerateKeyString()
{
    // Based on disassembled Gallop::Cryptographer::GenerateKeyString
    // Generates 32 random 4-char hex values, concatenates them, converts to ASCII, then base64
    var sb = new StringBuilder();
    var rand = new Random();
    
    for (int i = 0; i < 32; i++)
    {
        // Generate random value between 0 and 0xFFFF (65535) and format as 4-char lowercase hex
        // The disassembled code uses: v11 = (*(*v3 + 384LL))(v3, 0LL, 0xFFFFLL, *(*v3 + 392LL));
        int randomValue = rand.Next(0, 0x10000);
        sb.Append(string.Format("{0:x4}", randomValue));
    }
    
    // Convert the hex string to ASCII bytes, then to base64, then take first 32 chars
    // This matches: v8 = (*(*v6 + 592LL))(v6, v7, *(*v6 + 600LL)); (ASCII encoding)
    // Then: v9 = System::Convert::ToBase64String(v8, 0LL);
    // Finally: return System::String::Substring(v9, 0LL, 32LL);
    // check Clean_Disassembled_GameFunctions.c
    var hexString = sb.ToString();
    var ascii = Encoding.ASCII.GetBytes(hexString);
    var base64 = Convert.ToBase64String(ascii);
    
    if (base64.Length < 32)
        throw new InvalidOperationException($"Generated base64 string too short: {base64.Length} < 32");
        
    return base64.Substring(0, 32);
}

```