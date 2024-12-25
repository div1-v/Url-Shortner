const Url = require("./../models/urls");
const Analytics = require("./../models/analytics");
const base62 = require("base62");
const UAParser = require("ua-parser-js");
const redis = require('./../config/redis')

exports.shortenUrl = async (req, res, next) => {
  try {
    const { longUrl, customAlias, topic } = req.body;

    const urlDetails = await Url.findOne({ orig_url: longUrl });
    if (urlDetails) {
      return res.status(200).json({
        shortUrl: `http://localhost:4000/api/shorten/${urlDetails.alias}`,
        createdAt: urlDetails.createdAt,
      });
    }

    const date = Date.now();
    const base62String = base62.encode(date.toString());

    console.log(base62String, `${date.toString()}${123232}`);
    const newUrl = await Url.create({
      orig_url: longUrl,
      alias: customAlias || base62String,
      topics: topic,
      clicks: 0,
    });

    return res.status(200).json({
      shortUrl: `http://localhost:4000/api/shorten/${newUrl.alias}`,
      createdAt: newUrl.createdAt,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getShortenUrlAlias = async (req, res, next) => {
  try {
    console.log("COUNT");
    const { alias } = req.params;
    const urlDetails = await Url.findOne({ alias });
    if (!urlDetails) {
      return res.json(404).json({
        message: "Url not found",
      });
    }

    const userAgent = req.get("User-Agent").toLowerCase();
    const { osType, deviceType } = getDeviceAndOSType(userAgent);
    const { ip } = req;

    await Analytics.create({
      urlId: urlDetails._id,
      osType: osType || "unknown",
      deviceType: deviceType || "unknown",
      ipAddress: ip,
    });
    console.log(osType, deviceType);
    return res.redirect(301, urlDetails.orig_url);
  } catch (error) {
    console.log(error);
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
    const result = await Url.aggregate([
      // Step 1: Match the URL based on alias
      {
        $match: { alias: alias },
      },
      // Step 2: Lookup Analytics collection to join analytics data
      {
        $lookup: {
          from: "analytics",
          localField: "_id",
          foreignField: "urlId",
          as: "analyticsData",
        },
      },
      // Step 3: Unwind the analyticsData array (if there’s more than one entry per URL)
      {
        $unwind: {
          path: "$analyticsData",
          preserveNullAndEmptyArrays: true, // In case there is no analytics data
        },
      },
      // Step 4: Group and calculate totalClicks and uniqueClicks
      {
        $group: {
          _id: "$alias", // Group by alias (URL)
          totalClicks: { $sum: 1 }, // Count all clicks
          uniqueClicks: {
            $addToSet: "$analyticsData.ipAddress", // Collect unique IPs to calculate unique clicks
          },
          osType: {
            $push: "$analyticsData.osType", // Collect all OS types for further analysis
          },
          deviceType: {
            $push: "$analyticsData.deviceType", // Collect all device types for further analysis
          },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$analyticsData.createdAt",
                },
              },
              clickCount: 1,
            },
          },
        },
      },
      // Step 5: Project final result to calculate unique clicks from distinct IPs
      {
        $project: {
          alias: 1,
          totalClicks: 1,
          uniqueClicks: { $size: { $setUnion: ["$uniqueClicks", []] } }, // Get unique IPs
          clicksByDate: {
            $map: {
              input: "$clicksByDate",
              as: "dateClick",
              in: {
                date: "$$dateClick.date",
                clickCount: {
                  $sum: "$$dateClick.clickCount", // Sum the click counts per date
                },
              },
            },
          },
          osType: {
            $map: {
              input: { $setUnion: ["$osType", []] }, // Get unique OS types
              as: "os",
              in: {
                osName: "$$os",
                uniqueClicks: {
                  $size: {
                    $filter: {
                      input: "$osType",
                      as: "osType",
                      cond: { $eq: ["$$osType", "$$os"] },
                    },
                  },
                },
                uniqueUsers: 1,
              },
            },
          },
          deviceType: {
            $map: {
              input: { $setUnion: ["$deviceType", []] }, // Get unique device types
              as: "device",
              in: {
                deviceName: "$$device",
                uniqueClicks: {
                  $size: {
                    $filter: {
                      input: "$deviceType",
                      as: "deviceType",
                      cond: { $eq: ["$$deviceType", "$$device"] },
                    },
                  },
                },
                uniqueUsers: 1,
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getTopicAnalytics = async (req, res, next) => {
  try {
    const { topic } = req.params;
  } catch (error) {
    console.log(error);
  }
};

exports.getoverallAnalytics = async (req, res, next) => {
  try {
  } catch (error) {
    console.log(error);
  }
};
