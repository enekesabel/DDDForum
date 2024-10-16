import { faker } from '@faker-js/faker';
import { Database, prisma } from '../../../shared';
import { PostCreateInput, PostsRepository } from '../ports/PostsRepository';
import { UsersRepository } from '../../users/ports/UsersRepository';
import { ProductionUsersRepository } from '../../users/adapters/ProductionUsersRepository';
import { InMemoryUsersRepository } from '../../users/adapters/InMemoryUsersRepository';
import { ProductionPostsRepository } from './ProductionPostsRepository';
import { InMemoryPostsRepository } from './InMemoryPostsRepository';

const repositories: {
  postsRepo: PostsRepository;
  usersRepo: UsersRepository;
}[] = [
  {
    postsRepo: new ProductionPostsRepository(new Database(prisma)),
    usersRepo: new ProductionUsersRepository(new Database(prisma)),
  },
  {
    postsRepo: new InMemoryPostsRepository(),
    usersRepo: new InMemoryUsersRepository(),
  },
];

describe.each(repositories)('PostsRepository', ({ postsRepo, usersRepo }) => {
  let user: Awaited<ReturnType<typeof usersRepo.createUser>>;

  beforeEach(async () => {
    await postsRepo.clear();
    await usersRepo.clear();

    user = await usersRepo.createUser({
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    });
  });

  it('can create posts', async () => {
    const postCreateInput: PostCreateInput = {
      memberId: user.member!.id,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      postType: 'Text',
    };
    const post = await postsRepo.create(postCreateInput);
    expect(post).toMatchObject(postCreateInput);
  });

  it('can get posts', async () => {
    const postCreateInputs: PostCreateInput[] = [1, 2, 3].map(() => ({
      memberId: user.member!.id,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      postType: 'Text',
      dateCreated: faker.date.recent(),
    }));

    const createdPosts = await Promise.all(postCreateInputs.map((post) => postsRepo.create(post)));
    createdPosts.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());

    const posts = await postsRepo.getPosts();
    expect(posts).toHaveLength(postCreateInputs.length);
    expect(posts).toMatchObject(createdPosts);
  });
});
