import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import { apiRouter } from './routes/router';
import { syncDatabase } from './database/database';

const port = 7777;
const server = new Koa();
server.use(bodyparser());
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
