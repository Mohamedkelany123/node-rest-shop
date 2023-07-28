const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    //object id is a special type
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true},
    price: { type: Number, required: true},
    productImage: { type: String, required: true}
});

module.exports = mongoose.model('Product', productSchema);