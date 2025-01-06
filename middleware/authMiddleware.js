const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        console.log('No token provided');
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        console.log('User authenticated:', req.userId);
        next();
    } catch (ex) {
        console.log('Invalid token');
        res.status(400).send('Invalid token.');
    }
};