import express, { Request, Response } from 'express';
import cors from 'cors';
import { prisma } from './database'
import { generateRandomPassword, isValidUser, parseUserForResponse } from './utils';

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

// Create new user
app.post('/users/new', async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    // Validate input
    if(!isValidUser(req.body)){
      return res.status(400).json({
        error: Errors.ValidationError,
        data: undefined,
        success: false
      })
    }
    
    // Check if the user exists or not
    const existingUserByEmail = await prisma.user.findFirst({ where: { email: req.body.email }});
    if (existingUserByEmail) {
      return res.status(409).json({ error: Errors.EmailAlreadyInUse, data: undefined, success: false })
    }
    
    const existingUserByUsername = await prisma.user.findFirst({ where: { username: req.body.username }});
    if (existingUserByUsername) {
      return res.status(409).json({ error: Errors.UsernameAlreadyTaken, data: undefined, success: false })
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

  try {

    const {id,password, ...userData} = req.body;

    // Validate input
    if(!isValidUser(userData)){
      return res.status(400).json({
        error: Errors.ValidationError,
        data: undefined,
        success: false
      })
    }

    const foundUserById = await prisma.user.findUnique({
      where: {
        id: Number(req.params.userId)
      }
    })

    if(!foundUserById){
      return res.status(404).json({
        error: Errors.UserNotFound, 
        data: undefined, 
        success: false 
      })
    }

    const foundUserByEmail = await prisma.user.findUnique({
      where: {
        email: userData.email
      }
    })

    if(foundUserByEmail && foundUserByEmail.id !== foundUserById.id){
      return res.status(409).json({
        error: Errors.EmailAlreadyInUse, 
        data: undefined, 
        success: false 
      })
    }

    const foundUserByUsername = await prisma.user.findUnique({
      where: {
        username: userData.username
      }
    })

    if(foundUserByUsername && foundUserByUsername.id !== foundUserById.id){
      return res.status(409).json({
        error: Errors.UsernameAlreadyTaken, 
        data: undefined, 
        success: false 
      })
    }
    
    const updatedUser = await prisma.user.update({
      where: {
        id: foundUserById.id
      },
        data: userData
    });

    return res.status(200).json({       
      error: undefined, 
      data: parseUserForResponse(updatedUser), 
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

// Get a user by email
app.get('/users', async (req: Request, res: Response) => {
  try {
    const {email} = req.query

    if(!email){
      throw new Error();
    }

    const foundUser = await prisma.user.findUnique({
      where: {
        email: String(email)
      }
    })

    if(!foundUser){
      return res.status(404).json({
        error: Errors.UserNotFound, 
        data: undefined, 
        success: false 
      })
    }

    return res.status(200).json({       
      error: undefined, 
      data: parseUserForResponse(foundUser), 
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

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  console.log(`You have ${await prisma.user.count()} users.`)
});