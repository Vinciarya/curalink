const mongoose = require('mongoose');

const SearchCacheSchema = new mongoose.Schema({
  cacheKey: { type: String, required: true, unique: true, index: true },
  query: String,
  disease: String,
  publications: Array,
  trials: Array,
  stats: Object,
  createdAt: { type: Date, default: Date.now, expires: 3600 }
});

module.exports = mongoose.model('SearchCache', SearchCacheSchema);
