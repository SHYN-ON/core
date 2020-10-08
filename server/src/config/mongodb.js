module.exports = {
	dev: {
		host: process.env.DOCKER === 'true' ? 'mongo' : 'localhost',
		database: 'shyn'
	},
	prod: {
		host: 'localhost',
		database: 'shyn'
	}
}
