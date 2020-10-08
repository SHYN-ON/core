const express = require('express')
const router = express.Router()
const site = require('./site')

router.use('/site', site)

module.exports = router
