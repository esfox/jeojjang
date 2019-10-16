const { Command } = require('discord-utils');
const { website } = require('../../../config');
const
{
  command,
  alias,
  description
} = require('../../../config/commands-info').web;

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = command;
    this.aliases.push(alias);
    this.description = description;
    this.action = action;
  }
}

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  const parameters = context.parameters;
  if(parameters)
  {
    const [ parameter ] = parameters;
    if(parameter === 'public' || parameter === 'p')
      return context.chat(website);
  }

  context.chat(website + context.message.author.id);
}
