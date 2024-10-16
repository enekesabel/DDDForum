import type { Post, PrismaClient, Prisma } from '@prisma/client';
import { Repository } from '../../../shared';

let _client: PrismaClient;

export type GetPostsOutput = Awaited<
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

export type PostCreateInput = Omit<Prisma.PostUncheckedCreateInput, 'id'>;
export type PostCreateOutput = Post;

export interface PostsRepository extends Repository {
  getPosts(): Promise<GetPostsOutput>;

  create(post: PostCreateInput): Promise<PostCreateOutput>;
}
