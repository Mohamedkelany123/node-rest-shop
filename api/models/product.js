const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    //object id is a special type
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number
});

module.exports = mongoose.model('Product', productSchema);