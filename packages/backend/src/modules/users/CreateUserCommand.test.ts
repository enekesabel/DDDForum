import { createRequest } from 'node-mocks-http';
import { ZodError } from 'zod';
import { faker } from '@faker-js/faker';
import { InvalidRequestBodyException } from '../../shared';
import { CreateUserCommand } from './CreateUserCommand';

describe('CreateUserCommand', () => {
  const validProps = {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  describe('Creating a valid CreateUserCommand from props', () => {
    it('should be able to create a valid CreateUserCommand from props', () => {
      const command = CreateUserCommand.Create(validProps);
      expect(command.value).toMatchObject(validProps);
    });

    describe('it should throw an error if props are invalid', () => {
      const invalidProps = [{ email: 'invalid-email' }, { username: '' }, { firstName: '' }, { lastName: '' }];

      it.each(invalidProps)('should throw an error if a field is invalid', (fields) => {
        const props = {
          ...validProps,
          ...fields,
        };

        expect(() => CreateUserCommand.Create(props)).toThrow(ZodError);
      });
    });
  });

  describe('Creating a valid CreateUserCommand from request', () => {
    it('should be able to create a valid CreateUserCommand from request', () => {
      const request = createRequest({
        body: validProps,
      });
      const command = CreateUserCommand.FromRequest(request);
      expect(command.value).toMatchObject(validProps);
    });

    it('should throw an error if request body is invalid', () => {
      const request = createRequest({
        body: {
          ...validProps,
          email: 'invalid-email',
        },
      });
      expect(() => CreateUserCommand.FromRequest(request)).toThrow(InvalidRequestBodyException);
    });
  });
});
