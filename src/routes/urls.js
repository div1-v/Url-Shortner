const express = require('express');
const router = express.Router();
const {shortenUrl,getShortenUrlAlias,getUrlAnalytics,getTopicAnalytics,getoverallAnalytics} = require('./../controllers/urls');


router.post('/shorten', shortenUrl)
router.get('/shorten/:alias', getShortenUrlAlias )
router.get('/analytics/:alias', getUrlAnalytics )
router.get('/analytics/topic/:topic', getTopicAnalytics )
router.get('/analytics/overall', getoverallAnalytics )

module.exports = router;