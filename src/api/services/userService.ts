import { Op } from 'sequelize';
import { Service } from './service';
import { User } from '../database/models';

const whereIDorUserID = (id: number | string) =>
  ({ [Op.or]: [ { id }, { discord_id: id } ] });

class UserService extends Service
{
  // finds a user by Discord or database ID
  find = (id: number | string) =>
  {
    return User.findOne({ where: whereIDorUserID(id) });
  }
 
  // saves a user, but finds it first to avoid duplicates
  save(id: number | string)
  {
    return User.findOrCreate(
    {
      where: whereIDorUserID(id),
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
    return User.destroy({ where: whereIDorUserID(id) });
  }
}

const userService = new UserService(User);
export { userService };
