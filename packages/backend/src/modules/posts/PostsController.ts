import { Request, Response, NextFunction } from 'express';
import { GetPostsResponseSchema } from '@dddforum/shared/src/modules/posts';
import { Controller, buildAPIResponse } from '../../shared';
import { PostsService, GetPostsQuery } from './services';

export class PostsController extends Controller {
  constructor(private postsService: PostsService) {
    super();
  }

  protected setupRoutes(): void {
    this.router.get('/', this.getPosts.bind(this));
  }

  private async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetPostsQuery.FromRequest(req);
      const posts = await this.postsService.getPosts(query);

      return buildAPIResponse(res).schema(GetPostsResponseSchema).data(posts).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
