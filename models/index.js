const { Sequelize, DataTypes } = require('sequelize')
const fs = require('fs');
const path = require('path');
const dbConfig = require('./dbConfig')


// Create instance
const sequelize = new Sequelize(dbConfig)

// Created a wrapper
const db = {}
db.sequelize = sequelize

// Import all models dynamically
fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.model.js'))
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, DataTypes)
        db[model.name] = model
})

// Configure any relationships
Object.keys(db).forEach(prop => {
    if(db[prop].associate) {
        db[prop].associate(db)   
    }
})

// Export wrapper
module.exports = db