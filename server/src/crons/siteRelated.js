const axios = require('axios')
const jsdom = require('jsdom')
const imgColor = require('img-color')
const CONSTANT = require('../constants')
const SiteModel = require('../models/site')
const { JSDOM } = jsdom

async function fetchSites (url) {
	const result = []

	if (!url) return result

	let mColor

	try {
		const sites = await axios.get(`https://www.similarsites.com/site/${url}`)
		const dom = new JSDOM(sites.data)
		const list = dom.window.document.querySelectorAll("[class^='SimilarSitesCard__Domain']")
		const favs = dom.window.document.querySelectorAll("div[class^='SimilarSitesCards__'] img[class^='styled-components__Favicon']")
		const mainFav = dom.window.document.querySelector("img[class^='styled-components__Favicon']")

		if (mainFav) {
			try {
				mColor = await imgColor.getDominantColor(mainFav.src)
			} catch (_) {}
		}

		if (list.length) {
			for (let i = 0; i < list.length; i++) {
				let src = favs[i].src
				let color
				if (src) {
					try {
						if (src.startsWith('//')) src = 'https:' + src
						color = await imgColor.getDominantColor(src)
					} catch (_) {}
				}

				result.push({
					url: list[i].textContent,
					color: color ? '#' + color.dColor : '#000'
				})
			}
		}
	} catch (_) {}

	return {
		list: result,
		color: mColor ? '#' + mColor.dColor : '#000'
	}
}

module.exports = async () => {
	const date = new Date()
	date.setDate(date.getDate() - CONSTANT.siteUpdateInterval)

	const sites = await SiteModel.find({
		updatedAt: {
			$lte: date
		}
	})

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
}
