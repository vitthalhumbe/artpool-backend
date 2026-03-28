const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork', required: true },
  amount: { type: Number, required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_payment_id: { type: String, default: '' },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  shippingAddress: {
    name: String,
    phone: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);