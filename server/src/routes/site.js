const express = require('express')
const router = express.Router()
const SiteModel = require('../models/site')

router.get('/', async (req, res) => {
	if (!req.query && !req.query.url) return res.status(400).send('Request body is missing.')
	let url
	let site

	try {
		url = new URL(req.query.url)
		url = url.host.match(/[^.]*\.[^.]*$/)[0]
	} catch (_) {
		return res.status(400).send('Invalid URL parameter.')
	}

	site = await SiteModel.findOne({ url })

	if (!site) site = await new SiteModel({ url }).save()

	if (site.updatedAt.getFullYear() < 2000) return res.status(404).send('Try again!')

	res.status(200).json(site)
})

router.post('/vote', async (req, res) => {
	if (!req.body && !req.body.url) return res.status(400).send('Request body is missing.')

	let url
	let site

	try {
		url = new URL(req.query.url)
		url = url.host.match(/[^.]*\.[^.]*$/)[0]
	} catch (_) {
		return res.status(400).send('Invalid URL parameter.')
	}

	site = await SiteModel.findOne({ url })
	if (!site) return res.status(404).send('Site not found.')

	site[`${req.body.down ? 'down' : 'up'}Votes`]++

	await site.save()

	res.status(200).send()
})

module.exports = router
