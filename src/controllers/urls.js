const {
  findOneUrl,
  createUrl,
  getUrlAliasAnalytics,
  getOverallAnalytics,
  getTopicAnalytics,
  createAnalytics,
} = require("./../services/urls");
const base62 = require("base62");
const UAParser = require("ua-parser-js");
const redis = require("./../config/redis");
const geoip = require("geoip-lite");

exports.shortenUrl = async (req, res, next) => {
  try {
    const { longUrl, customAlias, topic } = req.body;

    const urlDetails = await findOneUrl({ alias: customAlias });
    if (urlDetails) {
      return res.status(200).json({
        message:
          "Alias already exists, If you dont pass one, we will create a random alias for you!",
      });
    }
    const date = Date.now();
    const base62String = base62.encode(date.toString());

    const newUrl = await createUrl({
      orig_url: longUrl,
      alias: customAlias || base62String,
      topic,
      createdBy: req?.user?._id,
    });

    return res.status(200).json({
      shortUrl: `${process.env.BASE_URL}/api/shorten/${newUrl.alias}`,
      createdAt: newUrl.createdAt,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Something Went Wrong",
    });
  }
};

exports.getShortenUrlAlias = async (req, res) => {
  try {
    const { alias } = req.params;
    let urlDetails = await redis.get(alias);
    urlDetails = JSON.parse(urlDetails);

    if (!urlDetails) {
      urlDetails = await findOneUrl({ alias });
      if (!urlDetails) {
        return res.status(404).json({
          message: "Url not found",
        });
      }
      console.log("Saving Url details in redis");
      await redis.set(
        alias,
        JSON.stringify({ _id: urlDetails._id, orig_url: urlDetails.orig_url })
      );
    }

    const userAgent = req.get("User-Agent")?.toLowerCase();
    const { osType, deviceType } = getDeviceAndOSType(userAgent);
    const { ip } = req;

    const geo = geoip.lookup(ip);

    const v = await createAnalytics({
      urlId: urlDetails._id,
      osType: osType || "unknown",
      deviceType: deviceType || "unknown",
      ipAddress: ip,
      geoLocation: geo,
    });
    return res.redirect(301, urlDetails.orig_url);
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Something Went Wrong",
    });
  }
};

function getDeviceAndOSType(userAgent) {
  const parser = new UAParser();
  parser.setUA(userAgent);
  const result = parser.getResult();

  // Extract OS type and device type
  const osType = result.os.name;
  const deviceType = result.device.type;
  return {
    osType: osType?.toLowerCase() || "unknown",
    deviceType: deviceType?.toLowerCase() || "desktop",
  };
}

exports.getUrlAnalytics = async (req, res, next) => {
  try {
    const { alias } = req.params;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const result = await getUrlAliasAnalytics({
      alias,
      createdAt: { $gt: sevenDaysAgo },
    });
    res.status(200).json({
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Something Went Wrong",
    });
  }
};

exports.getTopicAnalytics = async (req, res, next) => {
  try {
    const { topic } = req.params;
    const result = await getTopicAnalytics({ topic });
    res.status(200).json({
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Something Went Wrong",
    });
  }
};

exports.getoverallAnalytics = async (req, res, next) => {
  try {
    const result = await getOverallAnalytics(req?.user?._id);
    res.status(200).json({
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Something Went Wrong",
    });
  }
};

exports.RegisterUser = async (req, res, next) => {
  try {
    const { user, token } = req.user;

    res.json({
      message: "Registration or Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Something Went Wrong",
    });
  }
};
