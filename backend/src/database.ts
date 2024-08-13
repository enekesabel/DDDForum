import { Prisma, PrismaClient } from '@prisma/client';
export { User } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

type UserData = Prisma.UserCreateInput;
export const findUserById = (id: number) => prisma.user.findUnique({ where: { id } });
export const findUserByEmail = (email: string) => prisma.user.findUnique({ where: { email } });
export const findUserByUsername = (username: string) => prisma.user.findUnique({ where: { username } });
export const createUser = async (userData: UserData) => {
    const cratedUser = await prisma.$transaction(async (tx) => {
        const user = await prisma.user.create({ data: userData });
        await prisma.member.create({ data: { userId: user.id } });
        return user;
    });
    return cratedUser;
};
export const updateUser = (id: number, userData: UserData) =>
    prisma.user.update({
        where: {
            id,
        },
        data: userData,
    });
