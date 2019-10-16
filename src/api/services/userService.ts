import { Op } from 'sequelize';
import { bot } from '../server'
import { User } from '../database/models';

const whereIDorDiscordID = (id: number | string) =>
  ({ [Op.or]: [ { id }, { discord_id: id } ] });

class UserService
{
  // finds a user by Discord or database ID
  static find(id: number | string)
  {
    return User.findOne({ where: whereIDorDiscordID(id) });
  }

  // finds the database ID from a given Discord ID
  static async findFromDiscordID(discord_id: string): Promise<number>
  {
    return User.findOne(
    {
      where: { discord_id },
      attributes: [ User.columns.id ]
    }).then(({ id }) => id);
  }

  // get Discord user's username and avatar from Discord ID
  static getDiscordUserData(id: string)
  {
    const discordUser = bot.users.get(id);
    if(!discordUser)
      return;

    const { tag, avatarURL } = discordUser;
    return { tag, avatarURL };
  }
 
  // saves a user, but finds it first to avoid duplicates
  static save(id: number | string)
  {
    return User.findOrCreate(
    {
      where: whereIDorDiscordID(id),
      defaults: { discord_id: id }
    });
  }

  // finds a user by Discord or database ID and creates it if it doesn't exist
  static findOrSave(id: number | string)
  {
    return UserService.save(id);
  }

  // deletes a user by Discord or database ID
  static delete(id: number | string)
  {
    return User.destroy({ where: whereIDorDiscordID(id) });
  }
}

export { UserService, whereIDorDiscordID };
