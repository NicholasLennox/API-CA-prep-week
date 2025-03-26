const express = require('express')
const jsend = require('jsend');
const authRouter = require('../routes/auth')
const eventRouter = require('../routes/events')
const { errorHandler } = require('../middleware/errorHandler')

const app = express()
app.use(express.json())
app.use(jsend.middleware)
app.use('/auth', authRouter)
app.use('/events', eventRouter)
app.use(errorHandler)

module.exports = app