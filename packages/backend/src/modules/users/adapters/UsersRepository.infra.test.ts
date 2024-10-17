import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { Database, prisma } from '../../../shared';
import { UsersRepository } from '../ports/UsersRepository';
import { ProductionUsersRepository } from './ProductionUsersRepository';
import { InMemoryUsersRepository } from './InMemoryUsersRepository';

const database = new Database(prisma);
const repositories: UsersRepository[] = [new ProductionUsersRepository(database), new InMemoryUsersRepository()];

beforeAll(async () => {
  await database.connect();
});

afterAll(async () => {
  await database.disconnect();
});

describe.each(repositories)('UsersRepository', (userRepo) => {
  it('can save and retrieve users by email', async () => {
    const createUserInput = new UserInputBuilder().withAllRandomDetails().build();

    const savedUserResult = await userRepo.createUser({
      ...createUserInput,
      password: '',
    });
    const fetchedUserResult = await userRepo.findUserByEmail(createUserInput.email);

    expect(savedUserResult).toBeDefined();
    expect(fetchedUserResult).toBeDefined();
    expect(savedUserResult.email).toEqual(fetchedUserResult?.email);
  });

  it('can find a user by username', async () => {
    const createUserInput = new UserInputBuilder().withAllRandomDetails().build();

    const savedUserResult = await userRepo.createUser({
      ...createUserInput,
      password: '',
    });
    const fetchedUserResult = await userRepo.findUserByUsername(createUserInput.username);

    expect(savedUserResult).toBeDefined();
    expect(fetchedUserResult).toBeDefined();
    expect(savedUserResult.username).toEqual(fetchedUserResult?.username);
  });
});
