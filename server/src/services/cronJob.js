const cron = require('node-cron')
const cronList = require('../crons')

module.exports = () => {
	cronList.forEach(cr => {
		if (typeof cr.job !== 'function') return
		cron.schedule(cr.schedule, () => {
			// eslint-disable-next-line no-console
			console.info('Running cron %j at', cr.name, new Date())
			cr.job()
		})
	})
}
