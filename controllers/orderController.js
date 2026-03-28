const crypto = require('crypto');
const Order = require('../models/Order');

const createOrder = async (req, res) => {
  try {
    const { amount, artworkId, buyerId, shippingAddress } = req.body;

    const order = await Order.create({
      buyer: buyerId,
      artwork: artworkId,
      amount,
      razorpay_order_id: `mock_${Date.now()}`,
      razorpay_payment_id: `mock_pay_${Date.now()}`,
      status: 'paid',
      shippingAddress,
    });
    await require('../models/Artwork').findByIdAndUpdate(artworkId, { sold: true });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.params.userId })
      .populate('artwork', 'title images price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders };