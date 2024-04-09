const express = require('express');
const app = express();
const User = require('../model/userSchema');
const Order = require('../model/orderMdl');

exports.getOrderManag = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email phoneNumber') // Populate user details
            .populate('items.product', 'productName price description productImage rating stockCount isVisible')
        console.log('order',orders)
        res.render('orderManag', { orders });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};


exports.postOrderManag=async (req, res) => {
    try {
      const { orderId, itemId } = req.params;
      const { newStatus} = req.body;
  
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      const itemToUpdate = order.items.find((item) => item._id.toString() === itemId);
      if (!itemToUpdate) {
        return res.status(404).json({ error: 'Item not found in the order' });
      }
  
      itemToUpdate.status = newStatus;
      await order.save();
  
      res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };