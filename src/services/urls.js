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
    console.log(alias);
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
      const result = await Analytics.aggregate([
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
          $addFields: {
            totalClicks: { $size: { $ifNull: ["$analyticsData", []] } }, // Calculate total clicks per URL
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
            _id: "$alias", // Group by alias (URL)
            totalClicks: { $first: "$totalClicks" }, // Keep the first totalClicks (total clicks for URL)
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
              $push: { shortUrl: "$alias", totalClicks: "$totalClicks" } // Collect URLs and their total clicks
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
            urls: "$shortUrls", // Include the short URLs array
          },
        },
        {
          $group: {
            _id: null, // We now group everything together to get a single response
            totalClicks: { $sum: "$totalClicks" },
            uniqueUsers: { $sum: "$uniqueUsers" },
            clicksByDate: { $push: { date: "$clicksByDate.date", clickCount: "$clicksByDate.clickCount" } },
            urls: { $push: { shortUrl: "$urls.shortUrl", totalClicks: "$urls.totalClicks", uniqueUsers: "$uniqueUsers" } }
          },
        },
        {
          $project: {
            _id: 0,
            totalClicks: 1,
            uniqueUsers: 1,
            clicksByDate: {
              $map: {
                input: { $setUnion: ["$clicksByDate", []] }, // Ensure we are not duplicating dates
                as: "dateClick",
                in: {
                  date: "$$dateClick.date",
                  clickCount: {
                    $sum: "$$dateClick.clickCount", // Sum the click counts per date
                  },
                },
              },
            },
            urls: 1, // Project the final URLs array
          },
        },
      ]);
      return result;
    } catch (error) {
      console.log(error);
    }
  };
  