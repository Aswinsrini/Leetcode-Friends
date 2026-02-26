const axios = require("axios");
require("dotenv").config();

const USERNAMES = ["godwin-jg", "aswinscse", "the_peaky_blinder"];

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const API_BASE = "https://leetcode-api-pied.vercel.app";

/* ─────────────── HELPERS ─────────────── */

/**
 * Get the start and end timestamps for "today" in IST (UTC+5:30).
 */
function getTodayRangeIST() {
    const now = new Date();

    // Convert current time to IST
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffsetMs);

    // Start of today in IST (midnight IST in UTC)
    const istMidnight = new Date(
        Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())
    );
    const todayStartUTC = new Date(istMidnight.getTime() - istOffsetMs);

    // End of today = start of tomorrow
    const todayEndUTC = new Date(todayStartUTC.getTime() + 24 * 60 * 60 * 1000);

    return {
        start: Math.floor(todayStartUTC.getTime() / 1000),
        end: Math.floor(todayEndUTC.getTime() / 1000),
    };
}

/**
 * Format today's date in a readable way (IST).
 */
function getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

/* ─────────────── DIFFICULTY EMOJIS ─────────────── */

const DIFFICULTY_EMOJI = {
    Easy: "🟢",
    Medium: "🟡",
    Hard: "🔴",
};

const DIFFICULTY_LABEL = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
};

/* ─────────────── FETCH DATA ─────────────── */

/**
 * Fetch recent submissions for a user.
 */
async function fetchSubmissions(username) {
    try {
        const { data } = await axios.get(`${API_BASE}/user/${username}/submissions`);
        return data || [];
    } catch (err) {
        console.error(`❌ Failed to fetch submissions for ${username}:`, err.message);
        return [];
    }
}

/**
 * Fetch problem details (including difficulty) by titleSlug.
 */
async function fetchProblemDifficulty(titleSlug) {
    try {
        const { data } = await axios.get(`${API_BASE}/${titleSlug}`);
        return data?.difficulty || "Unknown";
    } catch {
        return "Unknown";
    }
}

/* ─────────────── PROCESS USER ─────────────── */

/**
 * Get today's accepted submissions for a user (deduplicated by problem).
 */
async function getTodaySummary(username) {
    const submissions = await fetchSubmissions(username);
    const { start, end } = getTodayRangeIST();

    // Filter: today + accepted only
    const todaySubs = submissions.filter(
        (sub) =>
            sub.timestamp >= start &&
            sub.timestamp < end &&
            sub.statusDisplay === "Accepted"
    );

    // Deduplicate by titleSlug (keep the latest per problem)
    const seen = new Map();
    for (const sub of todaySubs) {
        const slug = sub.titleSlug || sub.title.toLowerCase().replace(/\s+/g, "-");
        if (!seen.has(slug)) {
            seen.set(slug, sub);
        }
    }

    // Fetch difficulty for each unique problem
    const problems = [];
    for (const [slug, sub] of seen) {
        const difficulty = await fetchProblemDifficulty(slug);
        problems.push({
            title: sub.title,
            titleSlug: slug,
            difficulty,
            url: sub.url || `/submissions/detail/${sub.id}/`,
            timestamp: sub.timestamp,
        });
    }

    // Sort by timestamp (earliest first)
    problems.sort((a, b) => a.timestamp - b.timestamp);

    return problems;
}

/* ─────────────── FORMAT MESSAGE ─────────────── */

function formatSummaryMessage(userSummaries) {
    const dateStr = getFormattedDate();
    const lines = [];

    lines.push(`📋 *LeetCode Daily Summary*`);
    lines.push(`📅 ${dateStr}`);
    lines.push(``);

    let groupTotal = 0;
    let groupEasy = 0;
    let groupMedium = 0;
    let groupHard = 0;

    for (const { username, problems } of userSummaries) {
        lines.push(`━━━━━━━━━━━━━━━━━━━━`);
        lines.push(``);
        lines.push(`👤 *${username}*`);

        if (problems.length === 0) {
            lines.push(`😴 No submissions today`);
            lines.push(``);
            continue;
        }

        const easy = problems.filter((p) => p.difficulty === "Easy").length;
        const medium = problems.filter((p) => p.difficulty === "Medium").length;
        const hard = problems.filter((p) => p.difficulty === "Hard").length;
        const total = problems.length;

        groupTotal += total;
        groupEasy += easy;
        groupMedium += medium;
        groupHard += hard;

        lines.push(`🧩 *Solved Today:* ${total}`);
        lines.push(`🟢 Easy: ${easy}  •  🟡 Medium: ${medium}  •  🔴 Hard: ${hard}`);
        lines.push(``);

        for (const p of problems) {
            const emoji = DIFFICULTY_EMOJI[p.difficulty] || "⚪";
            const link = `https://leetcode.com/problems/${p.titleSlug}/`;
            lines.push(`  ✅ *${p.title}* ${emoji}`);
            lines.push(`       🔗 [View Problem](${link})`);
        }

        lines.push(``);
    }

    // Group stats
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(``);
    lines.push(`🏆 *Group Stats*`);
    lines.push(`🧩 *Total Solved:* ${groupTotal}`);
    lines.push(`🟢 ${groupEasy}  •  🟡 ${groupMedium}  •  🔴 ${groupHard}`);
    lines.push(``);

    // Motivational footer
    if (groupTotal === 0) {
        lines.push(`😤 No one solved today! Let's bounce back tomorrow! 💥`);
    } else if (groupTotal >= 5) {
        lines.push(`🔥 Amazing day! ${groupTotal} problems crushed! Keep it up! 💪`);
    } else {
        lines.push(`💪 Keep grinding! Consistency is key! 🔑`);
    }

    return lines.join("\n");
}

/* ─────────────── TELEGRAM ─────────────── */

async function sendMessage(text) {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
    });
}

/* ─────────────── MAIN ─────────────── */

async function main() {
    console.log("📋 Daily Summary Generator Started");
    console.log(`👥 Users: ${USERNAMES.join(", ")}`);

    const userSummaries = [];

    for (const username of USERNAMES) {
        console.log(`🔍 Fetching data for ${username}...`);
        const problems = await getTodaySummary(username);
        console.log(`   → ${problems.length} problem(s) solved today`);
        userSummaries.push({ username, problems });
    }

    const message = formatSummaryMessage(userSummaries);

    console.log("\n--- Preview ---");
    console.log(message);
    console.log("--- End Preview ---\n");

    await sendMessage(message);
    console.log("✅ Daily summary sent to Telegram!");
}

main().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
});
