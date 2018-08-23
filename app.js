const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const logger = require('morgan')

const deploymentRouter = require('./routes/deployment')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/v1/deployment', deploymentRouter)

module.exports = app
