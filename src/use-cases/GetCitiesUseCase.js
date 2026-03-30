const UtilityRepository = require('../repositories/UtilityRepository');

class GetCitiesUseCase {
    constructor(utilityRepository) {
        this.utilityRepository = utilityRepository;
    }

    async execute() {
        return await this.utilityRepository.getCities();
    }
}

module.exports = GetCitiesUseCase;