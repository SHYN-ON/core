const CONSTANT = {
	domain: 'core.shyn.org',
	isDevEnv: process.env.NODE_ENV === 'development',
	port: process.env.PORT || 80,
	siteUpdateInterval: 4320 // in minutes
}

module.exports = CONSTANT
