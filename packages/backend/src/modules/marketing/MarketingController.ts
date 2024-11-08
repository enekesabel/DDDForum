import { Request, Response, NextFunction } from 'express';
import { AddToEmailListResponseSchema } from '@dddforum/shared/src/modules/marketing';
import { buildAPIResponse, Controller } from '../../shared';
import { Application } from '../../core';
import { AddToEmailListCommand } from './services';

export class MarketingController extends Controller {
  constructor(private app: Application) {
    super();
  }

  protected setupRoutes(): void {
    this.router.post('/new', this.addEmailToList.bind(this));
  }

  private async addEmailToList(req: Request, res: Response, next: NextFunction) {
    try {
      const command = AddToEmailListCommand.FromRequest(req);
      await this.app.marketing.addEmailToList(command);

      return buildAPIResponse(res).schema(AddToEmailListResponseSchema).data(undefined).status(201).build();
    } catch (error) {
      return next(error);
    }
  }
}
