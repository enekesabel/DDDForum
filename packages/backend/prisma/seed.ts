import { Prisma } from '@prisma/client';
import { prisma } from '../src/database';

const initialUsers: Prisma.UserCreateInput[] = [
  {
    email: 'bobvance@gmail.com',
    firstName: 'Bob',
    lastName: 'Vance',
    username: 'bobvance',
    password: '123',
    member: {
      create: {},
    },
  },
  {
    email: 'tonysoprano@gmail.com',
    firstName: 'Tony',
    lastName: 'Soprano',
    username: 'tonysoprano',
    password: '123',
    member: {
      create: {},
    },
  },
  {
    email: 'billburr@gmail.com',
    firstName: 'Bill',
    lastName: 'Burr',
    username: 'billburr',
    password: '123',
    member: {
      create: {},
    },
  },
];

const initialPosts: Prisma.PostCreateInput[] = [
  {
    title: 'First post!',
    content: 'This is bob vances first post',
    postType: 'Text',
    dateCreated: new Date(),
    memberPostedBy: {
      connect: {
        id: 1,
      },
    },
  },
  {
    title: 'Second post!',
    content: 'This is bobs second post',
    postType: 'Text',
    dateCreated: new Date(),
    memberPostedBy: {
      connect: {
        id: 1,
      },
    },
  },
  {
    title: 'another post',
    content: 'This is tonys first post',
    postType: 'Text',
    dateCreated: new Date(),
    memberPostedBy: {
      connect: {
        id: 2,
      },
    },
  },
  {
    title: 'Links',
    content: 'This is a link post',
    postType: '<https://khalilstemmler.com>',
    dateCreated: new Date(),
    memberPostedBy: {
      connect: {
        id: 2,
      },
    },
  },
];

const initialPostVotes: Prisma.VoteCreateInput[] = [
  // Everyone upvotes their own first post
  { postBelongsTo: { connect: { id: 1 } }, voteType: 'Upvote', memberPostedBy: { connect: { id: 1 } } },
  { postBelongsTo: { connect: { id: 2 } }, voteType: 'Upvote', memberPostedBy: { connect: { id: 1 } } },
  { postBelongsTo: { connect: { id: 3 } }, voteType: 'Upvote', memberPostedBy: { connect: { id: 2 } } },
  { postBelongsTo: { connect: { id: 4 } }, voteType: 'Upvote', memberPostedBy: { connect: { id: 2 } } },

  // Tony's post upvoted by Bob
  { postBelongsTo: { connect: { id: 3 } }, voteType: 'Upvote', memberPostedBy: { connect: { id: 1 } } },

  // Bob's second post downvoted by Bill
  { postBelongsTo: { connect: { id: 2 } }, voteType: 'Downvote', memberPostedBy: { connect: { id: 3 } } },
];

const initialPostComments: Prisma.CommentCreateInput[] = [
  { text: 'I posted this!', memberPostedBy: { connect: { id: 1 } }, post: { connect: { id: 1 } } },
  { text: 'Nice', memberPostedBy: { connect: { id: 2 } }, post: { connect: { id: 2 } } },
];

async function seed() {
  for (const user of initialUsers) {
    const newUser = await prisma.user.create({
      data: user,
    });
  }

  for (const post of initialPosts) {
    await prisma.post.create({
      data: post,
    });
  }

  for (const vote of initialPostVotes) {
    await prisma.vote.create({
      data: vote,
    });
  }

  for (const comment of initialPostComments) {
    await prisma.comment.create({
      data: comment,
    });
  }
}

seed();
