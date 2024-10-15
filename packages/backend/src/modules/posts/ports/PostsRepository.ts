import type { PrismaClient } from '@prisma/client';

let _client: PrismaClient;

type Posts = Awaited<
  ReturnType<
    typeof _client.post.findMany<{
      include: {
        votes: true;
        memberPostedBy: {
          include: {
            user: true;
          };
        };
        comments: true;
      };
      orderBy: {
        dateCreated: 'desc';
      };
    }>
  >
>;

export interface PostsRepository {
  getPosts(): Promise<Posts>;
}
