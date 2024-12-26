const express = require('express');
const router = express.Router();
const {shortenUrl,getShortenUrlAlias,getUrlAnalytics,getTopicAnalytics,getoverallAnalytics} = require('./../controllers/urls');
const {shortenUrlValidation,shortenUrlAliasValidation,shortenUrlTopicValidation} = require('./../validations/urls');
const middleware = require('./../middleware/validation')
const {isAuthenticated} = require('./../middleware/auth')

router.get('/analytics/overall', getoverallAnalytics )
router.post('/shorten', middleware(shortenUrlValidation), shortenUrl)
router.get('/shorten/:alias', middleware(shortenUrlAliasValidation), getShortenUrlAlias )
router.get('/analytics/:alias', middleware(shortenUrlAliasValidation), getUrlAnalytics )
router.get('/analytics/topic/:topic', middleware(shortenUrlTopicValidation), getTopicAnalytics )

module.exports = router;