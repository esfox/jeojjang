const { Command } = require('discord-utils');

module.exports = class extends Command
{
  constructor()
  {
    super();

    this.keyword = 'twitterfix';
    this.aliases.push('tf');
    this.action = action;
  }
}

/** @param {import('discord-utils').Context} context*/
async function action(context)
{
  let links = context.raw_parameters;
  if(!links)
    return context.send('❌  Please include the twitter links.');

  if(links.length > 2000)
    return context.send('❌ Woops too many links!');

  links = links.replace(/\n|\<|\>/g, ' ').split(' ')
    .filter(link => link !== '')
    .map(link => `<${/jpg:\w*/g.test(link)?
      link.substr(0, link.indexOf('jpg:') + 3) : link}>`)
    .join('\n');
      
  context.chat(links);
}
