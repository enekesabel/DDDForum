import express, { Request, Response } from 'express';
import cors from 'cors';
import { prisma } from './database'
import { errorResponseBuilder, generateRandomPassword, isValidUser, parseUserForResponse } from './utils';

const app = express();
app.use(express.json());
app.use(cors())

// Create new user
app.post('/users/new', async (req: Request, res: Response) => {
  const errorBuilder = errorResponseBuilder(res);

  try {
    const userData = req.body;

    // Validate input
    if(!isValidUser(req.body)){
      return errorBuilder.validationError()
    }
    
    // Check if the user exists or not
    const existingUserByEmail = await prisma.user.findFirst({ where: { email: req.body.email }});
    if (existingUserByEmail) {
      return errorBuilder.emailAlreadyInUse()
    }
    
    const existingUserByUsername = await prisma.user.findFirst({ where: { username: req.body.username }});
    if (existingUserByUsername) {
      return errorBuilder.usernameAlreadyTaken()
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
    return errorBuilder.serverError()
  }
});

// Edit a user
app.post('/users/edit/:userId', async (req: Request, res: Response) => {

  const errorBuilder = errorResponseBuilder(res);

  try {

    const {id,password, ...userData} = req.body;

    // Validate input
    if(!isValidUser(userData)){
      return errorBuilder.validationError()
    }

    const foundUserById = await prisma.user.findUnique({
      where: {
        id: Number(req.params.userId)
      }
    })

    if(!foundUserById){
      return errorBuilder.userNotFound()
    }

    const foundUserByEmail = await prisma.user.findUnique({
      where: {
        email: userData.email
      }
    })

    if(foundUserByEmail && foundUserByEmail.id !== foundUserById.id){
      return errorBuilder.emailAlreadyInUse()
    }

    const foundUserByUsername = await prisma.user.findUnique({
      where: {
        username: userData.username
      }
    })

    if(foundUserByUsername && foundUserByUsername.id !== foundUserById.id){
      return errorBuilder.usernameAlreadyTaken()
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
    return errorBuilder.serverError()
  }
});

// Get a user by email
app.get('/users', async (req: Request, res: Response) => {
  const errorBuilder = errorResponseBuilder(res);

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
      return errorBuilder.userNotFound()
    }

    return res.status(200).json({       
      error: undefined, 
      data: parseUserForResponse(foundUser), 
      succes: true 
    });
  } catch (error) {
    console.log(error)
    // Return a failure error response
    return errorBuilder.serverError()
  }
});

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
});