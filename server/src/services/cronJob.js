const cron = require('node-cron')
const cronList = require('../crons')

module.exports = () => {
	cronList.forEach(cr => {
		if (typeof cr.job !== 'function') return
		cron.schedule(cr.schedule, () => {
			cr.job()
		})
	})
}
