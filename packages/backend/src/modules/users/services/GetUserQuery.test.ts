import { createRequest } from 'node-mocks-http';
import { faker } from '@faker-js/faker';
import { InvalidRequestQueryException, ValidationErrorException } from '../../../shared';
import { GetUserQuery } from './GetUserQuery';

describe('GetUserQuery', () => {
  const validEmail = faker.internet.email();
  const invalidEmail = 'invalid-email';

  describe('Creating a valid GetUserQuery from an email', () => {
    it('should be able to create a valid GetUserQuery from a valid email', () => {
      const query = GetUserQuery.Create(validEmail);
      expect(query.value).toBe(validEmail);
    });

    it('should throw an error if email is invalid', () => {
      expect(() => GetUserQuery.Create(invalidEmail)).toThrow(ValidationErrorException);
    });
  });

  describe('Creating a valid GetUserQuery from request', () => {
    it('should be able to create a valid GetUserQuery from request', () => {
      const request = createRequest({
        query: {
          email: validEmail,
        },
      });
      const query = GetUserQuery.FromRequest(request);
      expect(query.value).toBe(validEmail);
    });

    it('should throw an error if request query is invalid', () => {
      const request = createRequest({
        query: {
          email: invalidEmail,
        },
      });

      expect(() => GetUserQuery.FromRequest(request)).toThrow(InvalidRequestQueryException);
    });
  });
});
