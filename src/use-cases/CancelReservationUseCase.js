const ReservationRepository = require('../repositories/ReservationRepository');

class CancelReservationUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    async execute(reservationId) {
        await this.reservationRepository.delete(reservationId);
    }
}

module.exports = CancelReservationUseCase;