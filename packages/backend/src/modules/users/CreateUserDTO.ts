import { ValidationError } from '../../shared';

type Props = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

export class CreateUserDTO {
  email: string;
  username: string;
  firstName: string;
  lastName: string;

  static Create({ email, username, firstName, lastName }: Props) {
    if (!email || !username || !firstName || !lastName) {
      throw new ValidationError();
    }
    return new CreateUserDTO({ email, username, firstName, lastName });
  }

  private constructor({ email, username, firstName, lastName }: Props) {
    this.email = email;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
