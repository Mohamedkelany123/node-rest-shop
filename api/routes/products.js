const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    // Get the current date and time as a string in the format "YYYY-MM-DDTHH-mm-ss"
    const currentDateTime = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    // Append the current date and time and the original filename
    const uniqueFilename = currentDateTime + '_' + file.originalname;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || 'image/png'){
    cb(null, true);
  } else{ 
    cb(null, false);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  storage: storage, 
  limits: {
  fileSize: 1024 * 1024 * 5
} });


const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs =>{
        const response = {
          count: docs.length,
          products: docs.map(doc =>{
            return {
              name: doc.name,
              price: doc.price,
              productImage: doc.productImage,
              _id: doc._id,
              url: {
                type: "GET",
                url: 'http://localhost:3000/products/' + doc._id
              }
            }
          })
        };
        // if(docs.length >= 0){
        res.status(200).json(response);
        // } else {
        //     res.status(404).json({
        //         message: 'No entries found'
        //     });
        // }
         
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', upload.single('productImage') ,(req, res, next) => {
  console.log(req.file);  
  const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
    .save()
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message: 'CREATED PRODUCT SUCCESSFULLY',
            createdProduct: {
              name: result.name,
              price: result.price,
              _id: result._id,
              request: {
                type: 'POST',
                url: 'http://localhost:3000/products/' + result._id
              }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
      .select('name price _id productImage')
      .exec()
      .then(doc => {
        if (doc) {
          // A matching document was found for the provided ID
          res.status(200).json({
            product: doc,
            request:{
              type: "GET",
              url: 'http://localhost:3000/products' 
            }
          });
          
        } else {
          // No matching document found for the provided ID
          res.status(404).json({ message: 'No valid entry found for provided ID' });
        }
      })
      .catch(err => {
        // An error occurred during the database operation
        console.log(err);
        res.status(500).json({ error: err });
      });
  });
  

  router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: id }, { $set: updateOps })
      .exec()
      .then(result => {
        console.log(result);
        res.status(200).json({
          message: 'PRODUCT UPDATED',
          request:{
            type: "GET",
            url: 'http://localhost:3000/products' + id
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  });
  

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id })
      .exec()
      .then(result => {
        // The 'result' object will contain the delete operation details
        res.status(200).json({
          message: 'PRODUCT DELETED',
          request:{
            type: "POST",
            url: 'http://localhost:3000/products',
            body: { name: 'String', price: 'Number'}
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });
  

module.exports = router;