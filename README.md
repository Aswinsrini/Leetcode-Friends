# 🚀 LeetCode Friends – Submission Tracker

A lightweight, cost-free automation that tracks LeetCode submissions for multiple users and sends real-time notifications to a Telegram group using GitHub Actions.

No servers. No paid services. Fully automated.

---

## ✨ Features

* 👥 Track **multiple LeetCode users**
* 🔔 Get **Telegram notifications** for new submissions
* 🚫 Prevents duplicate alerts using persistent state
* ⏱ Runs automatically via **GitHub Actions (cron)**
* 💯 Zero deployment & zero hosting cost
* 🔒 Safe usage (no login, no private data)

---

## 🧠 How It Works

1. GitHub Actions runs on a scheduled cron job
2. Fetches latest submissions from public LeetCode APIs
3. Compares with previously stored state (`last_seen.json`)
4. Sends a formatted message to Telegram if a new submission is found
5. Updates and commits state back to the repository

---

## 📦 Tech Stack

* **Node.js**
* **Axios**
* **GitHub Actions**
* **Telegram Bot API**

---

## 👥 Tracked Users

```txt
godwin-jg
aswinscse
the_peaky_blinder
```

(You can add or remove users easily.)

---

## 🛠 Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Aswinsrini/Leetcode-Friends.git
cd Leetcode-Friends
```

---

### 2️⃣ Create a Telegram Bot

* Create a bot via **@BotFather**
* Copy the **Bot Token**
* Add the bot to your Telegram group and make it admin
* Get the **Chat ID**

---

### 3️⃣ Configure GitHub Secrets

Go to
**Repository → Settings → Secrets and variables → Actions**

Add:

| Name        | Description            |
| ----------- | ---------------------- |
| `BOT_TOKEN` | Telegram bot token     |
| `CHAT_ID`   | Telegram group/chat ID |

---

### 4️⃣ GitHub Actions (Already Configured)

The workflow runs automatically:

```yaml
*/10 * * * *
```

* Runs approximately every 10 minutes
* Uses concurrency control to avoid parallel runs
* Commits `last_seen.json` to prevent duplicate notifications

---

## 🗂 Persistent State

The file below stores the last processed submission per user:

```txt
last_seen.json
```

This ensures:

* No repeated notifications
* Clean tracking across workflow runs

---

## 📢 Sample Telegram Notification

```
📊 LeetCode Submission Alert
━━━━━━━━━━━━━━━━━━
👤 User: aswinscse

📝 Problem
• Two Sum

📌 Details
✅ Status: Accepted
💻 Language: Java
⏱ Runtime: 2 ms
💾 Memory: 42.1 MB

🕒 Submitted At:
• 25 Feb 2026, 10:41 AM

🔗 Submission Link
👉 https://leetcode.com/submissions/detail/123456789/
```

---

## ⚠️ Notes

* LeetCode does **not** provide official webhooks
* This project uses **public submission metadata only**
* Polling frequency is kept safe to avoid rate limiting
* GitHub cron jobs are **best-effort**, not real-time

---

## 🚧 Future Enhancements

* 🔕 Notify only on **Accepted** submissions
* 📊 Daily / weekly summary
* 🏆 Leaderboard across users
* 🤖 Telegram bot commands (`/stats`, `/leaderboard`)
* 📈 Difficulty-based stats

---

## 📄 License

MIT License

---

## 🙌 Credits

Built with ❤️ for friends who motivate each other to stay consistent on LeetCode.

## Output


![leet-friend](https://github.com/user-attachments/assets/51636b63-004d-4cbd-b990-052ce067c6cc)
