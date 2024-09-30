import express, { Request, Response } from 'express';
import cors from 'cors';
import { createUser, findUserByEmail, findUserById, findUserByUsername, getPosts, updateUser } from './database';
import {
  errorResponseBuilder,
  generateRandomPassword,
  isValidCreateUserInput,
  isValidUpdateUserInput,
  parseUserForResponse,
} from './utils';
import { ContactListAPI } from './services/ContactListAPI';
import { MarketingController } from './controllers/MarketingController';
import { MarketingService } from './services/MarketingService';

const app = express();
app.use(express.json());
app.use(cors());

app.post('/users/new', async (req: Request, res: Response) => {
  const errorBuilder = errorResponseBuilder(res);

  try {
    const userData = req.body;

    if (!isValidCreateUserInput(req.body)) {
      return errorBuilder.validationError();
    }

    const existingUserByEmail = await findUserByEmail(req.body.email);
    if (existingUserByEmail) {
      return errorBuilder.emailAlreadyInUse();
    }

    const existingUserByUsername = await findUserByUsername(req.body.username);
    if (existingUserByUsername) {
      return errorBuilder.usernameAlreadyTaken();
    }

    const user = await createUser({ ...userData, password: generateRandomPassword(10) });

    return res.status(201).json({
      error: undefined,
      data: parseUserForResponse(user),
      succes: true,
    });
  } catch (error) {
    console.log(error);
    return errorBuilder.serverError();
  }
});

// Edit a user
app.post('/users/edit/:userId', async (req: Request, res: Response) => {
  const errorBuilder = errorResponseBuilder(res);

  try {
    // excluding id and password from user data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, password, ...userData } = req.body;

    if (!isValidUpdateUserInput(userData)) {
      return errorBuilder.validationError();
    }

    const foundUserById = await findUserById(Number(req.params.userId));

    if (!foundUserById) {
      return errorBuilder.userNotFound();
    }

    if (userData.email) {
      const foundUserByEmail = await findUserByEmail(userData.email);
      // Allow passing the email unchanged
      // Only throw error if we'd try to assing the same email to a different user
      if (foundUserByEmail && foundUserByEmail.id !== foundUserById.id) {
        return errorBuilder.emailAlreadyInUse();
      }
    }

    if (userData.username) {
      const foundUserByUsername = await findUserByUsername(userData.username);
      // Allow passing the username unchanged
      // Only throw error if we'd try to assing the same username to a different user
      if (foundUserByUsername && foundUserByUsername.id !== foundUserById.id) {
        return errorBuilder.usernameAlreadyTaken();
      }
    }

    const updatedUser = await updateUser(Number(req.params.userId), userData);

    return res.status(200).json({
      error: undefined,
      data: parseUserForResponse(updatedUser),
      succes: true,
    });
  } catch (_error) {
    console.log(_error);
    return errorBuilder.serverError();
  }
});

// Get a user by email
app.get('/users', async (req: Request, res: Response) => {
  const errorBuilder = errorResponseBuilder(res);

  try {
    const { email } = req.query;

    if (!email) {
      return errorBuilder.clientError();
    }

    const foundUser = await findUserByEmail(String(email));

    if (!foundUser) {
      return errorBuilder.userNotFound();
    }

    return res.status(200).json({
      error: undefined,
      data: parseUserForResponse(foundUser),
      succes: true,
    });
  } catch (_error) {
    return errorBuilder.serverError();
  }
});

// Get posts "/posts?sort=recent"
app.get('/posts', async (req: Request, res: Response) => {
  const errorBuilder = errorResponseBuilder(res);
  try {
    const { sort } = req.query;

    if (sort !== 'recent') {
      return errorBuilder.clientError();
    }

    const posts = await getPosts();

    // Get the posts
    return res.json({ error: undefined, data: { posts }, success: true });
  } catch (_error) {
    return errorBuilder.serverError();
  }
});

const contactListAPI = new ContactListAPI();
const marketingService = new MarketingService(contactListAPI);
const marketingController = new MarketingController(marketingService);

// Subscribe to marketing emails
app.use('/marketing', marketingController.getRouter());

const port = process.env.PORT || 3000;

const server = app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});

export { server as app };
