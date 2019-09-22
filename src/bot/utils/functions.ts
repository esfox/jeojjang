const sleep = async (seconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(), seconds * 1000));

const parseTags = (tags: string[]): string[] =>
  tags.join(' ').split(',').filter(tag => tag);

export { sleep, parseTags };
