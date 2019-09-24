const getInfo = ({ command, alias, description, usage, example }) =>
({
  command,
  alias,
  description:
`__**${command}**__${alias? ` (\`${alias}\`)` : ''} = ${description}`
+ `${usage && example? 
`\n> Usage:
> \`-${command} ${usage}\`
> Example:
> \`-${alias} ${example}\`` : ''}`
});

const info =
{
  save: getInfo(
  {
    command: 'save',
    alias: 's',
    description: 'save media with searchable tags',
    usage: '(link) (tag/s separated by comma)',
    example: 'https://gfycat.com/brieffarawayamphibian nayeon, cute, smile',
  }),

  find: getInfo(
  {
    command: 'find',
    alias: 'f',
    description: 'search your saved media by tag/s',
    usage: '(tag/s separated by comma)',
    example: 'smile, cute',
  }),

  browse: getInfo(
  {
    command: 'browse',
    alias: 'b',
    description: 'search all media from all users by tag/s',
    usage: '(tag/s separated by comma)',
    example: 'nayeon',
  }),

  delete: getInfo(
  {
    command: 'delete',
    alias: 'd',
    description: 'delete saved media by ID or link',
    usage: '(media ID/link)',
    example: '8',
  }),

  mytags: getInfo(
  {
    command: 'mytags',
    alias: 'mt',
    description: 'shows all the tags you used',
  }),

  showtags: getInfo(
  {
    command: 'showtags',
    alias: 'st',
    description: 'shows all the tags of a specific media',
    usage: '(media ID/link)',
    example: 'https://gfycat.com/offensivecomplexcub',
  }),

  addtags: getInfo(
  {
    command: 'addtags',
    alias: 'at',
    description: 'add new tag/s to a saved media',
    usage: '(media ID/link) (tag/s separated by comma)',
    example: '1 pretty, uwu',
  }),

  edittags: getInfo(
  {
    command: 'edittags',
    alias: 'et',
    description: 'edit tags of a saved media',
    usage: '(media ID/link) (tag/s separated by comma)',
    example: '2 nayeon, cute, airport',
  }),

  removetags: getInfo(
  {
    command: 'removetags',
    alias: 'rt',
    description: 'remove tags from a saved media',
    usage: '(media ID/link) (tag/s separated by comma)',
    example: '3 smile, uwu',
  }),

  ping: getInfo(
  {
    command: 'ping',
    description: 'check the bot\'s ping',
  }),

  help: getInfo(
  {
    command: 'help',
    description: 'shows this message',
  }),
}

module.exports = info;
