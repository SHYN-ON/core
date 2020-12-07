const siteRelated = require('./siteRelated')

module.exports = [
	{ name: 'siteRelated', schedule: '* * * * *', job: siteRelated }
]
