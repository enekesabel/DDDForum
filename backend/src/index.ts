import express, { Request, Response } from 'express';
import cors from 'cors';
import {prisma} from './client'
import { User } from '@prisma/client';

const app = express();
app.use(express.json());
app.use(cors())

const Errors = {
  UsernameAlreadyTaken: 'UserNameAlreadyTaken',
  EmailAlreadyInUse: 'EmailAlreadyInUse',
  ValidationError: 'ValidationError',
  ServerError: 'ServerError',
  ClientError: 'ClientError',
  UserNotFound: 'UserNotFound'
}

function generateRandomPassword(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const passwordArray = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    passwordArray.push(charset[randomIndex]);
  }

  return passwordArray.join('');
}

// We don't want to return the password within the request
function parseUserForResponse (user: User) {
  const returnData = JSON.parse(JSON.stringify(user));
  delete returnData.password;
  return returnData;
}

// Create new user
app.post('/users/new', async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Check if the user exists or not
    const existingUserByEmail = await prisma.user.findFirst({ where: { email: req.body.email }});
    if (existingUserByEmail) {
      return res.status(409).json({ error: Errors.EmailAlreadyInUse, data: undefined, success: false })
    }

    // Success case
    const user = await prisma.user.create({ 
      data: { ...userData, password: generateRandomPassword(10) } 
    });
    
    return res.status(201).json({       
      error: undefined, 
      data: parseUserForResponse(user), 
      succes: true 
    });
  } catch (error) {
    console.log(error)
    // Return a failure error response
    return res.status(500).json({ 
      error: Errors.ServerError, 
      data: undefined, 
      success: false 
     });
  }
});

// Edit a user
app.post('/users/edit/:userId', async (req: Request, res: Response) => {
  // ...
});

// Get a user by email
app.get('/users', async (req: Request, res: Response) => {
  // ...
});

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  console.log(`You have ${await prisma.user.count()} users.`)
});