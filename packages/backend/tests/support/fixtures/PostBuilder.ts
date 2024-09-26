import { Post } from '@prisma/client';
import { prisma } from '../../../src/database';
import { faker } from '@faker-js/faker';

export class PostBuilder {
  private post = {} as Post;

  withRandomData() {
    return this.withTitle(faker.lorem.sentence())
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

  build() {
    return prisma.post.create({
      data: {
        ...this.post,
        postType: 'Text',
      },
    });
  }
}
