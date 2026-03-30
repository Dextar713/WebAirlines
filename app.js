const express = require('express');
const path = require('path');
const session = require('express-session');
const ejs = require('ejs');
const { getConnection, closePool } = require('./src/config/database');

// Import repositories
const UserRepository = require('./src/repositories/UserRepository');
const FlightRepository = require('./src/repositories/FlightRepository');
const ReservationRepository = require('./src/repositories/ReservationRepository');
const UtilityRepository = require('./src/repositories/UtilityRepository');

// Import use cases
const LoginUseCase = require('./src/use-cases/LoginUseCase');
const RegisterUseCase = require('./src/use-cases/RegisterUseCase');
const GetFlightsUseCase = require('./src/use-cases/GetFlightsUseCase');
const SearchFlightsUseCase = require('./src/use-cases/SearchFlightsUseCase');
const BookFlightUseCase = require('./src/use-cases/BookFlightUseCase');
const GetProfileUseCase = require('./src/use-cases/GetProfileUseCase');
const CancelReservationUseCase = require('./src/use-cases/CancelReservationUseCase');
const GetCitiesUseCase = require('./src/use-cases/GetCitiesUseCase');
const GetPlanesUseCase = require('./src/use-cases/GetPlanesUseCase');

// Import controllers
const AuthController = require('./src/controllers/AuthController');
const FlightController = require('./src/controllers/FlightController');
const ProfileController = require('./src/controllers/ProfileController');

// Import routes
const createAuthRoutes = require('./src/routes/authRoutes');
const createFlightRoutes = require('./src/routes/flightRoutes');
const createProfileRoutes = require('./src/routes/profileRoutes');

const app = express();

// Middleware
app.use(express.static('static'));
app.set('view engine', 'html');
app.engine('.html', ejs.renderFile);
app.set('views', 'templates');

app.use(express.static('static/style'));
app.use(express.static('static/img'));
app.use(express.static('static/js'));
app.use(express.static(path.join(__dirname, 'static/style')));

app.use(session({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 }
}));

process.on('uncaughtException', function (err) {
    console.log(err);
});

// Dependency injection
const userRepository = new UserRepository();
const flightRepository = new FlightRepository();
const reservationRepository = new ReservationRepository();
const utilityRepository = new UtilityRepository();

const loginUseCase = new LoginUseCase(userRepository);
const registerUseCase = new RegisterUseCase(userRepository);
const getFlightsUseCase = new GetFlightsUseCase(flightRepository);
const searchFlightsUseCase = new SearchFlightsUseCase(flightRepository);
const bookFlightUseCase = new BookFlightUseCase(flightRepository, reservationRepository);
const getProfileUseCase = new GetProfileUseCase(reservationRepository);
const cancelReservationUseCase = new CancelReservationUseCase(reservationRepository);
const getCitiesUseCase = new GetCitiesUseCase(utilityRepository);
const getPlanesUseCase = new GetPlanesUseCase(utilityRepository);

const authController = new AuthController(loginUseCase, registerUseCase);
const flightController = new FlightController(getFlightsUseCase, searchFlightsUseCase, bookFlightUseCase, getCitiesUseCase, getPlanesUseCase, flightRepository);
const profileController = new ProfileController(getProfileUseCase, cancelReservationUseCase);

// Routes
app.use('/airline', createAuthRoutes(authController));
app.use('/airline', createFlightRoutes(flightController));
app.use('/airline', createProfileRoutes(profileController));

// Hotels route (keeping simple)
app.get('/airline/hotels', (req, res) => {
    res.render('hotels.html', { user: req.session.user, hotels: req.session.hotels });
});

app.post('/airline/hotels', express.urlencoded({ extended: true }), (req, res) => {
    req.session.hotels = null;
    var hotel_str = req.body.hotel;
    if (!hotel_str) {
        res.redirect('/airline/hotels');
        return;
    }
    // Keeping the serpapi call as is
    const { getJson } = require("serpapi");
    getJson({
        engine: "google_hotels",
        q: hotel_str,
        check_in_date: "2024-06-08",
        check_out_date: "2024-06-09",
        adults: "2",
        currency: "USD",
        gl: "us",
        hl: "en",
        api_key: "301c9493828fdbe814daa72775aa318abd192ece5acd68a297a3443d7a646382"
    }, (json) => {
        req.session.hotels = json.properties.slice(0, 5);
        res.redirect('/airline/hotels');
    });
});

app.all('*', (req, res) => {
    res.status(404).send('<h1>Page not found</h1>');
});

async function connect() {
    try {
        await getConnection();
        console.log("Connected to database!");
    } catch (err) {
        console.log(err);
    }
}

connect();

const PORT = process.env.PORT || 7002;
const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});

// Graceful shutdown handlers
const gracefulShutdown = async () => {
    console.log('\nShutting down gracefully...');
    server.close(async () => {
        console.log('Server closed');
        try {
            await closePool();
            console.log('Database pool closed');
        } catch (err) {
            console.error('Error closing database pool:', err);
        }
        process.exit(0);
    });
    
    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
        console.error('Graceful shutdown timeout, forcing exit');
        process.exit(1);
    }, 5000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);