import { gfycatRegex } from '../config';

const sleep = async (seconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(), seconds * 1000));

const parseTags = (tags: string | string[]): string[] =>
  (Array.isArray(tags)? tags.join(' ') : tags)
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag);

const youtubeIDRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
function getThumbnail(link: string)
{
  if(link.includes('gfycat.com'))
  {
    const [ , gfycatID ] = link.match(gfycatRegex);
    if(!gfycatID)
      return;

    return `https://thumbs.gfycat.com/${gfycatID}-size_restricted.gif`;
  }

  if(link.match(/youtube.com|youtu.be/g))
  {
    const [ , youTubeID ] = link.match(youtubeIDRegex);
    if(!youTubeID)
      return;

    return `https://i.ytimg.com/vi/${youTubeID}/hqdefault.jpg`;
  }

  return link;
}

export { sleep, parseTags, getThumbnail, gfycatRegex };
