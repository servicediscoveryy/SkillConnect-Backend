import mongoose from 'mongoose';

const userRecommendedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }]
}, { timestamps: true });

const userRecommonded = mongoose.model('UserService', userRecommendedSchema);

export default userRecommonded;
