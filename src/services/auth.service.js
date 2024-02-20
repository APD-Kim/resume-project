export class AuthService {
  // postsRepository = new PostsRepository();

  constructor(authRepository) {
    this.authRepository = authRepository;
  }
  findUserByUserId = async (userId) => {
    const user = await this.authRepository.findUserByUserId(userId);
    return user;
  }
}