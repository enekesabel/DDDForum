import { Router, Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../utils';
import { MarketingService } from '../services/MarketingService';

export class MarketingController {
  private router: Router;

  constructor(private marketingService: MarketingService) {
    this.router = Router();
    this.setupRoutes();
  }

  getRouter() {
    return this.router;
  }

  private setupRoutes() {
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
