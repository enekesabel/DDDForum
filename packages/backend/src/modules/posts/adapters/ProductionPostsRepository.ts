import { ProductionRepository } from '../../../shared';
import { PostCreateInput, PostsRepository } from '../ports/PostsRepository';

export class ProductionPostsRepository extends ProductionRepository implements PostsRepository {
  getPosts = () =>
    this.prisma.post.findMany({
      include: {
        votes: true,
        memberPostedBy: {
          include: {
            user: true,
          },
        },
        comments: true,
      },
      orderBy: {
        dateCreated: 'desc',
      },
    });

  async create(post: PostCreateInput) {
    return this.prisma.post.create({ data: post });
  }

  protected async clearData(): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.comment.deleteMany(),
      this.prisma.vote.deleteMany(),
      this.prisma.post.deleteMany(),
    ]);
  }
}
