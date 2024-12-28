const Url = require("./../models/urls");
const Analytics = require("./../models/analytics");
const urls = require("./../models/urls");
const mongoose = require("mongoose");

exports.findOneUrl = async (input) => {
  try {
    return await Url.findOne(input);
  } catch (error) {
    console.log(error);
  }
};

exports.createUrl = async (input) => {
  try {
    return await Url.create(input);
  } catch (error) {
    console.log(error);
  }
};

exports.createAnalytics = async (input) => {
  try {
    return await Analytics.create(input);
  } catch (error) {
    console.log(error);
  }
};

exports.getUrlAliasAnalytics = async (alias,createdLastSevenDay) => {
  try {
    const urlId = await Url.findOne({ alias: alias }).select("_id").lean();
    const result = await Analytics.aggregate([
      {
        $match: {
          urlId: urlId?._id,
          createdAt:createdLastSevenDay
        },
      },
      {
        $group: {
          _id: "$alias",
          totalClicks: { $sum: 1 },
          uniqueUsers: {
            $addToSet: "$ipAddress",
          },
          osType: {
            $push: "$osType",
          },
          deviceType: {
            $push: "$deviceType",
          },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          uniqueUsers: { $size: { $setUnion: ["$uniqueUsers", []] } }, // Get unique IPs
          clicksByDate: {
            $map: {
              input: { $setUnion: ["$clicksByDate", []] }, // Get unique dates
              as: "dateClick",
              in: {
                clickCount: {
                  $size: {
                    $filter: {
                      input: "$clicksByDate",
                      as: "click",
                      cond: { $eq: ["$$click", "$$dateClick"] }, // Filter clicks by the date
                    },
                  },
                },
                date: "$$dateClick.date", // Use the date directly, no nesting
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

    if (!result[0]) {
      return {
        totalClicks: 0,
        uniqueClicks: 0,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
    }
    return result[0];
  } catch (error) {
    console.log(error);
  }
};

exports.getOverallAnalytics = async (userId) => {
  try {
    const allUrls = await Url.find({ createdBy: userId }).select("_id").lean();
    const urlIds = allUrls.map((url) => url._id);

    const result = await Analytics.aggregate([
      {
        $match: {
          urlId: { $in: urlIds },
        },
      },
      {
        $group: {
          _id: "$alias",
          totalClicks: { $sum: 1 }, // Count all clicks
          uniqueUsers: {
            $addToSet: "$ipAddress", // Collect unique IPs to calculate unique clicks
          },
          osType: {
            $push: { osType: "$osType", ipAddress: "$ipAddress" },
          },
          deviceType: {
            $push: { deviceType: "$deviceType", ipAddress: "$ipAddress" },
          },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          osType: 1,
          deviceType: 1,
          clicksByDate: {
            $map: {
              input: { $setUnion: ["$clicksByDate", []] }, // Get unique dates
              as: "dateClick",
              in: {
                clickCount: {
                  $size: {
                    $filter: {
                      input: "$clicksByDate",
                      as: "click",
                      cond: { $eq: ["$$click", "$$dateClick"] }, // Filter clicks by the date
                    },
                  },
                },
                date: "$$dateClick.date", // Use the date directly, no nesting
              },
            },
          },
        },
      },
    ]);

    if (!result[0]) {
      return {
        totalClicks: 0,
        uniqueUsers: 0,
        clicksByDate: [],
        osType: [],
        deviceType: [],
        totalUrls: 0,
      };
    }

    const osDetails = getFormatedOsTypeDetails(result[0].osType)

    const deviceDetails =getDeviceTypeDetails(result[0].deviceType);
    
    result[0].totalUrls = urlIds?.length;
    result[0].osType = osDetails;
    result[0].deviceType=deviceDetails;
    return result[0];
  } catch (error) {
    console.log(error);
  }
};

function getFormatedOsTypeDetails(osTypeArray){
  const map = new Map();
  for (const { osType, ipAddress } of osTypeArray) {
    if (!map[osType]) {
      map[osType] = {
        osTypeName: osType,
        osTypeNameCount: 0,
        ipCount: new Set(),
      };
    }

    map[osType].osTypeNameCount++;
    map[osType].ipCount.add(ipAddress);
  }
  const res = [];

  for (const key in map) {
    res.push({
      osName: map[key].osTypeName,
      uniqueClicks: map[key].osTypeNameCount,
      uniqueUsers: map[key].ipCount.size,
    });
  }
  return res;
}

function getDeviceTypeDetails(deviceTypeArray){
  const res = [];
  const map = {};

  for (const { deviceType, ipAddress } of deviceTypeArray) {
    if (!map[deviceType]) {
      map[deviceType] = {
        deviceTypeName: deviceType,
        deviceTypeNameCount: 0,
        ipCount: new Set(),
      };
    }

    map[deviceType].deviceTypeNameCount++;
    map[deviceType].ipCount.add(ipAddress);
  }
  
  for (const key in map) {
    res.push({
      deviceName: map[key].deviceTypeName,
      uniqueClicks: map[key].deviceTypeNameCount,
      uniqueUsers: map[key].ipCount.size,
    });
  }
  return res;
}

exports.getTopicAnalytics = async (topic) => {
  try {
    const result = await Url.aggregate([
      {
        $match: topic,
      },
      {
        $lookup: {
          from: "analytics",
          localField: "_id",
          foreignField: "urlId",
          as: "analyticsData",
        },
      },
      {
        $unwind: {
          path: "$analyticsData"
        },
      },
      {
        $group: {
          _id: "$topic",
          totalClicks: {
            $sum: {
              $cond: {
                if: { $gt: [{ $ifNull: ["$analyticsData", null] }, null] },
                then: 1,
                else: 0, 
              },
            },
          },
          uniqueClicks: {
            $addToSet: "$analyticsData.ipAddress",
          },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d", 
                  date: "$analyticsData.createdAt", 
                },
              }
            },
          },
          shortUrls: {
            $push: {
              shortUrl: "$alias",
              totalClicks: {
                $sum: {
                  $cond: {
                    if: { $gt: [{ $ifNull: ["$analyticsData", null] }, null] }, 
                    then: 1, 
                    else: 0, 
                  },
                },
              },
              uniqueUsers: "$analyticsData.ipAddress",
            }, 
          },
        },
      },
      {
        $project: {
          _id: 0, 
          totalClicks: { $sum: "$totalClicks" }, 
          uniqueUsers: { $size: { $setUnion: ["$uniqueClicks", []] } }, 
          clicksByDate: {
            $map: {
              input: { $setUnion: ["$clicksByDate", []] }, 
              as: "dateClick",
              in: {
                clickCount: {
                  $size: {
                    $filter: {
                      input: "$clicksByDate",
                      as: "click",
                      cond: { $eq: ["$$click", "$$dateClick"] }, 
                    },
                  },
                },
                date: "$$dateClick.date", 
              },
            },
          },
          urls: "$shortUrls",
        },
      },
    ]);

    if (!result[0]) {
      return {
        totalClicks: 0,
        uniqueUsers: 0,
        clicksByDate: [],
        urls: [],
      };
    }

    const formattedUrlAnalytics = getFormattedUrlDetails(result[0].urls);
    result[0].urls = formattedUrlAnalytics;
    return result[0];
  } catch (error) {
    console.log(error);
  }
};

function getFormattedUrlDetails(urlArray) {
  const map = new Map();

  // Iterate through the array and accumulate data for each shortUrl
  for (const { shortUrl, uniqueUsers, totalClicks } of urlArray) {
    if (!map.has(shortUrl)) {
      map.set(shortUrl, {
        shortUrl: shortUrl,
        totalClicks: 0,
        uniqueUsers: new Set(),
      });
    }

    // Accumulate the totalClicks and unique users
    map.get(shortUrl).totalClicks += totalClicks;
    map.get(shortUrl).uniqueUsers.add(uniqueUsers);
  }

  // Convert the map to an array with the desired structure
  const result = [];

  map.forEach((value) => {
    result.push({
      shortUrl: value.shortUrl,
      totalClicks: value.totalClicks,
      uniqueUsers: value.uniqueUsers.size, // Number of unique users (size of the set)
    });
  });

  return result;
}
