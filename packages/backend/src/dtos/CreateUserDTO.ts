import { ValidationError } from '@dddforum/shared/src/errors/errors';

type Props = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
};

export class CreateUserDTO {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;

  static Create({ email, username, firstName, lastName, password }: Props) {
    if (!email || !username || !firstName || !lastName || !password) {
      throw new ValidationError();
    }
    return new CreateUserDTO({ email, username, firstName, lastName, password });
  }

  private constructor({ email, username, firstName, lastName, password }: Props) {
    this.email = email;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
  }
}
