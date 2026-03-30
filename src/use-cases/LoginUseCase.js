const UserRepository = require('../repositories/UserRepository');

class LoginUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(username, password) {
        const user = await this.userRepository.findByUsernameAndPassword(username, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return user;
    }
}

module.exports = LoginUseCase;