const express = require('express');
const ProfileController = require('../controllers/ProfileController');

function createProfileRoutes(profileController) {
    const router = express.Router();

    router.get('/profile', profileController.profile.bind(profileController));

    router.post('/cancel_reservation/:id', profileController.cancelReservation.bind(profileController));

    return router;
}

module.exports = createProfileRoutes;