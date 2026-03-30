const UserRepository = require('../repositories/UserRepository');

class RegisterUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userData) {
        try {
            const user = await this.userRepository.create(userData);
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = RegisterUseCase;