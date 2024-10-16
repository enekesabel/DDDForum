import { PrismaClient } from '@prisma/client';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders';
import { Database } from '../../../shared';
import { PostsRepository } from '../ports/PostsRepository';
import { DatabaseFixtures } from '../../../../tests/support/fixtures/DatabaseFixtures';
import { ProductionPostsRepository } from './ProductionPostsRepository';

const postRepositories: PostsRepository[] = [new ProductionPostsRepository(new Database(new PrismaClient()))];

describe.each([postRepositories])('PostsRepository', (postsRepo) => {
  beforeEach(async () => {
    await DatabaseFixtures.ClearDatabase();
  });
  it('can retrieve the list of posts', async () => {
    const createdPosts = await DatabaseFixtures.SetUpWithRandomPostsByUser(
      new UserInputBuilder().withAllRandomDetails().build(),
      5
    );
    createdPosts.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
    const posts = await postsRepo.getPosts();
    expect(posts).toMatchObject(createdPosts);
  });
});
