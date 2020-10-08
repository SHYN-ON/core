/* eslint-disable no-console */
const mongoose = require('mongoose')
const mongodb = require('../config/mongodb')
const CONSTANT = require('../constants')

module.exports = () => {
	console.log('Connecting to MongoDB...')
	const rw = 'retryWrites=true'
	let connectURL = `mongodb+srv://${mongodb.prod.user}:${mongodb.prod.password}@${mongodb.prod.host}/${mongodb.prod.database}?${rw}`

	if (CONSTANT.isDevEnv || !mongodb.prod.user) {
		connectURL = `mongodb://${mongodb.dev.host}:27017/${mongodb.dev.database}?${rw}`
	}

	mongoose.connection.on('connected', () => {
		console.log('Connection to MongoDB established.')
	})

	mongoose.connection.on('error', () => {
		console.error('MongoDB connection error.')
	})

	return mongoose.connect(connectURL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		autoIndex: true,
		useUnifiedTopology: true
	})
}
