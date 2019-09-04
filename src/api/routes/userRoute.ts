import Router from 'koa-router';
import { badRequest, notFound } from '../functions/error-responses';
import { userService } from '../services/userService';

const userRouter = new Router({ prefix: '/user' });

// get all users
userRouter.get('/', async context =>
{
  context.body = await userService.getAll();
});

// get a user by Discord ID or database ID
userRouter.get('/:id', async context =>
{
  const { id } = context.params;
  if(!id)
    return badRequest(context, 'Please include the `id` param.');

  const user = await userService.findByUserID(id);
  if(!user)
    return notFound(context, `User with ID "${id}" not found.`);

  context.body = await userService.findByUserID(id);
});

// creating a new user
userRouter.post('/', async context =>
{
  const { user_id } = context.request.body;
  if(!user_id)
    return badRequest(context, 'Please include the `user_id` property.');

  if(isNaN(user_id))
    return badRequest(context, '`user_id` is not a valid user ID.');

  // TODO: validate if user_id is an actual Discord user
  const [ , wasCreated ] = await userService.save(user_id);
  if(!wasCreated)
    return badRequest(context, `User with ID "${user_id}" already exists.`);

  context.body = 'User has been saved.';
});

export { userRouter };
