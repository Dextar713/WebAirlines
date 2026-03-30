const FlightRepository = require('../repositories/FlightRepository');

class SearchFlightsUseCase {
    constructor(flightRepository) {
        this.flightRepository = flightRepository;
    }

    async execute(from, to, startDate, priceLimit, peopleNum) {
        const flights = await this.flightRepository.searchFlights(from, to, startDate, priceLimit);
        // Filter by remaining seats
        return flights.filter(flight => flight.remainingSeats >= peopleNum);
    }
}

module.exports = SearchFlightsUseCase;