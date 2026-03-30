const express = require('express');
const FlightController = require('../controllers/FlightController');
const { logger, adminLogger } = require('../middlewares/auth');

function createFlightRoutes(flightController) {
    const router = express.Router();

    router.get('/', flightController.home.bind(flightController));

    router.get('/book_flight', logger, flightController.bookFlightPage.bind(flightController));

    router.post('/book_flight', express.urlencoded({ extended: true }), logger, flightController.searchFlights.bind(flightController));

    router.get('/target_flights', logger, flightController.targetFlights.bind(flightController));

    router.get('/flight/:id', flightController.flightDetails.bind(flightController));

    router.post('/flight/:id/book', express.json(), logger, flightController.bookFlight.bind(flightController));

    router.post('/flight/:id/cancel', adminLogger, flightController.cancelFlight.bind(flightController));

    router.post('/flight/:id/delay', express.urlencoded({ extended: true }), adminLogger, flightController.delayFlight.bind(flightController));

    router.get('/flight_add', adminLogger, flightController.addFlightPage.bind(flightController));

    router.post('/flight_add', express.urlencoded({ extended: true }), adminLogger, flightController.addFlight.bind(flightController));

    router.get('/admin', adminLogger, (req, res) => res.render('admin.html', { user: req.session.user }));

    return router;
}

module.exports = createFlightRoutes;