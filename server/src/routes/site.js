const express = require('express')
const axios = require('axios')
const jsdom = require('jsdom')
const Vibrant = require('node-vibrant')
const { JSDOM } = jsdom
const SiteModel = require('../models/site')
const router = express.Router()
const CONSTANT = require('../constants')

async function fetchSites (url) {
	const result = []

	if (!url) return result

	try {
		const sites = await axios.get(`https://www.similarsites.com/site/${url}`)
		const dom = new JSDOM(sites.data)
		const list = dom.window.document.querySelectorAll("[class^='SimilarSitesCard__Domain']")
		const favs = dom.window.document.querySelectorAll("[class^='styled-components__Favicon']")

		if (list.length) {
			for (let i = 0; i < list.length; i++) {
				let color
				if (favs[i + 2].src) {
					try {
						color = await Vibrant.from(favs[i + 2].src).getPalette()
					} catch (_) {}
				}

				result.push({
					url: list[i].textContent,
					color: color && color.DarkVibrant ? await color.DarkVibrant.getHex() : '#000'
				})
			}
		}
	} catch (_) {}

	return result
}

router.get('/', async (req, res) => {
	if (!req.query && !req.query.url) return res.status(400).send('Request body is missing.')
	let url
	let site

	try {
		url = new URL(req.query.url)
		url = url.host.match(/[^.]*\.[^.]*$/)[0]
	} catch (err) {
		return res.status(400).send('Invalid URL parameter.')
	}

	site = await SiteModel.findOne({ url })

	if (!site) site = await new SiteModel({ url }).save()

	if (site.isUpdating) return res.status(403).send('Try again!')

	if (new Date().getTime() - (CONSTANT.siteUpdateInterval * 60 * 1000) > site.updatedAt.getTime()) {
		site.isUpdating = true
		await site.save()

		const related = await fetchSites(site.url)
		if (related.length) {
			for (let i = 0; i < related.length; i++) {
				related[i].related = await fetchSites(related[i].url)
			}
			site.related = related
			site.updatedAt = new Date()
			site.isUpdating = false
			await site.save()
		}
	}

	res.status(200).json(site)
})

module.exports = router
