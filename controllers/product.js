const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { sortBy } = require("lodash");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id).populate("category")
  .exec((err, product) => {
    if(err){
      return res.status(400).json({
        error: "Product not found"
      })
    }
    req.product = product;
    next();
  })
}

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if(err){
      return res.status(400).json({
        error: "Problem with image"
      })
    }
    //destructure the fields
    const {name, description, price, category, stock} = fields;
    if(
      !name ||
      !description ||
      !price ||
      !category ||
      !stock
    ){
      return res.status(400).json({
        error: "Please include all fields"
      })
    }
    
    let product = new Product(fields);
    //HANDLE file
    if(file.photo){
      if(file.photo.size > 3000000){
        return res.status(400).json({
          error: "File size is too big"
        })
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    //save to the database
    product.save((err, product) => {
      if(err){
      return res.status(400).json({
        error: "Not able to save the product in database"
      })
    }
    res.json(product);
    })
  })
}

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
}

//middleware
exports.photo = (req, res, next) => {
  if(req.product.photo.data){
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
} 

exports.removeProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) =>{
    if(err){
      return res.status(400).json({
        error: "Failed to delete the product"
      })
    }
    res.json({
      message: "Deletion was successfull",
      deletedProduct
    })
  })
}

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if(err){
      return res.status(400).json({
        error: "Problem with image"
      })
    }
    //updation code
    let product = req.product;
    product = _.extend(product, fields);
    //HANDLE file
    if(file.photo){
      if(file.photo.size > 3000000){
        return res.status(400).json({
          error: "File size is too big"
        })
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    //save to the database
    product.save((err, product) => {
      if(err){
      return res.status(400).json({
        error: "Updation failed"
      })
    }
    res.json(product);
    })
  })
}

exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find().select("-photo").populate("category").sort([[sortBy, "asc"]]).limit(limit).exec((err, products) => {
    if(err){
      return res.status(400).json({
        error: "No product found"
      })
    }
    res.json(products);
  })
}

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, categories) => {
    if(err){
      return res.status(400).json({
        error: "No category found"
      })
    }
    res.json(categories);
  })
}

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map(product => {
    return {
      updateOne: {
        filter: {_id: product._id},
        update: {$inc: {stock: -product.count, sold: +product.count}}
      }
    }
  })
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if(err){
      return res.status(400).json({
        error: "Bulk operation failed"
      })
    }
    next();
  })
}
