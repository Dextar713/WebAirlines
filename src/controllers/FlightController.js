const GetFlightsUseCase = require('../use-cases/GetFlightsUseCase');
const SearchFlightsUseCase = require('../use-cases/SearchFlightsUseCase');
const BookFlightUseCase = require('../use-cases/BookFlightUseCase');
const GetCitiesUseCase = require('../use-cases/GetCitiesUseCase');
const GetPlanesUseCase = require('../use-cases/GetPlanesUseCase');
const FlightRepository = require('../repositories/FlightRepository');

class FlightController {
    constructor(getFlightsUseCase, searchFlightsUseCase, bookFlightUseCase, getCitiesUseCase, getPlanesUseCase, flightRepository) {
        this.getFlightsUseCase = getFlightsUseCase;
        this.searchFlightsUseCase = searchFlightsUseCase;
        this.bookFlightUseCase = bookFlightUseCase;
        this.getCitiesUseCase = getCitiesUseCase;
        this.getPlanesUseCase = getPlanesUseCase;
        this.flightRepository = flightRepository;
    }

    async home(req, res) {
        let allFlights = req.session.all_flights;
        if (!allFlights) {
            try {
                allFlights = await this.getFlightsUseCase.execute();
                req.session.all_flights = allFlights;
            } catch (error) {
                console.error('Error fetching flights:', error);
                allFlights = []; // Fallback to empty array
            }
        }
        console.log('allFlights length:', allFlights ? allFlights.length : 'null/undefined');
        if (allFlights && allFlights.length > 0) {
            console.log('First flight departure_time:', allFlights[0].departure_time, typeof allFlights[0].departure_time);
        }
        res.render('home.html', { user: req.session.user, all_flights: allFlights || [] });
    }

    async bookFlightPage(req, res) {
        let cities = req.session.cities;
        if (!cities) {
            cities = await this.getCitiesUseCase.execute();
            req.session.cities = cities;
        }
        res.render('book.html', { user: req.session.user, cities });
    }

    async searchFlights(req, res) {
        const { start_date, start_city, end_city, cnt_people, price } = req.body;
        const flights = await this.searchFlightsUseCase.execute(start_city, end_city, start_date || '2000-01-01', parseInt(price), parseInt(cnt_people));
        req.session.flights = flights;
        res.redirect('/airline/target_flights');
    }

    targetFlights(req, res) {
        res.render('flights.html', { user: req.session.user, flights: req.session.flights });
    }

    async flightDetails(req, res) {
        const flightId = parseInt(req.params.id);
        const flight = await this.flightRepository.getFlightById(flightId);
        res.render('flight.html', { user: req.session.user, flight });
    }

    async bookFlight(req, res) {
        try {
            const flightId = parseInt(req.params.id);
            const { cnt_people } = req.body;
            const clientId = req.session.user.clientId;
            await this.bookFlightUseCase.execute(flightId, clientId, parseInt(cnt_people));
            req.session.flights = await this.getFlightsUseCase.execute();
            res.json({ url: `/airline/flight/${flightId}` });
        } catch (error) {
            res.json({ error: error.message });
        }
    }

    async cancelFlight(req, res) {
        const flightId = parseInt(req.params.id);
        await this.flightRepository.deleteFlight(flightId);
        req.session.all_flights = await this.getFlightsUseCase.execute();
        res.redirect('/airline/admin');
    }

    async delayFlight(req, res) {
        const flightId = parseInt(req.params.id);
        const { delay } = req.body;
        await this.flightRepository.delayFlight(flightId, parseInt(delay));
        req.session.all_flights = await this.getFlightsUseCase.execute();
        res.redirect(`/airline/flight/${flightId}`);
    }

    async addFlightPage(req, res) {
        let cities = req.session.cities;
        let planes = req.session.planes;
        if (!cities) {
            cities = await this.getCitiesUseCase.execute();
            req.session.cities = cities;
        }
        if (!planes) {
            planes = await this.getPlanesUseCase.execute();
            req.session.planes = planes;
        }
        res.render('flight_add.html', { user: req.session.user, cities, planes });
    }

    async addFlight(req, res) {
        const { start_city, end_city, dur, start_date, plane, price } = req.body;
        await this.flightRepository.addFlight({
            startCity: start_city,
            endCity: end_city,
            duration: parseInt(dur),
            startDate: start_date,
            planeId: parseInt(plane),
            price: parseInt(price)
        });
        req.session.all_flights = await this.getFlightsUseCase.execute();
        res.redirect('/airline/admin');
    }
}

module.exports = FlightController;