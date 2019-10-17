import Koa from 'koa';
import Router from 'koa-router';
import bodyparser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import serve from 'koa-static';
import send from 'koa-send';
import http from 'http';
import { Client } from 'discord.js';

import { apiRouter } from './routes/router';
import { syncDatabase } from './database/database';

let bot: Client;

const port = process.env.PORT || 7777;
const server = new Koa();
server.use(bodyparser());
server.use(cors());
server.use(helmet());

// Ping route for Glitch awaking
const router = new Router();
router.get('/ping', context => context.status = 200);

// Serve Website
server.use(serve('./src/website'));
router.get('/',
  context => send(context, './src/website/page.html'));
router.get('/:discordID',
  context => send(context, './src/website/page.html'));

// Glitch awaken loop
if(process.env.PROJECT_DOMAIN)
{
  setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/ping`);
  }, 280000);
}

server
  .use(router.routes())
  .use(router.allowedMethods());

server
  .use(apiRouter.routes())
  .use(apiRouter.allowedMethods());

async function startServer(discordBot)
{
  bot = discordBot;
  await syncDatabase();
  server.listen(port);
  console.log(`Server started on port ${port}.`);
}

export { startServer, bot };
