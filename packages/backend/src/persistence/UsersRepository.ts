import { Prisma, PrismaClient } from '@prisma/client';

export class UsersRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  findUserById = (id: number) => this.prisma.user.findUnique({ where: { id } });
  findUserByEmail = (email: string) => this.prisma.user.findUnique({ where: { email } });
  findUserByUsername = (username: string) => this.prisma.user.findUnique({ where: { username } });
  createUser = async (userData: Prisma.UserCreateInput) => {
    const cratedUser = await this.prisma.$transaction(async () => {
      const user = await this.prisma.user.create({ data: userData });
      await this.prisma.member.create({ data: { userId: user.id } });
      return user;
    });
    return cratedUser;
  };
  updateUser = (id: number, userData: Prisma.UserUpdateInput) =>
    this.prisma.user.update({
      where: {
        id,
      },
      data: userData,
    });
}
