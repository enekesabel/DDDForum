import { Request, Response, NextFunction } from 'express';
import { Controller, ResponseBuilder } from '../../shared';
import { MarketingService } from './MarketingService';
import { AddToEmailListResponse } from '@dddforum/shared/src/modules/marketing';

export class MarketingController extends Controller {
  constructor(private marketingService: MarketingService) {
    super();
  }

  protected setupRoutes(): void {
    this.router.post('/new', this.addEmailToList.bind(this));
  }

  private async addEmailToList(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body.email;
      await this.marketingService.addEmailToList(email);

      return new ResponseBuilder<AddToEmailListResponse>(res).data().status(201).build();
    } catch (error) {
      return next(error);
    }
  }
}
