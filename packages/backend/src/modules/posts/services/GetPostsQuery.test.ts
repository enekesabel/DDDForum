import { createRequest } from 'node-mocks-http';
import { InvalidRequestQueryException, ValidationErrorException, MissingRequestQueryException } from '../../../shared';
import { GetPostsQuery } from './GetPostsQuery';

describe('GetPostsQuery', () => {
  const validSort = 'recent';
  const invalidSort = 'invalid-sort';

  describe('Creating a valid GetPostsQuery from a sort parameter', () => {
    it('should be able to create a valid GetPostsQuery from a valid sort parameter', () => {
      const query = GetPostsQuery.Create(validSort);
      expect(query.value).toBe(validSort);
    });

    it('should throw an error if sort is invalid', () => {
      expect(() => GetPostsQuery.Create(invalidSort as 'recent')).toThrow(ValidationErrorException);
    });
  });

  describe('Creating a valid GetPostsQuery from request', () => {
    it('should be able to create a valid GetPostsQuery from request', () => {
      const request = createRequest({
        query: {
          sort: validSort,
        },
      });
      const query = GetPostsQuery.FromRequest(request);
      expect(query.value).toBe(validSort);
    });

    it('should throw an error if request query is invalid', () => {
      const request = createRequest({
        query: {
          sort: invalidSort,
        },
      });

      expect(() => GetPostsQuery.FromRequest(request)).toThrow(InvalidRequestQueryException);
    });

    it('should throw an error if no query is provided', () => {
      const request = createRequest();
      expect(() => GetPostsQuery.FromRequest(request)).toThrow(MissingRequestQueryException);
    });
  });
});
