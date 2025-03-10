const express = require('express');
const router = express.Router();
const {shortenUrl,getShortenUrlAlias,getUrlAnalytics,getTopicAnalytics,getoverallAnalytics} = require('./../controllers/urls');
const {shortenUrlValidation} = require('./../validations/urls');
const middleware = require('./../middleware/validation')
const {isAuthenticated} = require('./../middleware/auth')

router.get('/analytics/overall',isAuthenticated,getoverallAnalytics )
router.post('/shorten',isAuthenticated, middleware(shortenUrlValidation), shortenUrl)
router.get('/shorten/:alias', getShortenUrlAlias )
router.get('/analytics/:alias',isAuthenticated ,getUrlAnalytics )
router.get('/analytics/topic/:topic', isAuthenticated,getTopicAnalytics )

module.exports = router;