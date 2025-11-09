# Discord Ticket Bot

## Overview
A Discord bot designed for ticket management with custom commands for channel renaming and automated timer reminders.

## Current State
The bot is fully functional and running. It responds to five custom commands with the prefix `?`:
- `?lang` - Formats channel rename commands
- `?dispute` - Formats dispute rename commands with ⚠️ emoji
- `?timer_2d` - Sets a 2-day reminder with embedded message
- `?timer_7d` - Sets a 7-day reminder with embedded message
- `?timer` - Shows remaining time of active timers in the channel

## Recent Changes
- **2025-11-09**: Added ?timer command to check remaining time of active timers
- **2025-11-09**: Added auto-deletion of command messages after 3 seconds
- **2025-11-09**: Initial bot implementation with all four commands
- Configured Discord.js v14 with proper intents for message reading
- Implemented node-schedule for timer functionality
- Set up workflow to run the bot automatically

## Project Architecture

### File Structure
```
├── bot.js           # Main bot code with all command handlers
├── package.json     # Node.js dependencies (discord.js, node-schedule)
├── .gitignore       # Excludes node_modules and secrets
└── replit.md        # Project documentation
```

### Dependencies
- **discord.js**: Discord API wrapper for bot functionality
- **node-schedule**: Scheduling library for timer reminders

### Commands

#### ?lang
- Takes everything after `lang` as arguments
- Retrieves current channel name
- Outputs: `$rename <CapitalizedChannelName>-<arguments>`
- Example: `?lang test` in channel `ticket-1234` → `$rename Ticket-1234-test`

#### ?dispute
- Requires exactly 3 arguments
- Outputs: `$rename <arg1> <arg2> ⚠️ <arg3>`
- Example: `?dispute Ticket 1234 Test` → `$rename Ticket 1234 ⚠️ Test`

#### ?timer_2d
- Sends an embedded message with ticket pending status
- Displays date 2 days in the future
- Schedules a reminder ping after 2 days
- Status: "Ingame Contact 48 h"

#### ?timer_7d
- Sends an embedded message with ticket pending status
- Displays date 7 days in the future
- Schedules a reminder ping after 7 days
- Status: "Login restriction 7d"

#### ?timer
- Shows remaining time of active timers in the current channel
- Displays time in days, hours, minutes, and seconds
- If no active timers: "Here is no active Timer."
- Example output: "⏰ Active Timer: 1 day 23 hours 45 minutes remaining"

## Environment Variables
- `DISCORD_TOKEN`: Bot authentication token (required)

## Technical Notes
- Bot uses MESSAGE CONTENT INTENT to read message content
- Timers are stored in memory using a Map structure
- All commands include error handling and user feedback
- Bot logs all command executions to console
