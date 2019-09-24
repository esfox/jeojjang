const { Command } = require('discord-utils');
const commandsInfo = require('../../../config/commands-info');
const
{
  command,
  description
} = commandsInfo.help;

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = command;
    this.action = action;
    this.description = description;
  }
}

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  const [ prefix ] = context.config.prefixes;
  const embed = context.embed(`Command Prefix: "${prefix}"`)
    .setAuthor('Jeojjang Commands', context.bot.user.displayAvatarURL);

  const description = Object.values(commandsInfo)
    .reduce((text, { description }) =>
      description? text + description + '\n\n' : text, '');
  embed.setDescription('Shortcuts in parentheses `()`.\n\n‍' + description);

  context.chat(embed);
}
