const axios = require('axios')
const jsdom = require('jsdom')
const serp = require('serp')
const { JSDOM } = jsdom
const getFaviconColor = require('./favicon')

async function fetchRelatedSites (url) {
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
				delay: 200
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

	return result
}

module.exports = fetchRelatedSites
