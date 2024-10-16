import { MarketingService } from '../modules/marketing';
import { PostsService } from '../modules/posts';
import { UsersService } from '../modules/users';
import { NotificationsService } from '../modules/notifications';

export interface Application {
  users: UsersService;
  posts: PostsService;
  marketing: MarketingService;
  notifications: NotificationsService;
}
