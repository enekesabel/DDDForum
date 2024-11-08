import { ProductionRepository } from '../../../shared';
import { UserCreateInput, UsersRepository, UserUpdateInput } from '../ports/UsersRepository';

export class ProductionUsersRepository extends ProductionRepository implements UsersRepository {
  findUserById = (id: number) => this.prisma.user.findUnique({ where: { id } });
  findUserByEmail = (email: string) => this.prisma.user.findUnique({ where: { email } });
  findUserByUsername = (username: string) => this.prisma.user.findUnique({ where: { username } });
  createUser = async (userData: UserCreateInput) => {
    return this.prisma.user.create({
      data: {
        ...userData,
        member: { create: {} },
      },
      include: { member: true },
    });
  };
  updateUser = (id: number, userData: UserUpdateInput) =>
    this.prisma.user.update({
      where: {
        id,
      },
      data: userData,
    });
  protected async clearData(): Promise<void> {
    await this.prisma.$transaction([this.prisma.member.deleteMany(), this.prisma.user.deleteMany()]);
  }
}
