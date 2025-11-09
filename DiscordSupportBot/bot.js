import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import schedule from 'node-schedule';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = '?';
const activeTimers = new Map();

client.once('ready', () => {
  console.log(`✅ Bot is online! Logged in as ${client.user.tag}`);
  console.log(`📝 Command prefix: ${PREFIX}`);
  console.log(`🎯 Ready to handle commands: lang, dispute, timer_2d, timer_7d, timer`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    if (command === 'lang') {
      await handleLangCommand(message, args);
    } else if (command === 'dispute') {
      await handleDisputeCommand(message, args);
    } else if (command === 'timer_2d') {
      await handleTimer2dCommand(message);
    } else if (command === 'timer_7d') {
      await handleTimer7dCommand(message);
    } else if (command === 'timer') {
      await handleTimerCommand(message);
    }
  } catch (error) {
    console.error(`Error handling command ${command}:`, error);
    await message.reply('❌ An error occurred while processing your command.');
  }
  
  setTimeout(async () => {
    try {
      await message.delete();
    } catch (error) {
      console.error('Failed to delete command message:', error.message);
    }
  }, 3000);
});

async function handleLangCommand(message, args) {
  if (args.length === 0) {
    await message.reply('❌ Please provide arguments after the command. Example: `?lang test`');
    return;
  }

  const channelName = message.channel.name;
  const arguments_text = args.join('-');
  
  const capitalizedChannelName = channelName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
  
  const renameCommand = `$rename ${capitalizedChannelName}-${arguments_text}`;
  
  await message.channel.send(renameCommand);
  console.log(`✅ ?lang command executed: ${renameCommand}`);
}

async function handleDisputeCommand(message, args) {
  if (args.length !== 3) {
    await message.reply('❌ Please provide exactly 3 arguments. Example: `?dispute Ticket 1234 Test`');
    return;
  }

  const [arg1, arg2, arg3] = args;
  const renameCommand = `$rename ${arg1} ${arg2} ⚠️ ${arg3}`;
  
  await message.channel.send(renameCommand);
  console.log(`✅ ?dispute command executed: ${renameCommand}`);
}

async function handleTimer2dCommand(message) {
  const days = 2;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const formattedDate = futureDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('Ticket pending')
    .setDescription(`## till ${formattedDate}\nStatus: Ingame Contact 48 h\n\nPlease keep an eye on your ticket and contact us in 2 days.`)
    .setTimestamp();

  await message.channel.send({ embeds: [embed] });
  
  const timerId = `${message.channel.id}-${message.author.id}-${Date.now()}`;
  const job = schedule.scheduleJob(futureDate, async () => {
    try {
      await message.channel.send(`<@${message.author.id}> ⏰ Your 2-day timer has expired! Please check your ticket.`);
      activeTimers.delete(timerId);
      console.log(`✅ 2-day timer completed for user ${message.author.tag}`);
    } catch (error) {
      console.error('Error sending timer reminder:', error);
    }
  });

  activeTimers.set(timerId, { job, expirationDate: futureDate, channelId: message.channel.id });
  console.log(`✅ ?timer_2d command executed. Reminder set for ${formattedDate}`);
}

async function handleTimer7dCommand(message) {
  const days = 7;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const formattedDate = futureDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const embed = new EmbedBuilder()
    .setColor('#FF6347')
    .setTitle('Ticket pending')
    .setDescription(`## till ${formattedDate}\nStatus: Login restriction 7d\n\nPlease keep an eye on your ticket and contact us in 7 days.`)
    .setTimestamp();

  await message.channel.send({ embeds: [embed] });
  
  const timerId = `${message.channel.id}-${message.author.id}-${Date.now()}`;
  const job = schedule.scheduleJob(futureDate, async () => {
    try {
      await message.channel.send(`<@${message.author.id}> ⏰ Your 7-day timer has expired! Please check your ticket.`);
      activeTimers.delete(timerId);
      console.log(`✅ 7-day timer completed for user ${message.author.tag}`);
    } catch (error) {
      console.error('Error sending timer reminder:', error);
    }
  });

  activeTimers.set(timerId, { job, expirationDate: futureDate, channelId: message.channel.id });
  console.log(`✅ ?timer_7d command executed. Reminder set for ${formattedDate}`);
}

async function handleTimerCommand(message) {
  const channelId = message.channel.id;
  const channelTimers = [];
  
  for (const [timerId, timerData] of activeTimers.entries()) {
    if (timerData.channelId === channelId) {
      channelTimers.push(timerData);
    }
  }
  
  if (channelTimers.length === 0) {
    await message.channel.send('Here is no active Timer.');
    console.log(`✅ ?timer command executed: No active timers in channel ${channelId}`);
    return;
  }
  
  const now = new Date();
  const timerInfo = channelTimers.map(timerData => {
    const remainingMs = timerData.expirationDate - now;
    const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    let timeString = '';
    if (remainingDays > 0) {
      timeString += `${remainingDays} day${remainingDays !== 1 ? 's' : ''} `;
    }
    if (remainingHours > 0) {
      timeString += `${remainingHours} hour${remainingHours !== 1 ? 's' : ''} `;
    }
    if (remainingMinutes > 0) {
      timeString += `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} `;
    }
    if (remainingSeconds > 0 && remainingDays === 0) {
      timeString += `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
    
    return timeString.trim();
  }).join('\n');
  
  await message.channel.send(`⏰ Active Timer:\n${timerInfo} remaining`);
  console.log(`✅ ?timer command executed: ${timerInfo} remaining`);
}

client.login(process.env.DISCORD_TOKEN);
