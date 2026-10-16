import { gzipSync } from 'zlib'

/**
 * Builds the `race_scenario` blob that single_mode/race_start returns.
 *
 * The client never simulates a career race itself: it plays back whatever frame data the
 * server sends (Gallop.RaceSimulateReader.ImportBase64). The real server runs Cygames' race
 * simulator; we don't have one, so this decides a finishing order from a simple stat model
 * and then writes smooth, physically plausible frames that reach that order.
 *
 * Binary layout (little endian) is RaceSimulateData version 100000002, the same layout
 * RaceUtils.cs / the raceAnalyzer page decode:
 *   header      i32 header_size(=4), i32 version
 *   i32-prefixed f32 distance_diff_max, i32 horse_num, i32 horse_frame_size, i32 horse_result_size,
 *   i32 pad(0), i32 frame_count, i32 frame_size, frames..., i32 pad(0), results..., i32 pad(0),
 *   i32 event_count, events...
 * Per-frame horse data stores Speed x100 and LanePosition x10000 as ushort
 * (RaceSimulateHorseFrameData.SpeedAccuracy / LaneAccuracy in the client).
 */

const SIMULATE_DATA_VERSION = 100000002
const HORSE_FRAME_SIZE = 12   // f32 distance, u16 lane, u16 speed, u16 hp, i8 temptation, i8 block_front
const HORSE_RESULT_SIZE = 31  // see writeResult
const FRAME_INTERVAL = 1.0    // seconds between recorded frames
const FRAMES_AFTER_LAST = 2   // keep recording a little after the last horse crosses the line

export interface ScenarioHorse {
    speed: number
    stamina: number
    pow: number
    guts: number
    wiz: number
    running_style: number      // 1 nige, 2 senko, 3 sashi, 4 oikomi
    distance_aptitude: number  // the horse's proper_distance_* grade for this race (1=G .. 8=S)
    ground_aptitude: number    // proper_ground_* grade for this race
    style_aptitude: number     // proper_running_style_* grade for the style it runs
    motivation: number         // 1 (worst) .. 5 (best)
}

export interface ScenarioCourse {
    distance: number           // metres
    finish_time_min: number    // course_set finish_time_min, in 1/10000 s
    finish_time_max: number
}

export interface HorseOutcome {
    finish_order: number       // 0 = winner
    finish_time: number        // seconds
}

export interface GeneratedScenario {
    race_scenario: string      // base64(gzip(binary))
    outcomes: HorseOutcome[]   // indexed like the input horses
}

// Aptitude grade -> multiplier on effective performance. Mirrors the shape of the real
// game's aptitude coefficients (S/A ~1.0, falling off steeply below C) without claiming
// to be the exact values.
const APTITUDE_COEF = [0, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0, 1.05]
const MOTIVATION_COEF = [0, 0.96, 0.98, 1.0, 1.02, 1.04]

