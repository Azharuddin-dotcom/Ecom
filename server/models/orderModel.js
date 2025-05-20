const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  products: Array,
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'cancelled'] }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
