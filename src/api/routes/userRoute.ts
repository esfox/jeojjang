import Router from 'koa-router';
import { get, findByID, post } from '../functions/middlewares';
import { userService } from '../services/userService';

const userRouter = new Router({ prefix: '/user' });

// get all users
userRouter.get('/', async context =>
  await get(context, userService.getAll, 'discord_id', userService.findByID));

// get a user by database ID
userRouter.get('/:id', async context =>
  await findByID(context, userService.findByID));

// creating a new user
userRouter.post('/', async context =>
  await post(context, 'discord_id', userService.save));

export { userRouter };
