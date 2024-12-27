const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
      required: true,
    },
    osType: {
      type: String,
    },
    deviceType: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    geoLocation: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analytics", analyticsSchema);
