import { Op } from 'sequelize';
import { Service } from './service';
import { User } from '../database/models';

const whereIDorUserID = (id: number | string) =>
  ({ [Op.or]: [ { id }, { user_id: id } ] });

class UserService extends Service
{
  // finds a user by Discord or database ID
  findByID = (id: number | string) =>
  {
    return User.findOne({ where: whereIDorUserID(id) });
  }

  // creating a user by Discord or database ID
  save(id: string)
  {
    return User.findOrCreate(
    {
      where: whereIDorUserID(id),
      defaults: { user_id: id }
    });
  }

  // finds a user by Discord or database ID and creates it if it doesn't exist
  findOrSave(id: string)
  {
    return this.save(id);
  }
}

const userService = new UserService(User);
export { userService };
