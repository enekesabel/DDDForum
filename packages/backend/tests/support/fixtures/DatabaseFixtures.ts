import { UserInput } from '@dddforum/shared/src/api/users';
import { prisma } from '../../../src/shared/database/prisma/prisma';
import { UserBuilder } from './UserBuilder';
import { PostBuilder } from './PostBuilder';

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
    return await prisma.$transaction(userInputs.map((userInput) => UserBuilder.FromUserInput(userInput).build()));
  }

  static async SetUpWithRandomPostsByUser(userInput: UserInput, postCount: number) {
    const postBuilders = new Array(postCount).fill(0).map(() => new PostBuilder().withRandomData());
    return this.SetUpWithPostsByUser(userInput).withPosts(...postBuilders);
  }

  static SetUpWithPostsByUser(userInput: UserInput) {
    return {
      withPosts: async (...posts: PostBuilder[]) => {
        const user = await UserBuilder.FromUserInput(userInput).build();
        posts.forEach((post) => {
          if (!user.member) {
            throw new Error('User does not have a member');
          }

          post.fromMember(user.member.id);
        });

        return this.SetUpWithPosts(...posts);
      },
    };
  }

  static SetUpWithPosts(...posts: PostBuilder[]) {
    return prisma.$transaction(posts.map((post) => post.build()));
  }
}
