import { Op } from 'sequelize';
import { Service } from './service';
import { Media } from '../database/models';

class MediaService extends Service
{
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

  // delete media by ID
  deleteByID(id: number)
  {
    return Media.destroy({ where: { id } });
  }

  // delete by link
  deleteByLink(link: string)
  {
    return Media.destroy({ where: { link } });
  }
}

const mediaService = new MediaService(Media);
export { mediaService };
