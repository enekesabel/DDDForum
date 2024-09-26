import { UserInput } from '@dddforum/shared/src/api/users';
import { prisma } from '../../../src/database';
import { faker } from '@faker-js/faker';

export class DatabaseFixtures {
  static async ClearDatabase() {
    const deleteAllUser = prisma.user.deleteMany();
    const deleteAllMember = prisma.member.deleteMany();
    const deleteAllPost = prisma.post.deleteMany();
    const deleteAllPostVote = prisma.vote.deleteMany();
    const deleteAllPostComment = prisma.comment.deleteMany();

    try {
      await prisma.$transaction([
        deleteAllPostVote,
        deleteAllPostComment,
        deleteAllPost,
        deleteAllMember,
        deleteAllUser,
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      await prisma.$disconnect();
    }
  }

  static async SetupWithExistingUsers(...userInputs: UserInput[]) {
    return await prisma.$transaction(
      userInputs.map((userInput) => {
        return prisma.user.create({
          data: {
            ...userInput,
            password: faker.internet.password(),
          },
        });
      })
    );
  }
}
