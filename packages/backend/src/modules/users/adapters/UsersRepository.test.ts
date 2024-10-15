import { PrismaClient } from '@prisma/client';
import { UserInputBuilder } from '@dddforum/shared/tests/support/builders';
import { Database } from '../../../shared';
import { ProductionUsersRepository } from './ProductionUsersRepository';

describe.each([[new ProductionUsersRepository(new Database(new PrismaClient()))]])('UsersRepository', (userRepo) => {
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
