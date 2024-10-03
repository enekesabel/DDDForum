import { Request, Response, NextFunction } from 'express';
import { PostsService } from './PostsService';
import { ClientError, Controller, ResponseBuilder } from '../../shared';
import { GetPostsResponse } from '@dddforum/shared/src/modules/posts';

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

      if (sort !== 'recent') {
        return next(new ClientError());
      }
      const posts = await this.postsService.getPosts();
      return new ResponseBuilder<GetPostsResponse>(res).data(posts).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
