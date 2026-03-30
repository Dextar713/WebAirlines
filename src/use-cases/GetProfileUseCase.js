const ReservationRepository = require('../repositories/ReservationRepository');

class GetProfileUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    async execute(clientId) {
        const bookings = await this.reservationRepository.getByClientId(clientId);
        const stats = await this.reservationRepository.getStats(clientId);
        return { bookings, stats };
    }
}

module.exports = GetProfileUseCase;