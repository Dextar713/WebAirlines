const GetProfileUseCase = require('../use-cases/GetProfileUseCase');
const CancelReservationUseCase = require('../use-cases/CancelReservationUseCase');

class ProfileController {
    constructor(getProfileUseCase, cancelReservationUseCase) {
        this.getProfileUseCase = getProfileUseCase;
        this.cancelReservationUseCase = cancelReservationUseCase;
    }

    async profile(req, res) {
        const clientId = req.session.user.clientId;
        const { bookings, stats } = await this.getProfileUseCase.execute(clientId);
        res.render('dashboard.html', { user: req.session.user, bookings, stats });
    }

    async cancelReservation(req, res) {
        const reservationId = parseInt(req.params.id);
        await this.cancelReservationUseCase.execute(reservationId);
        res.redirect('/airline/profile');
    }
}

module.exports = ProfileController;