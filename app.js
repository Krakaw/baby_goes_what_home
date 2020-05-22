require('dotenv').config()
const createError = require('http-errors')
const express = require('express')
const path = require('path')

const cookieParser = require('cookie-parser')
const logger = require('morgan')

const stream = require('./helpers/stream')
const Config = require('./helpers/config')
const sockets = require('./routes/sockets')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const app = express()

/**
 * TODO Create routes for the casting and reuse in REST and WS
 */

app._config = new Config(process.env.CONFIG_FILE)
app._wsInit = sockets.initialize
app._filesPath = path.join(__dirname, 'public', 'files')

stream.startStreams(app._config.streams)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
