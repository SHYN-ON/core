const express = require('express')
const SiteModel = require('../models/site')
const router = express.Router()

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

	if (site.updatedAt.getFullYear() === 1980) return res.status(404).send('Try again!')

	res.status(200).json(site)
})

module.exports = router
