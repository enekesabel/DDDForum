import { Post } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PostsRepository } from '../../../src/modules/posts';

export class PostBuilder {
  private post = {} as Post;
  private postsRepository: PostsRepository;

  constructor(postsRepository: PostsRepository) {
    this.postsRepository = postsRepository;
  }

  static withRandomData(postsRepository: PostsRepository) {
    const builder = new PostBuilder(postsRepository);
    return builder
      .withTitle(faker.lorem.sentence())
      .withContent(faker.lorem.paragraph())
      .withDateCreated(faker.date.recent());
  }

  withTitle(title: string) {
    this.post.title = title;
    return this;
  }

  withContent(content: string) {
    this.post.content = content;
    return this;
  }

  withDateCreated(dateCreated: Date) {
    this.post.dateCreated = dateCreated;
    return this;
  }

  fromMember(memberId: number) {
    this.post.memberId = memberId;
    return this;
  }

  async build() {
    return await this.postsRepository.create({
      ...this.post,
      postType: 'Text',
    });
  }
}
