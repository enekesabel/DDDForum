import { Repository } from '../../shared';

export class PostsRepository extends Repository {
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