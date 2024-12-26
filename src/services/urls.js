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
            },
          },
        },
      },
      // Step 5: Project final result to calculate unique clicks from distinct IPs
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          uniqueClicks: { $size: { $setUnion: ["$uniqueClicks", []] } }, // Get unique IPs
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

    return result[0];
  } catch (error) {
    console.log(error);
  }
};

exports.getOverallAnalytics = async () => {
  try {
    const result = await Analytics.aggregate([
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
            },
          },
        },
      },
      // Step 5: Project final result to calculate unique clicks from distinct IPs
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          uniqueClicks: { $size: { $setUnion: ["$uniqueClicks", []] } }, // Get unique IPs
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

    return result[0];
  } catch (error) {
    console.log(error);
  }
};

exports.getTopicAnalytics = async () => {
  try {
    const result = await Url.aggregate([
      // Step 1: Lookup Analytics collection to join analytics data
      {
        $lookup: {
          from: "analytics",
          localField: "_id",
          foreignField: "urlId",
          as: "analyticsData",
        },
      },
      // Step 2: Unwind the analyticsData array (if there’s more than one entry per URL)
      {
        $unwind: {
          path: "$analyticsData",
          preserveNullAndEmptyArrays: true, // In case there is no analytics data
        },
      },
      // Step 3: Group and calculate totalClicks, uniqueClicks, and other data
      {
        $group: {
          _id: "$alias", // Group by alias (URL)
          totalUrls: { $sum: 1 }, // Count of total URLs created
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
                  format: "%Y-%m-%d", // Format date as yyyy-mm-dd
                  date: "$analyticsData.createdAt",
                },
              },
              clickCount: 1, // Increment click count by 1 for each record
            },
          },
        },
      },
      // Step 4: Project final result with unique clicks, clicks by date, osType, deviceType
      {
        $project: {
          _id: 0,
          alias: 1,
          totalUrls: 1,
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
                uniqueUsers: 1, // You can calculate unique users per OS if needed
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
                uniqueUsers: 1, // You can calculate unique users per device if needed
              },
            },
          },
        },
      },
    ]);
    return result;
  } catch (error) {
    console.log(error);
  }
};
