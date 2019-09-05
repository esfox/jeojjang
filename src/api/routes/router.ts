import Router from 'koa-router';

import { userRouter } from './userRoute';
import { mediaRouter } from './mediaRoute';
import { tagRouter } from './tagRoute';

// array of all routers of all models
const routers =
[
  userRouter,
  mediaRouter,
  tagRouter,
];

const apiRouter = new Router();
for(const router of routers)
  apiRouter
    .use(router.routes())
    .use(router.allowedMethods());

export { apiRouter };
