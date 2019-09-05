// middleware functions that are used in multiple routes

import { Context } from 'koa';

// get middleware that gets all rows if there's no expected query parameter
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

// middleware for finding a row by ID
async function findByID(context: Context, findFunction: Function)
{
  const { id } = context.params;
  const data = await findFunction(id);
  if(!data)
    return context.status = 404;
  context.body = data;
}

/* post middleware for adding data to the database (also checks if existing)
  - only gets 1 property from the data */
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

// middleware for deleting data in the database, either by ID or by a property
async function destroy
(
  context: Context,
  deleteFunction: Function,
  property?: string
)
{
  const parameter = property? context.query[property] : context.params.id;
  if(!parameter)
    return context.status = 400;

  const deletedCount = await deleteFunction(parameter);
  if(!deletedCount)
    return context.status = 404;

  context.status = 200;
}

export
{
  get,
  findByID,
  post,
  destroy,
};
