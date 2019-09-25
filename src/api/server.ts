import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import cors from '@koa/cors';
// import serve from 'koa-static';
// import send from 'koa-send';
import { apiRouter } from './routes/router';
import { syncDatabase } from './database/database';

const port = 7777;
const server = new Koa();
server.use(bodyparser());
server.use(cors());

// Serve Website
// server.use(serve('./src/website'))
// apiRouter.get('/', context => send(context, './src/website/index.html'));

server
  .use(apiRouter.routes())
  .use(apiRouter.allowedMethods());

async function startServer()
{
  await syncDatabase();
  server.listen(port);
  console.log(`Server started on port ${port}.`);
}

export { startServer };
