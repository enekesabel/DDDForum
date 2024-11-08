import { Request, Response, NextFunction } from 'express';
import { GetPostsResponseSchema } from '@dddforum/shared/src/modules/posts';
import { Controller, buildAPIResponse } from '../../shared';
import { Application } from '../../core';
import { GetPostsQuery } from './services';

export class PostsController extends Controller {
  constructor(private app: Application) {
    super();
  }

  protected setupRoutes(): void {
    this.router.get('/', this.getPosts.bind(this));
  }

  private async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetPostsQuery.FromRequest(req);
      const posts = await this.app.posts.getPosts(query);

      return buildAPIResponse(res).schema(GetPostsResponseSchema).data(posts).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
