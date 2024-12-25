const base58 = require('base58');
const Url = require('./../models/urls');
const crypto = require('crypto');
const base62 = require('base62');

exports.shortenUrl = async (req, res, next) => {
    try {
        const { url, alias, topic } = req.body;

        const urlDetails = await Url.findOne({ orig_url: url });
        if (urlDetails) {
            return res.status(200).json({
                short: "ok"
            })
        }

        const date = Date.now();
        const base62String = base62.encode(date.toString());
        console.log(base62String,`${date.toString()}${123232}`);

        const newUrl = new Url({
            orig_url: url,
            alias: alias || base62String,
            topics: topic,
            clicks: 0,
        });
        
        return res.status(200).json({
            shortUrl: base58Encoded,
            createdAt:newUrl.createdAt
        })
    } catch (error) {
        console.log(error);
    }
}

exports.getShortenUrlAlias = async(req,res,next)=>{
    try {
        const {alias} = req.params;

        const urlDetails = await Url.findOne({ alias });
        if (urlDetails) {
            return res.status(200).json({
                short: urlDetails._id
            })
        }
        
        return res.status(404).json({
            message:"Url does not exist"
        })
        console.log(alias);
    } catch (error) {
        console.log(error);
    }
}

exports.getUrlAnalytics = async(req,res,next)=>{
    try {
        const {alias} = req.params;
    } catch (error) {
        console.log(error);
    }
}

exports.getTopicAnalytics = async(req,res,next)=>{
    try {
        const {topic } = req.params;
    } catch (error) {
        console.log(error);
    }
}

exports.getoverallAnalytics = async(req,res,next)=>{
    try {
        
    } catch (error) {
        console.log(error);
    }
}