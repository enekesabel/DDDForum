import { Request, Response, NextFunction } from 'express';
import { ClientError } from '@dddforum/shared/src/errors/errors';
import { PostsService } from './PostsService';
import { Controller, ResponseBuilder } from '../../shared';

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
      return new ResponseBuilder(res).data({ posts }).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
