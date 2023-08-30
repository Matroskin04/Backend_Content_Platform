import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommentOutputModel } from './models/output/comment.output.model';
import { CommentsQueryRepository } from '../infrastructure/query.repository/comments.query.repository';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { Response } from 'express';
import { CommentsService } from '../application/comments.service';
import {
  JwtAccessGuard,
  JwtAccessGuardMongo,
} from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import {
  CurrentUserId,
  CurrentUserIdMongo,
} from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { ObjectId } from 'mongodb';
import { UpdateCommentInputModel } from './models/input/update-comment.input.model';
import { UpdateCommentLikeStatusInputModel } from './models/input/update-comment-like-status.input.model';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAccessNotStrictGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import { IsUserBannedForBlogGuard } from '../../../infrastructure/guards/blogs-comments-posts-guards/is-user-banned-for-blog.guard';
import {
  IsUserBannedByJWTGuard,
  IsUserBannedByLoginOrEmailGuard,
} from '../../../infrastructure/guards/is-user-banned.guard';

@SkipThrottle()
@Controller('/hometask-nest/comments')
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
  ) {}

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':id')
  async getCommentById(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string | null,
  ): Promise<CommentOutputModel> {
    const result = await this.commentsQueryRepository.getCommentByIdViewModel(
      commentId,
      userId,
    );

    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard) //todo addition guard 403
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id')
  async updateComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
    @Body() inputCommentModel: UpdateCommentInputModel,
  ): Promise<void> {
    const result = await this.commentsService.updateComment(
      commentId,
      userId,
      inputCommentModel.content,
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessGuard, IsUserBannedByJWTGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id/like-status')
  async updateLikeStatusOfComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
    @Body() inputLikeInfoModel: UpdateCommentLikeStatusInputModel,
  ): Promise<string | void> {
    const result = await this.commentsService.updateLikeStatusOfComment(
      commentId,
      userId,
      inputLikeInfoModel.likeStatus,
    );

    if (!result)
      throw new NotFoundException("Comment with specified id doesn't exist");
    return;
  }

  @UseGuards(JwtAccessGuard) //todo add guard 403
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':id')
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const result = await this.commentsService.deleteComment(commentId, userId);

    if (!result) throw new NotFoundException();
    return;
  }
}
