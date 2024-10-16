import { PostsRepository, GetPostsOutput, PostCreateInput } from '../ports/PostsRepository';

export class InMemoryPostsRepository implements PostsRepository {
  private posts: GetPostsOutput;

  constructor() {
    this.posts = [];
  }

  async getPosts(): Promise<GetPostsOutput> {
    return [...this.posts].sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
  }

  async create(post: PostCreateInput) {
    const { memberId } = post;

    const newPost = {
      ...post,
      id: this.posts.length + 1,
      dateCreated: new Date(),
      comments: [],
      votes: [],
      memberPostedBy: {
        id: memberId,
        userId: memberId,
        user: {
          id: memberId,
          username: 'test',
          email: 'test@example.com',
          firstName: '',
          lastName: '',
          password: '',
        },
      },
    };

    this.posts.push(newPost);
    return newPost;
  }

  async clear(): Promise<void> {
    this.posts = [];
  }
}
