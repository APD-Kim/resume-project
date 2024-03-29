export class UserRepository {
  constructor(typeorm) {
    this.typeorm = typeorm;
  }
  findUserByClientId = async (clientId) => {
    const user = await this.typeorm.findOne({
      where: {
        clientId: Number(clientId)
      }
    })
    return user;
  };
  findUserByEmail = async (email) => {
    console.log(email);
    const user = await this.typeorm.findOneBy({
      email: email
    });
    console.log("1", user);
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
    const randomNumber = Math.floor(Math.random() * 6)
    console.log(randomNumber);
    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, randomNumber * 1000);
    })
    const user = await this.typeorm.save({
      email,
      password,
      name,
      role,
    });
    return user;
  }
}
