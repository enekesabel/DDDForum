import { Request, Response, NextFunction } from 'express';
import { AddToEmailListResponseSchema } from '@dddforum/shared/src/modules/marketing';
import { buildAPIResponse, Controller } from '../../shared';
import { Application } from '../../core';

export class MarketingController extends Controller {
  constructor(private app: Application) {
    super();
  }

  protected setupRoutes(): void {
    this.router.post('/new', this.addEmailToList.bind(this));
  }

  private async addEmailToList(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      await this.app.marketing.addEmailToList(email);

      return buildAPIResponse(res).schema(AddToEmailListResponseSchema).data(undefined).status(201).build();
    } catch (error) {
      return next(error);
    }
  }
}
