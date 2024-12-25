const mongoose =  require('mongoose');
const mongooseSequence = require('mongoose-sequence')(mongoose);

const UrlSchema = new mongoose.Schema({
  url_id: {
    type: Number,
    unique:true
  },
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
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  }
},
  {
    timestamps: true,
    collection: "urls",
  }
);
UrlSchema.plugin(mongooseSequence, { inc_field: 'url_id' });
module.exports= mongoose.model('Url', UrlSchema);