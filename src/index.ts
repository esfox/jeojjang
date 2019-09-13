import * as dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` });

import { startServer } from './api/server';
import { startBot } from './bot/bot';

(async function()
{
  await startServer();
  startBot();
})();
