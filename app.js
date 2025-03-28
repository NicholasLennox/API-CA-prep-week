var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
const { errorHandler } = require('./middleware/errorHandler')
const jsend = require('jsend')
const db = require('./models')
// Swagger UI dependencies
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger-output.json')

const app = express();
const authRouter = require('./routes/auth')
const eventRouter = require('./routes/events')

app.use(logger('dev'));
app.use(express.json());
app.use(jsend.middleware)

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/events', eventRouter)

// Add /docs endpoint to show swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(errorHandler)

db.sequelize.sync({ alter: true }).then(async () => {
  const count = await db.EventType.count()
  if (count === 0) {
    await db.EventType.bulkCreate([
      { id: 1, name: 'Conference' },
      { id: 2, name: 'Meetup' },
      { id: 3, name: 'Workshop' },
      { id: 4, name: 'Seminar' }
    ])
  }
})

// const { initTestDb } = require('./util/testDbInit')

// initTestDb(db).then(() => {

// })


module.exports = app;
