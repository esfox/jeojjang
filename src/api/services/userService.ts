import { Op } from 'sequelize';
import { Service } from './service';
import { User } from '../database/models';

const whereIDorDiscordID = (id: number | string) =>
  ({ [Op.or]: [ { id }, { discord_id: id } ] });

class UserService extends Service
{
  // finds a user by Discord or database ID
  find = (id: number | string) =>
  {
    return User.findOne({ where: whereIDorDiscordID(id) });
  }

  // finds the database ID from a given Discord ID
  findIDFromDiscordID(discord_id: string)
  {
    return User.findOne(
    {
      where: { discord_id },
      attributes: [ 'id' ]
    })
      .then((user: User) => user? user.id : null);
  }
 
  // saves a user, but finds it first to avoid duplicates
  save(id: number | string)
  {
    return User.findOrCreate(
    {
      where: whereIDorDiscordID(id),
      defaults: { discord_id: id }
    });
  }

  // finds a user by Discord or database ID and creates it if it doesn't exist
  findOrSave = (id: number | string) =>
  {
    return this.save(id);
  }

  // deletes a user by Discord or database ID
  delete = (id: number | string) =>
  {
    return User.destroy({ where: whereIDorDiscordID(id) });
  }
}

const userService = new UserService(User);
export { userService };
