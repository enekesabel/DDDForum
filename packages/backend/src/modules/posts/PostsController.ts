import { Request, Response, NextFunction } from 'express';
import { GetPostsResponseSchema } from '@dddforum/shared/src/modules/posts';
import { Controller, InvalidRequestQueryException, MissingRequestQueryException, buildAPIResponse } from '../../shared';
import { PostsService } from './PostsService';

export class PostsController extends Controller {
  constructor(private postsService: PostsService) {
    super();
  }

  protected setupRoutes(): void {
    this.router.get('/', this.getPosts.bind(this));
  }

  private async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { sort } = req.query;

      if (!sort) {
        return next(new MissingRequestQueryException('Sort is required.'));
      }

      if (sort !== 'recent') {
        return next(new InvalidRequestQueryException('Sort must be "recent".'));
      }
      const posts = await this.postsService.getPosts();

      return buildAPIResponse(res).schema(GetPostsResponseSchema).data(posts).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
