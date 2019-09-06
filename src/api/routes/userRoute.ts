import Router from 'koa-router';
import { userService } from '../services/userService';
import { get, find, post, edit, destroy } from '../functions/middlewares';

const userRouter = new Router({ prefix: '/user' });
const discordIDProperty = 'discord_id';

// get all users
userRouter.get('/', async context =>
  await get(context, userService.getAll, discordIDProperty, userService.find));

// get a user by database ID
userRouter.get('/:id', async context =>
  await find(context, userService.find));

// creating a new user
userRouter.post('/', async context =>
  await post(context, discordIDProperty, userService.save));

// editing a user by database ID
userRouter.patch('/:id', async context =>
  await edit(context, discordIDProperty, userService.edit));

// deleting a user by database ID
userRouter.delete('/:id', async context =>
  await destroy(context, userService.delete));

// deleting a user by Discord ID
userRouter.delete('/', async context =>
  await destroy(context, userService.delete, discordIDProperty));

export { userRouter };
