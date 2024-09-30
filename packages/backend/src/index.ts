import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createUser, findUserByEmail, findUserById, findUserByUsername, updateUser } from './database';
import {
  generateRandomPassword,
  isValidCreateUserInput,
  isValidUpdateUserInput,
  parseUserForResponse,
  ResponseBuilder,
} from './utils';
import { ContactListAPI } from './services/ContactListAPI';
import { MarketingController } from './controllers/MarketingController';
import { MarketingService } from './services/MarketingService';
import { errorHandler } from './middleware/errorHandler';
import { PostsController } from './controllers/PostsController';
import {
  EmailAlreadyInUseException,
  UsernameAlreadyTakenException,
  UserNotFoundException,
} from '@dddforum/shared/src/errors/exceptions';
import { ClientError, ValidationError } from '@dddforum/shared/src/errors/errors';
import { PostsService } from './services/PostsService';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/users/new', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = req.body;

    if (!isValidCreateUserInput(req.body)) {
      return next(new ValidationError());
    }

    const existingUserByEmail = await findUserByEmail(req.body.email);
    if (existingUserByEmail) {
      return next(new EmailAlreadyInUseException());
    }

    const existingUserByUsername = await findUserByUsername(req.body.username);
    if (existingUserByUsername) {
      return next(new UsernameAlreadyTakenException());
    }

    const user = await createUser({
      ...userData,
      password: generateRandomPassword(10),
    });

    return new ResponseBuilder(res).data(parseUserForResponse(user)).status(201).build();
  } catch (error) {
    return next(error);
  }
});

// Edit a user
app.post('/users/edit/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // excluding id and password from user data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, password, ...userData } = req.body;

    if (!isValidUpdateUserInput(userData)) {
      return next(new ValidationError());
    }

    const foundUserById = await findUserById(Number(req.params.userId));

    if (!foundUserById) {
      return next(new UserNotFoundException());
    }

    if (userData.email) {
      const foundUserByEmail = await findUserByEmail(userData.email);
      // Allow passing the email unchanged
      // Only throw error if we'd try to assing the same email to a different user
      if (foundUserByEmail && foundUserByEmail.id !== foundUserById.id) {
        return next(new EmailAlreadyInUseException());
      }
    }

    if (userData.username) {
      const foundUserByUsername = await findUserByUsername(userData.username);
      // Allow passing the username unchanged
      // Only throw error if we'd try to assing the same username to a different user
      if (foundUserByUsername && foundUserByUsername.id !== foundUserById.id) {
        return next(new UsernameAlreadyTakenException());
      }
    }

    const updatedUser = await updateUser(Number(req.params.userId), userData);

    return new ResponseBuilder(res).data(parseUserForResponse(updatedUser)).status(200).build();
  } catch (error) {
    return next(error);
  }
});

// Get a user by email
app.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;

    if (!email) {
      return next(new ClientError());
    }

    const foundUser = await findUserByEmail(String(email));

    if (!foundUser) {
      return next(new UserNotFoundException());
    }

    return new ResponseBuilder(res).data(parseUserForResponse(foundUser)).status(200).build();
  } catch (error) {
    return next(error);
  }
});

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
