import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../utils';
import { MarketingService } from '../services/MarketingService';
import { Controller } from './Controller';

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
      const result = await this.marketingService.addEmailToList(email);

      return new ResponseBuilder(res).data(result).status(201).build();
    } catch (error) {
      return next(error);
    }
  }
}
