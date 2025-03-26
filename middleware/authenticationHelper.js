const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization']
    let token;
    if (authHeader) {
        token = authHeader.split(' ')[1]
    }

    if (!token) {
        return res.status(401).jsend.fail('No token attached' )
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).jsend.fail('Token has expired' )
            }
            if (err.name === 'JsonWebTokenError' && err.message === 'invalid signature') {
                return res.status(401).jsend.fail('Invalid signature')
            }
            if (err.name === 'JsonWebTokenError' && err.message === 'jwt malformed') {
                return res.status(401).jsend.fail('Malformed token')
            }
        }
        // Add user ID to req.user to easily see who is logged in
        req.user = decoded.sub
        next()
    })
}

module.exports = { authenticateToken }