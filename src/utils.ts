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

export function formatTimestamp(date: Date = new Date()): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

export function formatServerTimestamp(): string {
    return formatTimestamp(getDateFromServerTime(getServerTime()))
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
    notifications?: NotificationInfo
    sid?: string //honestly unsure yet of what logic the server responds with but the client's login request is Md5({viewer_id}{udid}{static_salt}) and for every subsequent request Md5({server_sid}{static_salt}) 
    viewer_id?: number
    servertime?: number
    result_code?: number

    // depending on some requests, notably the first initializations or similar, we also can have:
    resource_version?: string
    nonce?: string
    server_list?: any // "ServerList" object or string URL
}

export interface NotificationInfo {
    unread_information_exists?: number
    add_present_num?: number,
    room_match_race_result_num?: number,
}

export interface RequestCommon {
    viewer_id: number
}

/**
 * Generates a default data headers object, which is used in communication with the client.
 * 
 * @param customValues A partial DataHeaders object with custom fields to replace the default ones.
 * @returns A DataHeaders object.
 */
export function generateDataHeaders(
    customValues: Partial<DataHeaders> = {},
    fields: (keyof DataHeaders)[] = ['notifications', 'sid', 'viewer_id', 'servertime', 'result_code', 'server_list'],
): Record<string, any> {
    const defaultHeaders: DataHeaders = {
        notifications: {
        "unread_information_exists": 1
        },
        servertime: getServerTime(),
        result_code: 1,
        sid: "",
        viewer_id: 0
        //don't need the rest
    }
    const headers: Record<string, any> = {}

    for (const field of fields) {
        const customValue = customValues[field]
        const defaultValue = defaultHeaders[field]
        const value = customValue === undefined ? defaultValue : customValue
        
        if (value !== undefined) {
            headers[field] = value
        }
    }

    return headers
}

