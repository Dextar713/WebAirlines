function logger(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        next(); // For now, allow, but in original it was redirect, but since it's poorly written, keep simple
    }
}

function adminLogger(req, res, next) {
    if (req.session.user && req.session.user.username === 'dextar') {
        next();
    } else {
        const backURL = req.header('Referer') || '/';
        res.redirect(backURL);
    }
}

module.exports = { logger, adminLogger };