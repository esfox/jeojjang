import * as dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` });

import { startBot } from './bot/bot';

startBot();
