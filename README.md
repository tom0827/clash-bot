# 🏰 CoC Discord Bot

A Discord bot for tracking Clash of Clans clan participation and scoring with embeds and slash commands.

## ✨ Features

- **🎮 Discord Slash Commands**: Modern Discord integration with embeds
- **💰 Donation Scoring**: Calculate scores based on clan member donations
- **🏛️ Capital Raid Scoring**: Score members based on capital raid performance
- **⚔️ War League Scoring**: Comprehensive scoring for clan war league performance
- **🛡️ Regular War Scoring**: Score members based on regular war performance
- **🏆 Monthly Leaderboard**: Combined scoring across all categories for the current month

## 🛠️ Setup Instructions

### 1. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Go to "OAuth2" > "URL Generator"
   - Select "bot" and "applications.commands" scopes
   - Select "Send Messages", "Use Slash Commands" permissions
   - Use the generated URL to invite the bot to your server

### 2. Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables:
   ```env
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   DISCORD_GUILD_ID=your_discord_guild_id_here  # Optional: for faster testing
   COC_API_TOKEN=your_clash_of_clans_api_token_here
   ```

### 3. Installation & Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Deploy slash commands:
   ```bash
   npm run deploy
   ```

3. Start the bot:
   ```bash
   npm start
   ```

## 🎯 Discord Commands

- `/cwl-scores` - Get most recent Clan War League scores
- `/donation-scores` - Get donation scores for this current season
- `/raid-scores` - Get raid scores for most recent Clan Capital raid
- `/war-scores` - Get scores for the current regular war
- `/leaderboard` - Get combined leaderboard summing all category scores for this month
- `/war-history` - Get historical war data for the clan
- `/update-scores` - Update and save all clan scores to files
- `/help` - Show help information and commands

## 🎮 Usage Examples

```
/clan-scores #2LV0CCP9P
/player-info #98CYUGLP
/help
```

## 📊 Scoring System

### Donations
- 10,000+: 15 points
- 7,500+: 10 points
- 5,000+: 7 points
- 2,500+: 5 points
- 500+: 3 points

### Capital Raids
- 25,000+: 5 points
- 20,000+: 3 points
- 15,000+: 2 points
- 10,000+: 1 point

### War League
- Perfect stars:
   - 3+ Attacks: 30 points
   - 2 Attack2: 20 points
   - 1 Attack: 10 points
- 2+ avg stars + 80%+ destruction: 25 points
- 2+ avg stars + 70%+ destruction: 20 points
- 2+ avg stars + 60%+ destruction: 15 points
- 2+ avg stars + 50%+ destruction: 15 points
- 1+ avg stars: 5 points

### Regular Wars
- 6 stars (perfect): 3 points
- 4-5 stars: 2 points
- 2-3 stars: 1 point

### Monthly Leaderboard
The leaderboard combines scores from:
- All donation activity for the current month
- All raid activity for the current month
- All CWL activity for the current month
- All regular war activity for the current month
