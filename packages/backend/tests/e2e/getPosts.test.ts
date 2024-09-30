import { defineFeature, loadFeature } from 'jest-cucumber';
import { sharedTestRoot } from '@dddforum/shared/src/paths';
import path from 'path';
import supertest from 'supertest';
import { app } from '../../src';
import { Post } from '@prisma/client';
import { DatabaseFixtures } from '../support/fixtures/DatabaseFixtures';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders/UserInputBuilder';
import { ClientError } from '@dddforum/shared/src/errors/errors';

const feature = loadFeature(path.join(sharedTestRoot, 'features/getPosts.feature'));

beforeEach(DatabaseFixtures.ClearDatabase);

afterAll(() => {
  app.close();
});

defineFeature(feature, (test) => {
  test('Successfully retrieve posts sorted by recent', ({ given, when, then }) => {
    let getPostsResponse: supertest.Response;
    let posts: Post[];

    given(/^There are posts in the system already$/, async () => {
      posts = await DatabaseFixtures.SetUpWithRandomPostsByUser(new UserInputBuilder().build(), 5);
      posts.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    });

    when(/^I request the list of posts$/, async () => {
      getPostsResponse = await supertest(app).get('/posts').query({ sort: 'recent' });
    });

    then(/^I should receive the list of posts starting with the most recent$/, () => {
      expect(getPostsResponse.status).toBe(200);
      expect(getPostsResponse.body.data.posts).toMatchObject(JSON.parse(JSON.stringify(posts)));
    });
  });

  test('Fail to retrieve posts when sorting is not provided', ({ given, when, then }) => {
    let getPostsResponse: supertest.Response;
    let posts: Post[];

    given(/^There are posts in the system already$/, async () => {
      posts = await DatabaseFixtures.SetUpWithRandomPostsByUser(new UserInputBuilder().build(), 5);
      posts.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    });

    when(/^I request the list of posts without specifying sorting$/, async () => {
      getPostsResponse = await supertest(app).get('/posts');
    });

    then(/^I should receive a client error$/, () => {
      expect(getPostsResponse.status).toBe(400);
      expect(getPostsResponse.body.error).toBe(new ClientError().message);
    });
  });
});
