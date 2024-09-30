import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../utils';
import { getPosts } from '../database';
import { Controller } from './Controller';
import { ClientError } from '@dddforum/shared/src/errors/errors';

export class PostsController extends Controller {
  constructor() {
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
      const posts = await getPosts();
      return new ResponseBuilder(res).data({ posts }).status(200).build();
    } catch (error) {
      return next(error);
    }
  }
}
