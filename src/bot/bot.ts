import { startServer } from '../api/server';
import * as Discord from 'discord.js';
import { Context } from 'discord-utils';

const bot = new Discord.Client();
const context = new Context(bot);
context.setModulesPath(`${__dirname}/modules`);

const config = require('./config');
context.setConfig(config);

bot.on('ready', () =>
{
  console.log('Bot is online.');
  startServer();
});

bot.on('message', message =>
{
  context.from(message);
});

function startBot()
{
  bot.login(process.env.DISCORD_BOT_TOKEN);
}

export { startBot, bot };
