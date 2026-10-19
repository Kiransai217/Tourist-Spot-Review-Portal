const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

const spotSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  state: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, enum: ['Nature', 'Historical', 'Beach', 'Religious', 'Adventure', 'City & Culture', 'Other'], default: 'Other' },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  imageUrl: { type: String, default: '' },
  bestTime: { type: String, default: 'Check local weather before visiting' },
  entryFee: { type: String, default: 'Check locally' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now }
});

spotSchema.virtual('averageRating').get(function () {
  if (!this.reviews.length) return 0;
  return this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
});
spotSchema.set('toJSON', { virtuals: true });
spotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Spot', spotSchema);
