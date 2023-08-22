import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ObjectId } from 'mongodb';

export const CurrentUserIdMongo = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (request.userId) return request.userId;
    if (request.user) return new ObjectId(request.user.id);
    return null;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (request.userId) return request.userId;
    if (request.user) return request.user.id;
    return null;
  },
);
