export class AuthRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  findUserByUserId = async (userId) => {
    const user = await this.prisma.user.findFirst({
      where: {
        userId: Number(userId),
      },
    });
    return user;
  }
}