const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema(
  {
    orig_url: {
      type: String,
      required: true,
    },
    alias: {
      type: String,
    },
    topic: {
      type: String,
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
    collection: "urls",
  }
);
module.exports = mongoose.model("Url", UrlSchema);
