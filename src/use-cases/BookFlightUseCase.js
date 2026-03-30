const FlightRepository = require('../repositories/FlightRepository');
const ReservationRepository = require('../repositories/ReservationRepository');

class BookFlightUseCase {
    constructor(flightRepository, reservationRepository) {
        this.flightRepository = flightRepository;
        this.reservationRepository = reservationRepository;
    }

    async execute(flightId, clientId, peopleNum) {
        const flight = await this.flightRepository.getFlightById(flightId);
        if (!flight || flight.remainingSeats < peopleNum) {
            throw new Error('Not enough seats left');
        }
        const reservation = await this.reservationRepository.create(flightId, clientId, peopleNum, flight.price);
        return reservation;
    }
}

module.exports = BookFlightUseCase;