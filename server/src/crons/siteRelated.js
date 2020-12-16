/* eslint-disable no-console */
const CONSTANT = require('../constants')
const SiteModel = require('../models/site')
const fetchRelatedSites = require('../services/siteRelated')
const getFaviconColor = require('../services/favicon')

module.exports = async () => {
	const startTime = process.hrtime()
	const date = new Date()
	date.setDate(date.getDate() - CONSTANT.siteUpdateInterval)

	const sites = await SiteModel.find({
		updatedAt: {
			$lte: date
		},
		isUpdating: false
	}).sort({ createdAt: 1 }).limit(1)

	if (sites.length) {
		for (let si = 0; si < sites.length; si++) {
			sites[si].isUpdating = true
			const site = await sites[si].save()

			try {
				const related = await fetchRelatedSites(site.url)
				if (related.length) {
					for (let i = 0; i < related.length; i++) {
						related[i].related = await fetchRelatedSites(related[i].url)
					}
					site.related = related
				}

				site.color = await getFaviconColor(site.url)
				site.updatedAt = new Date()
			} catch (_) {
				console.info('Failed to update "%d".', site.url)
			}

			site.isUpdating = false
			await site.save()
		}
	}

	const endTime = process.hrtime(startTime)
	console.info('Execution time: %ds %dms', endTime[0], Math.round(endTime[1] / 1000000))
}
