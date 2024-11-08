import { createRequest } from 'node-mocks-http';
import { faker } from '@faker-js/faker';
import { InvalidRequestBodyException, ValidationErrorException } from '../../../shared';
import { AddToEmailListCommand } from './AddToEmailListCommand';

describe('AddToEmailListCommand', () => {
  const validEmail = faker.internet.email();

  describe('Creating a valid AddToEmailListCommand from props', () => {
    it('should be able to create a valid AddToEmailListCommand from email', () => {
      const command = AddToEmailListCommand.Create(validEmail);
      expect(command.value).toMatchObject({ email: validEmail });
    });

    describe('it should throw an error if email is invalid', () => {
      const invalidEmails = ['invalid-email'];

      it.each(invalidEmails)('should throw an error if email is invalid', (email) => {
        expect(() => AddToEmailListCommand.Create(email)).toThrow(ValidationErrorException);
      });
    });
  });

  describe('Creating a valid AddToEmailListCommand from request', () => {
    it('should be able to create a valid AddToEmailListCommand from request', () => {
      const request = createRequest({
        body: { email: validEmail },
      });
      const command = AddToEmailListCommand.FromRequest(request);
      expect(command.value).toMatchObject({ email: validEmail });
    });

    it('should throw an error if request body is invalid', () => {
      const request = createRequest({
        body: { email: 'invalid-email' },
      });
      expect(() => AddToEmailListCommand.FromRequest(request)).toThrow(InvalidRequestBodyException);
    });
  });
});
