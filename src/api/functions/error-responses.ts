import { Context } from 'koa';

function badRequest(context: Context, message: string)
{
  context.status = 400;
  context.body = message;
}

function notFound(context: Context, message: string)
{
  context.status = 404;
  context.body = message;
}

export
{
  badRequest,
  notFound
};
