import { UserInput } from '@dddforum/shared/src/modules/users';
import { CompositionRoot } from '../../../src/core';
import { UserBuilder } from './UserBuilder';
import { PostBuilder } from './PostBuilder';

export class DatabaseFixtures {
  private compositionRoot: CompositionRoot;

  constructor(compositionRoot: CompositionRoot) {
    this.compositionRoot = compositionRoot;
  }

  private get usersRepository() {
    return this.compositionRoot.usersModule.getUsersRepository();
  }

  private get postsRepository() {
    return this.compositionRoot.postsModule.getPostsRepository();
  }

  async clearDatabase() {
    await this.postsRepository.clear();
    await this.usersRepository.clear();
  }

  async setupWithExistingUsers(...userInputs: UserInput[]) {
    return await Promise.all(
      userInputs.map(async (userInput) => await UserBuilder.FromUserInput(userInput, this.usersRepository).build())
    );
  }

  async setUpWithRandomPostsByUser(userInput: UserInput, postCount: number) {
    const postBuilders = new Array(postCount).fill(0).map(() => PostBuilder.withRandomData(this.postsRepository));
    return this.setUpWithPostsByUser(userInput).withPosts(...postBuilders);
  }

  setUpWithPostsByUser(userInput: UserInput) {
    return {
      withPosts: async (...posts: PostBuilder[]) => {
        const user = await UserBuilder.FromUserInput(userInput, this.usersRepository).build();
        posts.forEach((post) => {
          if (!user.member) {
            throw new Error('User does not have a member');
          }
          post.fromMember(user.member.id);
        });
        return this.setUpWithPosts(...posts);
      },
    };
  }

  async setUpWithPosts(...posts: PostBuilder[]) {
    return await Promise.all(posts.map(async (post) => await post.build()));
  }
}
