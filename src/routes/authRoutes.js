const express = require('express');
const AuthController = require('../controllers/AuthController');
const { logger } = require('../middlewares/auth');

function createAuthRoutes(authController) {
    const router = express.Router();

    router.get('/login', (req, res) => {
        if (req.session.user) {
            res.redirect('/airline');
        } else {
            res.render('login.html', { user: req.session.user });
        }
    });

    router.post('/login', express.json(), authController.login.bind(authController));

    router.get('/register', (req, res) => {
        if (req.session.user) {
            res.redirect('/airline');
        } else {
            res.render('register.html', { user: req.session.user });
        }
    });

    router.post('/register', express.json(), authController.register.bind(authController));

    router.get('/logout', authController.logout.bind(authController));

    return router;
}

module.exports = createAuthRoutes;