const LoginUseCase = require('../use-cases/LoginUseCase');
const RegisterUseCase = require('../use-cases/RegisterUseCase');

class AuthController {
    constructor(loginUseCase, registerUseCase) {
        this.loginUseCase = loginUseCase;
        this.registerUseCase = registerUseCase;
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await this.loginUseCase.execute(username, password);
            req.session.user = user;
            res.json({ url: '/airline' });
        } catch (error) {
            res.json({ error: error.message });
        }
    }

    async register(req, res) {
        try {
            const { username, password, first_name, last_name, email } = req.body;
            const user = await this.registerUseCase.execute({ username, password, firstName: first_name, lastName: last_name, email });
            req.session.user = user;
            res.json({ url: '/airline' });
        } catch (error) {
            res.json({ error: error.message });
        }
    }

    logout(req, res) {
        req.session.destroy();
        res.redirect('/airline');
    }
}

module.exports = AuthController;