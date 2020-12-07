/* eslint-disable no-console */
const express = require('express')
const history = require('connect-history-api-fallback')
const compression = require('compression')
const bodyParser = require('body-parser')
const cors = require('cors')
const CONSTANT = require('./constants')
const mongooseConnect = require('./services/mongoose')
const routes = require('./routes')
const initCronJobs = require('./services/cronJob')
const app = express()

console.log(Array.from(Array(20), () => '-').join(''))
console.log(`Starting v${process.env.npm_package_version} in ${CONSTANT.isDevEnv ? 'DEVELOPMENT' : 'PRODUCTION'}`)

// Connect to MongoDB via Mongoose
mongooseConnect().then(() => {
	initCronJobs()
	// Use compression
	app.use(compression())

	app.use(
		cors({
			origin: '*',
			allowedHeaders: ['Content-Type, Authorization']
		})
	)

	// Set our REST end points
	app.use('/api', bodyParser.json(), routes)

	app.use(history())

	// Directly serve the static content in the public folder
	app.use(express.static('public'))

	// Start the server
	app.listen(CONSTANT.port, () => console.log(`Server has started on port ${CONSTANT.port}`))
})
