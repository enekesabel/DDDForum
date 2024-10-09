import { useEffect, useState } from 'react';
import { Post } from '@dddforum/shared/src/modules/posts';
import { toast } from 'react-toastify';
import { Layout } from '../components/layout';
import { PostsList } from '../components/postsList';
import { PostsViewSwitcher } from '../components/postsViewSwitcher';
import { api } from '../api';

export const MainPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const loadPosts = async () => {
    try {
      const response = await api.posts.getPosts('recent');

      if (!response.data) {
        return toast.error('Error while loading posts.');
      }
      setPosts(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <Layout>
      <PostsViewSwitcher />
      <PostsList posts={posts} />
    </Layout>
  );
};
