import express from 'express';
import cors from 'cors';
import { ContactListAPI } from './services/ContactListAPI';
import { MarketingController } from './controllers/MarketingController';
import { MarketingService } from './services/MarketingService';
import { errorHandler } from './middleware/errorHandler';
import { PostsController } from './controllers/PostsController';
import { UsersController } from './controllers/UsersController';
import { PostsService } from './services/PostsService';

const app = express();
app.use(express.json());
app.use(cors());

// Handle users
const usersController = new UsersController();
app.use('/users', usersController.getRouter());

// Handle posts
const postsController = new PostsController(new PostsService());
app.use('/posts', postsController.getRouter());

// Subscribe to marketing emails
const contactListAPI = new ContactListAPI();
const marketingService = new MarketingService(contactListAPI);
const marketingController = new MarketingController(marketingService);
app.use('/marketing', marketingController.getRouter());

// Handle errors
app.use(errorHandler);

const port = process.env.PORT || 3000;

const server = app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});

export { server as app };
