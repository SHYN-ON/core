const axios = require('axios')
const jsdom = require('jsdom')
const serp = require('serp')
const imgColor = require('img-color')
const CONSTANT = require('../constants')
const SiteModel = require('../models/site')
const { JSDOM } = jsdom

async function getFaviconColor (url) {
	let color

	try {
		color = await imgColor.getDominantColor(`https://www.google.com/s2/favicons?domain=${url}`)
	} catch (_) {}

	return color ? '#' + color.dColor : '#000'
}

async function fetchSites (url) {
	const result = []

	if (!url) return result

	try {
		const sites = await axios.get(`https://www.similarsites.com/site/${url}`)
		const dom = new JSDOM(sites.data)
		const list = dom.window.document.querySelectorAll("[class^='SimilarSitesCard__Domain']")

		if (list.length) {
			for (let i = 0; i < list.length; i++) {
				result.push({
					url: list[i].textContent,
					color: await getFaviconColor(list[i].textContent)
				})
			}
		} else {
			const google = await serp.search({
				qs: {
					q: `related:${url}`
				},
				delay: 300
			})

			if (google.length) {
				for (let i = 0; i < google.length; i++) {
					try {
						let curl = new URL(google[i].url)
						curl = curl.host.match(/[^.]*\.[^.]*$/)[0]

						result.push({
							url: curl,
							color: await getFaviconColor(curl)
						})
					} catch (_) {}
				}
			}
		}
	} catch (_) {}

	return {
		list: result,
		color: await getFaviconColor(url)
	}
}

module.exports = async () => {
	const startTime = process.hrtime()
	const date = new Date()
	date.setDate(date.getDate() - CONSTANT.siteUpdateInterval)

	const sites = await SiteModel.find({
		updatedAt: {
			$lte: date
		}
	}).sort({ createdAt: 1 }).limit(1)

	if (sites.length) {
		sites.forEach(async site => {
			const related = await fetchSites(site.url)
			if (related.list.length) {
				for (let i = 0; i < related.list.length; i++) {
					related.list[i].related = (await fetchSites(related.list[i].url)).list
				}
				site.related = related.list
			}

			site.color = related.color
			site.updatedAt = new Date()
			await site.save()
		})
	}

	const endTime = process.hrtime(startTime)
	// eslint-disable-next-line no-console
	console.info('Execution time: %ds %dms', endTime[0], Math.round(endTime[1] / 1000000))
}
