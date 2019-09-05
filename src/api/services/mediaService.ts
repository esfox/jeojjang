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
}

const mediaService = new MediaService(Media);
export { mediaService };
