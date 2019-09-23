const sleep = async (seconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(), seconds * 1000));

const parseTags = (tags: string | string[]): string[] =>
  (Array.isArray(tags)? tags.join(' ') : tags)
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag);

export { sleep, parseTags };
