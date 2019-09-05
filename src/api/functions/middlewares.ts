// middleware functions that are used in multiple routes

import { Context } from 'koa';

async function get
(
  context: Context,
  getAllFunction: Function,
  property: string,
  getOneFunction: Function,
)
{
  const queryParameter = context.query[property];
  if(!queryParameter)
    return context.body = await getAllFunction();

  const data = await getOneFunction(queryParameter);
  if(!data)
    return context.status = 404;
  context.body = data;
}

async function findByID(context: Context, findFunction: Function)
{
  const { id } = context.params;
  const data = await findFunction(id);
  if(!data)
    return context.status = 404;
  context.body = data;
}

async function post
(
  context: Context,
  property: string,
  saveFunction: Function, 
  validateFunction?: Function
)
{
  const data = context.request.body[property];
  if(!data)
    return context.status = 400;

  if(validateFunction)
    if(!validateFunction())
      return context.status = 400;

  const [ result, wasCreated ] = await saveFunction(data);
  if(!wasCreated)
    return context.status = 409;

  context.body = result;
}

export
{
  get,
  findByID,
  post,
};
