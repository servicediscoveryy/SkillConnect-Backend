import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  description: { type: String }
}, { timestamps: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
