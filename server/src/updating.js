/* eslint-disable no-console */
const mongooseConnect = require('./services/mongoose')
const SiteModel = require('./models/site')

mongooseConnect().then(async () => {
	if (process.env.ACTION === 'check') {
		const count = await SiteModel.countDocuments({ isUpdating: true })
		console.log('%d sites are updating.', count)
	} else if (process.env.ACTION === 'fix') {
		const res = await SiteModel.updateMany({ isUpdating: false })
		console.log('%d sites fixed.', res.nModified)
	}
})
