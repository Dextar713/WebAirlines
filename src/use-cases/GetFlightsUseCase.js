const FlightRepository = require('../repositories/FlightRepository');

class GetFlightsUseCase {
    constructor(flightRepository) {
        this.flightRepository = flightRepository;
    }

    async execute() {
        return await this.flightRepository.getUpcomingFlights();
    }
}

module.exports = GetFlightsUseCase;