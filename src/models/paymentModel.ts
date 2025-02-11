import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  status: { type: String, enum: ['created', 'captured', 'failed'], default: 'created' }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
