const express = require('express');
const router = express.Router();
const {shortenUrl,getShortenUrlAlias,getUrlAnalytics,getTopicAnalytics,getoverallAnalytics} = require('./../controllers/urls');
const {shortenUrlValidation,shortenUrlAliasValidation} = require('./../validations/urls');
const middleware = require('./../middleware/validation')

router.post('/shorten', middleware(shortenUrlValidation), shortenUrl)
router.get('/shorten/:alias', middleware(shortenUrlAliasValidation), getShortenUrlAlias )
router.get('/analytics/:alias', getUrlAnalytics )
router.get('/analytics/topic/:topic', getTopicAnalytics )
router.get('/analytics/overall', getoverallAnalytics )

module.exports = router;