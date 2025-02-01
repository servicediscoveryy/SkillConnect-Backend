import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    status: { type: String, enum: ['active', 'inactive'], required: true },
    view: { type: Number, default: 0 },
    tags: { type: [String] }
  }, { timestamps: true });
  
  const Service = mongoose.model('Service', serviceSchema);
  export default Service;
  