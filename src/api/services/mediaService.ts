import { Op } from 'sequelize';
import { Media } from '../database/models';

class MediaService
{
  getAll()
  {
    return Media.findAll();
  }

  // finds media by ID only
  findByID(id: number)
  {
    return Media.findOne({ where: { id } });
  }

  // finds media by link only
  findByLink(link: string)
  {
    return Media.findOne({ where: { link } });
  }

  // finds media by link or ID
  findByLinkOrID(linkOrID: string | number)
  {
    return Media.findOne(
    {
      where:
      {
        [Op.or]: [ { id: linkOrID }, { link: linkOrID }, ]
      }
    });
  }

  // creating or getting a media
  save(link: string)
  {
    return Media.findOrCreate({ where: { link } });
  }
}

const mediaService = new MediaService();
export { mediaService };
