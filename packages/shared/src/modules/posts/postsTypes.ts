import { z } from 'zod';
import { createAPIResponseSchema, GenericErrors } from '../../shared';
import { UserSchema } from '../users/usersTypes';

export type PostInput = {
  postType: string;
  title: string;
  content: string;
  memberId: number;
};

export const CommentSchema = z.object({
  id: z.number().int(),
  postId: z.number().int(),
  text: z.string(),
  memberId: z.number().int(),
  parentCommentId: z.number().int().nullable(),
});
export type Comment = z.infer<typeof CommentSchema>;

export const VoteSchema = z.object({
  id: z.number().int(),
  postId: z.number().int(),
  memberId: z.number().int(),
  voteType: z.string(),
});
export type Vote = z.infer<typeof VoteSchema>;

export const PostSchema = z.object({
  id: z.number().int(),
  memberId: z.number().int(),
  postType: z.string(),
  title: z.string(),
  content: z.string(),
  dateCreated: z.date(),
  comments: z.array(CommentSchema),
  votes: z.array(VoteSchema),
  memberPostedBy: z.object({
    id: z.number().int(),
    user: UserSchema,
  }),
});
export type Post = z.infer<typeof PostSchema>;
export const GetPostsResponseSchema = createAPIResponseSchema(PostSchema.array(), GenericErrors);

export type GetPostsResponse = z.infer<typeof GetPostsResponseSchema>;
