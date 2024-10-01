import { Router } from 'express';

export abstract class Controller {
  protected router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  getRouter() {
    return this.router;
  }

  protected abstract setupRoutes(): void;
}
