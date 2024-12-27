const Url = require("./../models/urls");
const Analytics = require("./../models/analytics");

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

exports.getUrlAliasAnalytics = async (alias) => {
  try {
    const result = await Url.aggregate([
      {
        $match: alias,
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
        $addFields: {
          totalClicks: { $size: { $ifNull: ["$analyticsData", []] } }, // Project only the analyticsData field
        },
      },
      {
        $unwind: {
          path: "$analyticsData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$alias",
          totalClicks: { $first: "$totalClicks" },
          uniqueUsers: {
            $addToSet: "$analyticsData.ipAddress",
          },
          osType: {
            $push: "$analyticsData.osType",
          },
          deviceType: {
            $push: "$analyticsData.deviceType",
          },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$analyticsData.createdAt",
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

exports.getOverallAnalytics = async () => {
  try {
    const result = await Analytics.aggregate([
      {
        $group: {
          _id: "$alias", // Group by alias (URL)
          totalClicks: { $sum: 1 }, // Count all clicks
          uniqueUsers: {
            $addToSet: "$ipAddress", // Collect unique IPs to calculate unique clicks
          },
          osType: {
            $push: "$osType", // Collect all OS types for further analysis
          },
          deviceType: {
            $push: "$deviceType", // Collect all device types for further analysis
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
      // Step 5: Project final result to calculate unique clicks from distinct IPs
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

    const totalUrls = await Url.countDocuments();
    result[0].totalUrls = totalUrls;
    return result[0];
  } catch (error) {
    console.log(error);
  }
};

exports.getTopicAnalytics = async (topic) => {
  try {
    const result = await Url.aggregate([
      {
        $match: topic, // Match the specified topic
      },
      {
        $lookup: {
          from: "analytics", // Join with the analytics collection
          localField: "_id", // Match by URL ID
          foreignField: "urlId", // Match by URL ID in the analytics collection
          as: "analyticsData", // Store matched analytics records in 'analyticsData'
        },
      },
      {
        $unwind: {
          path: "$analyticsData", // Flatten the analyticsData array
          preserveNullAndEmptyArrays: true, // If no analytics data, keep the URL document
        },
      },
      {
        $group: {
          _id: "$topic", // Group by alias (URL)
          totalClicks: {
            $sum: {
              $cond: {
                if: { $gt: [{ $ifNull: ["$analyticsData", null] }, null] }, // Check if there's data in analyticsData
                then: 1, // If there is data, count 1
                else: 0, // If there is no data, count 0
              },
            },
          }, // Keep the first totalClicks (total clicks for URL)
          uniqueClicks: {
            $addToSet: "$analyticsData.ipAddress", // Collect unique IPs to calculate unique clicks
          },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d", // Format date as yyyy-mm-dd
                  date: "$analyticsData.createdAt", // Use createdAt as the date for clicks
                },
              },
              clickCount: 1, // Each entry represents a click
            },
          },
          shortUrls: {
            $addToSet: {
              shortUrl: "$alias",
              totalClicks: {
                $sum: {
                  $cond: {
                    if: { $gt: [{ $ifNull: ["$analyticsData", null] }, null] }, // Check if there's data in analyticsData
                    then: 1, // If there is data, count 1
                    else: 0, // If there is no data, count 0
                  },
                },
              },
              uniqueUsers: "$analyticsData.ipAddress",
            }, // Collect URLs and their total clicks
          },
        },
      },
      {
        $project: {
          _id: 0, // Remove the _id field
          alias: "$_id", // Rename _id to alias
          totalClicks: { $sum: "$totalClicks" }, // Sum total clicks across all URLs
          uniqueUsers: { $size: { $setUnion: ["$uniqueClicks", []] } }, // Calculate the number of unique users
          clicksByDate: {
            $map: {
              input: { $setUnion: ["$clicksByDate", []] }, // Get unique date-click pairs
              as: "dateClick",
              in: {
                date: "$$dateClick.date",
                clickCount: {
                  $sum: "$$dateClick.clickCount", // Sum the click counts per date
                },
              },
            },
          },
          urls: "$shortUrls",
        },
      },
    ]);
    console.log(result);
    return result[0];
  } catch (error) {
    console.log(error);
  }
};
