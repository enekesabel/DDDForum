import { ValidationError } from '@dddforum/shared/src/errors/errors';

type Props = {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
};

export class UpdateUserDTO {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;

  static Create({ email, username, firstName, lastName }: Props) {
    if (
      (email !== undefined && !email.trim()) ||
      (username !== undefined && !username.trim()) ||
      (firstName !== undefined && !firstName.trim()) ||
      (lastName !== undefined && !lastName.trim())
    ) {
      throw new ValidationError();
    }
    return new UpdateUserDTO({ email, username, firstName, lastName });
  }

  private constructor({ email, username, firstName, lastName }: Props) {
    this.email = email;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
