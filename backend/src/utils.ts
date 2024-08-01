import { User } from "./database";
import { Response } from 'express';

// We don't want to return the password within the request
export function parseUserForResponse(user: User) {
  const returnData = JSON.parse(JSON.stringify(user));
  delete returnData.password;
  return returnData
}

export function generateRandomPassword(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const passwordArray = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    passwordArray.push(charset[randomIndex]);
  }

  return passwordArray.join('');
}

export function isValidUser(user: User): boolean {
  return !!user.email &&
    !!user.username &&
    !!user.firstName &&
    !!user.lastName;
}

const Errors = {
  UsernameAlreadyTaken: 'UserNameAlreadyTaken',
  EmailAlreadyInUse: 'EmailAlreadyInUse',
  ValidationError: 'ValidationError',
  ServerError: 'ServerError',
  ClientError: 'ClientError',
  UserNotFound: 'UserNotFound'
};

export const errorResponseBuilder = (res: Response) => {
  return {
    usernameAlreadyTaken: () => res.status(409).json({
      error: Errors.UsernameAlreadyTaken,
      data: undefined,
      success: false
    }),
    emailAlreadyInUse: () => res.status(409).json({
      error: Errors.EmailAlreadyInUse,
      data: undefined,
      success: false
    }),
    validationError: () => res.status(400).json({
      error: Errors.ValidationError,
      data: undefined,
      success: false
    }),
    serverError: () => res.status(500).json({
      error: Errors.ServerError,
      data: undefined,
      success: false
    }),
    userNotFound: () => res.status(404).json({
      error: Errors.UserNotFound,
      data: undefined,
      success: false
    }),
  };
};

