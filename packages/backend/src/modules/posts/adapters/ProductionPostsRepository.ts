import { Repository } from '../../../shared';
import { PostsRepository } from '../ports/PostsRepository';

export class ProductionPostsRepository extends Repository implements PostsRepository {
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
}
