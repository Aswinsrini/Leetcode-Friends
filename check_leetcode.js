const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load .env

const USERNAMES = [
    "godwin-jg",
    "aswinscse",
    "the_peaky_blinder"
];

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const POLL_INTERVAL = (process.env.POLL_INTERVAL || 60) * 1000;

const STORE_PATH = path.join(__dirname, "last_seen.json");

/* ---------------- LOAD / SAVE STATE ---------------- */

function loadLastSeen() {
    if (!fs.existsSync(STORE_PATH)) return {};
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
}

function saveLastSeen(data) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

let lastSeenMap = loadLastSeen();

/* ---------------- FORMAT MESSAGE ---------------- */

function formatSubmission(username, sub) {
    const date = new Date(sub.timestamp * 1000);
    const formattedDate = date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
    });

    const statusEmoji = sub.statusDisplay === "Accepted" ? "✅" : "❌";

    return [
        `📊 *LeetCode Submission Alert*`,
        `━━━━━━━━━━━━━━━━━━`,
        `👤 *User:* \`${username}\``,
        ``,
        `📝 *Problem*`,
        `• ${sub.title}`,
        ``,
        `📌 *Details*`,
        `${statusEmoji} *Status:* ${sub.statusDisplay}`,
        `💻 *Language:* ${sub.langName}`,
        ...(sub.runtime && sub.runtime !== "N/A" ? [`⏱ *Runtime:* ${sub.runtime}`] : []),
        ...(sub.memory && sub.memory !== "N/A" ? [`💾 *Memory:* ${sub.memory}`] : []),
        ``,
        `🕒 *Submitted At:*`,
        `• ${formattedDate}`,
        ``,
        `🔗 *Submission Link*`,
        `👉 https://leetcode.com${sub.url}`,
    ].join("\n");
}

/* ---------------- TELEGRAM ---------------- */

async function sendMessage(text) {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
    });
}

/* ---------------- CHECK USER ---------------- */

async function checkUser(username) {
    try {
        const { data } = await axios.get(
            `https://leetcode-api-pied.vercel.app/user/${username}/submissions`
        );

        if (!data || data.length === 0) return;

        const latest = data[0];

        // New submission
        if (latest.id !== lastSeenMap[username]) {
            lastSeenMap[username] = latest.id;
            saveLastSeen(lastSeenMap);

            const message = formatSubmission(username, latest);
            await sendMessage(message);

            console.log(`✅ ${username}: New submission notified`);
        }
    } catch (err) {
        console.error(`❌ ${username}:`, err.message);
    }
}

/* ---------------- START ---------------- */

async function start() {
    console.log("🚀 LeetCode Multi-User Tracker Started");
    console.log(`👥 Users: ${USERNAMES.join(", ")}`);
    console.log(`⏱ Poll interval: ${POLL_INTERVAL / 1000}s\n`);

    // Initial baseline
    for (const user of USERNAMES) {
        await checkUser(user);
    }

    // Poll continuously
    setInterval(() => {
        USERNAMES.forEach(checkUser);
    }, POLL_INTERVAL);
}

start();