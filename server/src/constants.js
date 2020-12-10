const CONSTANT = {
	domain: 'core.shyn.org',
	isDevEnv: process.env.NODE_ENV === 'development',
	port: process.env.PORT || 80,
	siteUpdateInterval: 30 // in days
}

module.exports = CONSTANT