export function generateRaceScenario(course: ScenarioCourse, horses: ScenarioHorse[], seed: number): GeneratedScenario {
    const rng = mulberry32(seed)
    const n = horses.length

    // 1. Decide the finishing order.
    const scores = horses.map(h => performanceScore(h, course.distance) * (0.92 + rng() * 0.16))
    const order = scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s).map(x => x.i)

    // 2. Finish times: the winner lands inside the course's real min/max window, scaled by how
    //    strong the field's best is; everyone after trails by a plausible margin.
    const tMin = course.finish_time_min / 10000
    const tMax = course.finish_time_max / 10000
    const best = scores[order[0]]
    const strength = clamp((best - 600) / 2400, 0, 1)
    const finishTimes = new Array<number>(n)
    let t = tMax - (tMax - tMin) * strength
    for (let pos = 0; pos < n; pos++) {
        const i = order[pos]
        if (pos > 0) {
            const gap = (scores[order[pos - 1]] - scores[i]) / Math.max(1, best)
            t += 0.05 + clamp(gap * 6, 0, 1.2) + rng() * 0.12
        }
        finishTimes[i] = t
    }

    // 3. Per-horse progress curve: g(x) = x + c·x·(1-x) is monotone for |c| < 1, front-runners
    //    (c > 0) lead early, closers (c < 0) come late. Every horse hits the line exactly at
    //    its finish time, so the playback always agrees with the decided order.
    const curve = horses.map(h => ({ 1: 0.35, 2: 0.15, 3: -0.1, 4: -0.3 } as Record<number, number>)[h.running_style] ?? 0)
    const startDelay = horses.map(() => 0.02 + rng() * 0.08)
    const lastFinish = Math.max(...finishTimes)
    const frameCount = Math.ceil(lastFinish / FRAME_INTERVAL) + FRAMES_AFTER_LAST + 1
    const maxHp = horses.map(h => Math.round(course.distance + h.stamina * 0.8))

    const distanceAt = (i: number, time: number) => {
        const T = finishTimes[i]
        const d0 = startDelay[i]
        if (time <= d0) return 0
        if (time >= T) {
            // past the line: keep moving at the finishing speed so the camera has something to show
            return course.distance + (time - T) * finishSpeed(i)
        }
        const x = (time - d0) / (T - d0)
        return course.distance * (x + curve[i] * x * (1 - x))
    }
    const finishSpeed = (i: number) => {
        const T = finishTimes[i] - startDelay[i]
        return course.distance / T * (1 - curve[i])
    }

    const frames: Buffer[] = []
    let distanceDiffMax = 0
    for (let f = 0; f < frameCount; f++) {
        const time = f * FRAME_INTERVAL
        const buf = Buffer.alloc(4 + HORSE_FRAME_SIZE * n)
        buf.writeFloatLE(time, 0)
        const ds = horses.map((_, i) => distanceAt(i, time))
        // rank by distance at this instant to lay horses out across the track
        const byPos = ds.map((d, i) => ({ d, i })).sort((a, b) => b.d - a.d)
        const rankNow = new Array<number>(n)
        byPos.forEach((x, r) => { rankNow[x.i] = r })
        const running = ds.filter((d, i) => time < finishTimes[i])
        if (running.length > 1) distanceDiffMax = Math.max(distanceDiffMax, Math.max(...running) - Math.min(...running))

        for (let i = 0; i < n; i++) {
            const o = 4 + i * HORSE_FRAME_SIZE
            const v = (distanceAt(i, time + 0.05) - distanceAt(i, Math.max(0, time - 0.05))) / (time < 0.05 ? 0.05 : 0.1)
            // gate spread at the start, then horses settle toward the rail in running order
            const startLane = 0.03 + i * 0.045
            const settled = 0.02 + (rankNow[i] % 6) * 0.06 + Math.floor(rankNow[i] / 6) * 0.02
            const blend = clamp(time / 15, 0, 1)
            const lane = startLane * (1 - blend) + settled * blend
            const hp = Math.max(0, maxHp[i] * (1 - Math.min(1, time / finishTimes[i]) * 0.9))
            buf.writeFloatLE(ds[i], o)
            buf.writeUInt16LE(clamp(Math.round(lane * 10000), 0, 65535), o + 4)
            buf.writeUInt16LE(clamp(Math.round(v * 100), 0, 65535), o + 6)
            buf.writeUInt16LE(clamp(Math.round(hp), 0, 65535), o + 8)
            buf.writeInt8(0, o + 10)   // temptation_mode: none
            buf.writeInt8(-1, o + 11)  // block_front_horse_index: BLOCK_HORSEINDEX_NULL
        }
        frames.push(buf)
    }

    // 4. Results
    const winnerTime = finishTimes[order[0]]
    const gutsOrder = rankOf(horses.map(h => h.guts))
    const wizOrder = rankOf(horses.map(h => h.wiz))
    const results: Buffer[] = []
    const outcomes: HorseOutcome[] = new Array(n)
    for (let i = 0; i < n; i++) {
        const finishOrder = order.indexOf(i)
        outcomes[i] = { finish_order: finishOrder, finish_time: finishTimes[i] }
        const r = Buffer.alloc(HORSE_RESULT_SIZE)
        let o = 0
        r.writeInt32LE(finishOrder, o); o += 4
        r.writeFloatLE(finishTimes[i], o); o += 4
        r.writeFloatLE(finishTimes[i] - winnerTime, o); o += 4
        r.writeFloatLE(startDelay[i], o); o += 4
        r.writeUInt8(gutsOrder[i], o); o += 1
        r.writeUInt8(wizOrder[i], o); o += 1
        r.writeFloatLE(course.distance * 2 / 3, o); o += 4   // last_spurt_start_distance
        r.writeUInt8(horses[i].running_style, o); o += 1
        r.writeInt32LE(0, o); o += 4                          // defeat: none
        r.writeFloatLE(finishTimes[i], o); o += 4             // finish_time_raw
        results.push(r)
    }

    // 5. Assemble
    const head = Buffer.alloc(8 + 4 * 5 + 4 * 2)
    let o = 0
    head.writeInt32LE(4, o); o += 4                       // header size (version field only)
    head.writeInt32LE(SIMULATE_DATA_VERSION, o); o += 4
    head.writeFloatLE(distanceDiffMax, o); o += 4
    head.writeInt32LE(n, o); o += 4
    head.writeInt32LE(HORSE_FRAME_SIZE, o); o += 4
    head.writeInt32LE(HORSE_RESULT_SIZE, o); o += 4
    head.writeInt32LE(0, o); o += 4                       // padding 1
    head.writeInt32LE(frameCount, o); o += 4
    head.writeInt32LE(4 + HORSE_FRAME_SIZE * n, o); o += 4
    const pad = Buffer.alloc(4)                           // padding 2 / 3 (size 0)
    const eventCount = Buffer.alloc(4)                    // no skill / event records
    const raw = Buffer.concat([head, ...frames, pad, ...results, pad, eventCount])

    return { race_scenario: gzipSync(raw).toString('base64'), outcomes }
}

/** Rough "how well does this horse run this distance" number, ~600 (debut) to ~3000+ (finals). */
export function performanceScore(h: ScenarioHorse, distance: number): number {
    const staminaNeed = clamp((distance - 1200) / 2400, 0, 1)            // sprint 0 .. long 1
    const raw = h.speed * 1.0
        + h.stamina * (0.25 + 0.6 * staminaNeed)
        + h.pow * 0.55
        + h.guts * (0.2 + 0.2 * staminaNeed)
        + h.wiz * 0.35
    const apt = APTITUDE_COEF[clamp(h.distance_aptitude, 1, 8)]
        * Math.sqrt(APTITUDE_COEF[clamp(h.ground_aptitude, 1, 8)])
        * Math.sqrt(APTITUDE_COEF[clamp(h.style_aptitude, 1, 8)])
    return raw * apt * MOTIVATION_COEF[clamp(h.motivation, 1, 5)]
}

function rankOf(values: number[]): number[] {
    const sorted = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v)
    const out = new Array<number>(values.length)
    sorted.forEach((x, r) => { out[x.i] = r })
    return out
}

export function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6D2B79F5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v))
}
