import { Router, Request, Response } from 'express';
import { errorResponseBuilder } from '../utils';
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

  private async addEmailToList(req: Request, res: Response) {
    try {
      const email = req.body.email;
      const result = await this.marketingService.addEmailToList(email);
      const response = {
        success: true,
        data: result,
        error: {},
      };
      return res.status(201).json(response);
    } catch (_error) {
      const errorBuilder = errorResponseBuilder(res);
      return errorBuilder.serverError();
    }
  }
}
