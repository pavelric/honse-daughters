import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { addPresentToAllUsers } from "../../data/honseData";
import { getServerTime } from "../../utils";
import { getMenuHtml } from "./menu";

const routes = async (fastify: FastifyInstance) => {
    fastify.get("/admin", async (request: FastifyRequest, reply: FastifyReply) => {
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Admin - Send Present</title>
                <style>
                    :root {
                        --bg: #0f1220;
                        --panel: #161a2e;
                        --border: #2a3157;
                        --text: #e6e9ff;
                        --muted: #9aa3c7;
                        --accent: #6aa0ff;
                        --accent-2: #8b73ff;
                        --danger: #ff6573;
                        --success: #5ec98b;
                        --code-bg: #0b0f22;
                    }
                    * { box-sizing: border-box }
                    html, body { height: 100% }
                    body {
                        margin: 0;
                        background: var(--bg);
                        color: var(--text);
                        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, Apple Color Emoji, Segoe UI Emoji;
                        display: flex;
                        flex-direction: column;
                    }
                    .layout {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        width: 100%;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        gap: 20px;
                    }
                    .header {
                        border-bottom: 1px solid var(--border);
                        padding-bottom: 16px;
                        margin-bottom: 16px;
                    }
                    .brand {
                        font-size: 24px;
                        font-weight: 700;
                        background: linear-gradient(90deg, var(--accent), var(--accent-2));
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .card {
                        background: var(--panel);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .form-group {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        margin-bottom: 1rem;
                    }
                    label {
                        font-weight: 600;
                        color: var(--muted);
                        font-size: 14px;
                    }
                    input, select {
                        width: 100%;
                        padding: 12px;
                        border-radius: 8px;
                        border: 1px solid var(--border);
                        background: var(--code-bg);
                        color: var(--text);
                        font-family: monospace;
                    }
                    input:focus, select:focus {
                        outline: none;
                        border-color: var(--accent);
                    }
                    .button {
                        appearance: none;
                        border: none;
                        background: linear-gradient(90deg, var(--accent), var(--accent-2));
                        color: #fff;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        align-self: flex-start;
                        transition: opacity 0.2s;
                    }
                    .button:hover { opacity: 0.9; }
                    small { color: var(--muted); font-size: 12px; }
                    a { color: var(--accent); text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                ${getMenuHtml()}
                <div class="layout">
                    <div class="header">
                        <div class="brand">Send Present</div>
                        <div style="color: var(--muted); margin-top: 4px;">Distribute gifts to all players</div>
                    </div>
                    
                    <div class="card">
                        <form action="/web/present/admin/send" method="POST">
                            <div class="form-group">
                                <label>Reward Type</label>
                                <input type="number" name="reward_type" value="90" required>
                                <small>Common types: 90 (Jewel), 43 (Support Pt), 30 (Money), 20 (Item)</small>
                            </div>
                            <div class="form-group">
                                <label>Reward ID</label>
                                <input type="number" name="reward_id" value="0" required>
                                <small>Item ID (0 for Currency)</small>
                            </div>
                            <div class="form-group">
                                <label>Quantity</label>
                                <input type="number" name="reward_count" value="150" required>
                            </div>
                            <div class="form-group">
                                <label>Message</label>
                                <input type="text" name="free_message" value="Admin Gift" required>
                            </div>
                            <div class="form-group">
                                <label>Validity (Days, 0 for unlimited)</label>
                                <input type="number" name="validity_days" value="30" required>
                            </div>
                            <button type="submit" class="button">Send Present</button>
                        </form>
                    </div>
                </div>
            </body>
            </html>
        `;
        reply.type("text/html").send(html);
    });

    fastify.post("/admin/send", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;
        const rewardType = parseInt(body.reward_type);
        const rewardId = parseInt(body.reward_id);
        const rewardCount = parseInt(body.reward_count);
        const freeMessage = body.free_message;
        const validityDays = parseInt(body.validity_days);

        let limitTime = 0;
        if (validityDays > 0) {
            limitTime = getServerTime() + (validityDays * 24 * 60 * 60);
        }

        addPresentToAllUsers(rewardId, rewardCount, rewardType, freeMessage, limitTime);

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Success</title>
                <style>
                    :root {
                        --bg: #0f1220;
                        --panel: #161a2e;
                        --border: #2a3157;
                        --text: #e6e9ff;
                        --muted: #9aa3c7;
                        --accent: #6aa0ff;
                        --accent-2: #8b73ff;
                        --success: #5ec98b;
                        --code-bg: #0b0f22;
                    }
                    * { box-sizing: border-box }
                    html, body { height: 100% }
                    body {
                        margin: 0;
                        background: var(--bg);
                        color: var(--text);
                        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, Apple Color Emoji, Segoe UI Emoji;
                        display: flex;
                        flex-direction: column;
                    }
                    .layout {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        width: 100%;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        gap: 20px;
                        align-items: center;
                        justify-content: center;
                    }
                    .card {
                        background: var(--panel);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 40px;
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                        text-align: center;
                        max-width: 500px;
                        width: 100%;
                    }
                    h1 { margin: 0; color: var(--success); }
                    p { margin: 0; color: var(--muted); line-height: 1.5; }
                    .button {
                        appearance: none;
                        border: none;
                        background: linear-gradient(90deg, var(--accent), var(--accent-2));
                        color: #fff;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        text-decoration: none;
                        display: inline-block;
                        transition: opacity 0.2s;
                    }
                    .button:hover { opacity: 0.9; }
                </style>
            </head>
            <body>
                ${getMenuHtml()}
                <div class="layout">
                    <div class="card">
                        <h1>Success!</h1>
                        <p>The present has been successfully distributed to all players.</p>
                        <div>
                            <a href='/web/present/admin' class="button">Send Another</a>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        reply.type("text/html").send(html);
    });
}

export default routes;
