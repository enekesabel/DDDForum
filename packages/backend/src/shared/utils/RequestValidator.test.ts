import { createRequest } from 'node-mocks-http';
import { z } from 'zod';
import { faker } from '@faker-js/faker';
import {
  InvalidRequestBodyException,
  InvalidRequestParamException,
  InvalidRequestQueryException,
  MissingRequestParamException,
  MissingRequestQueryException,
} from '../errors';
import { RequestValidator } from './RequestValidator';

describe('RequestValidator', () => {
  describe('Validating request body', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      id: z.string().or(z.number()),
    });

    it('should successfully parse data matching the schema', () => {
      const request = createRequest({
        body: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          id: faker.number.int(),
        },
      });
      const result = RequestValidator.ValidateRequestBody(request, schema);
      expect(result).toMatchObject(request.body);
    });

    it('should throw an error if request body is invalid', () => {
      const request = createRequest({
        body: {
          email: 'invalid-email',
        },
      });

      expect(() => RequestValidator.ValidateRequestBody(request, schema)).toThrow(InvalidRequestBodyException);
    });
  });

  describe('Validating request query params', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    it('should successfully parse data matching the schema', () => {
      const request = createRequest({
        query: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      });
      const result = RequestValidator.ValidateQueryParams(request, schema);
      expect(result).toMatchObject(request.query);
    });

    it('should throw an error if query is missing', () => {
      const request = createRequest({
        query: {},
      });

      try {
        RequestValidator.ValidateQueryParams(request, schema);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingRequestQueryException);
        expect((error as MissingRequestQueryException).message).toBe('Missing query params: name, email');
      }
    });

    it('should throw an error if query is invalid', () => {
      const request = createRequest({
        query: {
          email: 'invalid-email',
          name: faker.person.fullName(),
        },
      });
      expect(() => RequestValidator.ValidateQueryParams(request, schema)).toThrow(InvalidRequestQueryException);
    });
  });

  describe('Validating request params', () => {
    const schema = z.object({
      id: z.string().uuid().or(z.number()),
    });

    it.each([
      {
        params: {
          id: faker.string.uuid(),
        },
      },
      {
        params: {
          id: faker.number.int(),
        },
      },
    ])('should successfully parse data matching the schema', (request) => {
      const result = RequestValidator.ValidateParams(createRequest(request), schema);
      expect(result).toMatchObject(request.params);
    });

    it('should throw an error if param is missing', () => {
      const request = createRequest({
        params: {},
      });

      try {
        RequestValidator.ValidateParams(request, schema);
      } catch (error) {
        expect(error).toBeInstanceOf(MissingRequestParamException);
        expect((error as MissingRequestParamException).message).toBe('Missing request params: id');
      }
    });

    it('should throw an error if param is invalid', () => {
      const request = createRequest({
        params: {
          id: 'invalid-id',
        },
      });
      expect(() => RequestValidator.ValidateParams(request, schema)).toThrow(InvalidRequestParamException);
    });
  });
});
