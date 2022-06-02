const mongoose = require('mongoose');
const { schema: ProductSchema } = require('./products');
const schema = new mongoose.Schema({
    purchasedProducts: [ProductSchema],
    totalPrice: {
        type: Number,
        required: true
    }
});

const UnshardedOrders = mongoose.model('unshardedOrders', schema);

module.exports = { model: UnshardedOrders, UnshardedOrders, schema };
