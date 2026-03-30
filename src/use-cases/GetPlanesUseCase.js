const UtilityRepository = require('../repositories/UtilityRepository');

class GetPlanesUseCase {
    constructor(utilityRepository) {
        this.utilityRepository = utilityRepository;
    }

    async execute() {
        return await this.utilityRepository.getPlanes();
    }
}

module.exports = GetPlanesUseCase;