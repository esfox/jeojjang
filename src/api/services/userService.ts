import { Op } from 'sequelize';
import { User } from '../database/models';

const whereIDorUserID = (id: string) =>
  ({ [Op.or]: [ { id }, { user_id: id } ] });

class UserService
{
  getAll()
  {
    return User.findAll();
  }

  // finds a user by Discord or database ID
  findByUserID(id: string)
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
    this.save(id);
  }
}

const userService = new UserService();
export { userService };
