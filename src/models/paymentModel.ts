import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
