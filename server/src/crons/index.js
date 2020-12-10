const siteRelated = require('./siteRelated')

module.exports = [
	{ name: 'siteRelated', schedule: '*/30 * * * * *', job: siteRelated }
]
