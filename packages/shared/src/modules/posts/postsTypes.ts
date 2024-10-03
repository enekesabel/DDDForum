import { APIResponse, GenericErrors } from '../../shared/api';

export type Comment = {
  id: number;
  postId: number;
  text: string;
  memberId: number;
  parentCommentId: number | null;
};

export type Vote = {
  id: number;
  postId: number;
  memberId: number;
  voteType: string;
};

export type Post = {
  id: number;
  memberId: number;
  postType: string;
  title: string;
  content: string;
  dateCreated: Date;
  comments: Comment[];
  votes: Vote[];
  memberPostedBy: {
    id: number;
    user: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      username: string;
    };
  };
};

export type GetPostsResponse = APIResponse<Post[], GenericErrors>;
