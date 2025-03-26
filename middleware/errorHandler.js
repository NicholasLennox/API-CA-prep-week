const { ValidationError, ForeignKeyConstraintError } = require("sequelize")

function errorHandler(err, req, res, next) {

    // Sequelize errors
    if(err instanceof ValidationError) {               
        return res.status(400).jsend.fail(err.errors.map(err => err.message).join(','))
    }
    
    if(err instanceof ForeignKeyConstraintError) {
        return res.status(400).jsend.fail('Invalid foreign key')
    }

    // http-errors errors
    if(err.status && err.expose !== undefined) {
        return res.status(err.status).jsend.fail(err.message)
    }

    // Server errors
    console.error(err.message);
    res.status(500).jsend.error('Internal server error');
}

module.exports = { errorHandler }