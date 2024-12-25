const mongoose =  require('mongoose');

const UrlSchema = new mongoose.Schema({
  orig_url: {
    type: String,
    required: true,
  },
  alias: {
    type: String,
    required: true,
  },
  topics: {
    type: String,
    required: true,
  }
},
  {
    timestamps: true,
    collection: "urls",
  }
);
module.exports= mongoose.model('Url', UrlSchema);