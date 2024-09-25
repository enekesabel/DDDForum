import { prisma } from '../../../src/database';

export const clearDatabase = async () => {
  const deleteAllUser = prisma.user.deleteMany();
  const deleteAllMember = prisma.member.deleteMany();
  const deleteAllPost = prisma.post.deleteMany();
  const deleteAllPostVote = prisma.vote.deleteMany();
  const deleteAllPostComment = prisma.comment.deleteMany();

  try {
    await prisma.$transaction([deleteAllPostVote, deleteAllPostComment, deleteAllPost, deleteAllMember, deleteAllUser]);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};
