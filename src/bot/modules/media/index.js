const { Module } = require('discord-utils');

module.exports = class extends Module
{
  constructor()
  {
    super();
    this.setCommandsPath(`${__dirname}/commands`);
  }
}
