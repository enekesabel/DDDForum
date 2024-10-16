import { MarketingService } from '../modules/marketing';
import { PostsService } from '../modules/posts';
import { UsersService } from '../modules/users';

export interface Application {
  users: UsersService;
  posts: PostsService;
  marketing: MarketingService;
}
