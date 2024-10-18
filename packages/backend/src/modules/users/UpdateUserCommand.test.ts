import { createRequest } from 'node-mocks-http';
import { ZodError } from 'zod';
import { faker } from '@faker-js/faker';
import { InvalidRequestBodyException, MissingRequestParamException } from '../../shared';
import { UpdateUserCommand } from './UpdateUserCommand';

describe('UpdateUserCommand', () => {
  const validProps = {
    userId: faker.number.int(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  describe('Creating a valid UpdateUserCommand from props', () => {
    it('should be able to create a valid UpdateUserCommand from props', () => {
      const command = UpdateUserCommand.Create(validProps);
      expect(command.value).toMatchObject(validProps);
    });

    describe('it should throw an error if props are invalid', () => {
      const invalidProps = [{ email: 'invalid-email' }, { username: '' }, { firstName: '' }, { lastName: '' }];

      it.each(invalidProps)('should throw an error if a field is invalid', (fields) => {
        const props = {
          ...validProps,
          ...fields,
        };

        expect(() => UpdateUserCommand.Create(props)).toThrow(ZodError);
      });
    });
  });

  describe('Creating a valid UpdateUserCommand from request', () => {
    it('should be able to create a valid UpdateUserCommand from request', () => {
      const request = createRequest({
        body: validProps,
        params: {
          userId: validProps.userId.toString(),
        },
      });
      const command = UpdateUserCommand.FromRequest(request);
      expect(command.value).toMatchObject(validProps);
    });

    it('should throw an error if request body is invalid', () => {
      const request = createRequest({
        params: {
          userId: validProps.userId.toString(),
        },
        body: {
          ...validProps,
          email: 'invalid-email',
        },
      });
      expect(() => UpdateUserCommand.FromRequest(request)).toThrow(InvalidRequestBodyException);
    });

    it('should throw an error if request params is invalid', () => {
      const request = createRequest({
        body: validProps,
      });

      expect(() => UpdateUserCommand.FromRequest(request)).toThrow(MissingRequestParamException);
    });
  });
});
