import { UserInputBuilder } from '@dddforum/shared/tests/support';
import { faker } from '@faker-js/faker';
import { Database, prisma } from '../../../shared';
import { UsersRepository } from '../ports/UsersRepository';
import { ProductionUsersRepository } from './ProductionUsersRepository';
import { InMemoryUsersRepository } from './InMemoryUsersRepository';

const database = new Database(prisma);
const repositories: UsersRepository[] = [new ProductionUsersRepository(database), new InMemoryUsersRepository()];
afterAll(async () => {
  await database.disconnect();
});

describe.each(repositories)('UsersRepository', (userRepo) => {
  describe('Creating User', () => {
    it('should successfully create a user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();

      const savedUserResult = await userRepo.createUser({
        ...createUserInput,
        password: '',
      });

      expect(savedUserResult).toBeDefined();
      expect(savedUserResult.email).toEqual(createUserInput.email);
      expect(savedUserResult.username).toEqual(createUserInput.username);
    });

    it('should fail to create a user with an existing email', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();

      await userRepo.createUser({
        ...createUserInput,
        password: '',
      });

      await expect(
        userRepo.createUser({
          ...createUserInput,
          password: '',
        })
      ).rejects.toThrow();
    });
  });

  describe('Updating User', () => {
    it('should successfully update a user', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();
      const createdUser = await userRepo.createUser({
        ...createUserInput,
        password: '',
      });

      const updatedUsername = faker.internet.userName();
      const updatedUserResult = await userRepo.updateUser(createdUser.id, { username: updatedUsername });

      expect(updatedUserResult).toBeDefined();
      expect(updatedUserResult.username).toEqual(updatedUsername);
    });

    it('should fail to update a user with a non-existent ID', async () => {
      const nonExistentId = -1;
      await expect(userRepo.updateUser(nonExistentId, { username: 'someName' })).rejects.toThrow();
    });

    it('should not update user when changing email to an already existing one', async () => {
      const existingEmail = faker.internet.email();

      const firstUserInput = new UserInputBuilder().withAllRandomDetails().withEmail(existingEmail).build();
      await userRepo.createUser({
        ...firstUserInput,
        password: '',
      });

      const secondUserInput = new UserInputBuilder().withAllRandomDetails().build();
      const secondUser = await userRepo.createUser({
        ...secondUserInput,
        password: '',
      });

      await expect(userRepo.updateUser(secondUser.id, { email: existingEmail })).rejects.toThrow();
    });

    it('should not update user when changing username to an already existing one', async () => {
      const existingUsername = faker.internet.userName();

      const firstUserInput = new UserInputBuilder().withAllRandomDetails().withUsername(existingUsername).build();
      await userRepo.createUser({
        ...firstUserInput,
        password: '',
      });

      const secondUserInput = new UserInputBuilder().withAllRandomDetails().build();
      const secondUser = await userRepo.createUser({
        ...secondUserInput,
        password: '',
      });

      await expect(userRepo.updateUser(secondUser.id, { username: existingUsername })).rejects.toThrow();
    });
  });

  describe('Getting User by Email', () => {
    it('should successfully retrieve a user by email', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();

      await userRepo.createUser({
        ...createUserInput,
        password: '',
      });
      const fetchedUserResult = await userRepo.findUserByEmail(createUserInput.email);

      expect(fetchedUserResult).toBeDefined();
      expect(fetchedUserResult?.email).toEqual(createUserInput.email);
    });

    it('should return null when retrieving a user with a non-existent email', async () => {
      const nonExistentEmail = 'nonExistent@example.com';
      const fetchedUserResult = await userRepo.findUserByEmail(nonExistentEmail);

      expect(fetchedUserResult).toBeNull();
    });
  });

  describe('Getting User by Username', () => {
    it('should successfully retrieve a user by username', async () => {
      const createUserInput = new UserInputBuilder().withAllRandomDetails().build();

      await userRepo.createUser({
        ...createUserInput,
        password: '',
      });
      const fetchedUserResult = await userRepo.findUserByUsername(createUserInput.username);

      expect(fetchedUserResult).toBeDefined();
      expect(fetchedUserResult?.username).toEqual(createUserInput.username);
    });

    it('should return null when retrieving a user with a non-existent username', async () => {
      const nonExistentUsername = 'nonExistentUsername';
      const fetchedUserResult = await userRepo.findUserByUsername(nonExistentUsername);

      expect(fetchedUserResult).toBeNull();
    });
  });
});
