export class UserRepository {
  constructor(typeorm) {
    this.typeorm = typeorm;
  }
  findUserByClientId = async (clientId) => {
    const user = await this.typeorm.user.findOne({
      where: {
        clientId: Number(clientId)
      }
    })
    return user;
  };
  findUserByEmail = async (email) => {
    const user = await this.typeorm.findOne({
      where: {
        email: email,
      }
    });
    return user;
  };
  findUserByUserId = async (userId) => {
    const user = await this.typeorm.findOne({
      where: {
        userId: Number(userId),
      },
    });
    return user;
  }
  createUserByKakao = async (clientId, name, role) => {
    const user = await this.prisma.user.save({

      clientId,
      name,
      role,

    })
    return user;
  }
  createUserByEmail = async (email, password, name, role) => {
    const user = await this.typeorm.save({
      email,
      password,
      name,
      role,
    });
    return user;
  }
}
