const Products = require("../models/productModel.js");

//Filter,sorting and pagination -

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filtering() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit"];
    excludedFields.forEach((el) => delete queryObj[el]);

    const mongoQuery = {};

    for (let key in queryObj) {
      if (key.includes("[")) {
        const [field, operatorRaw] = key.split("[");
        const operator = operatorRaw.replace("]", "");

        if (!mongoQuery[field]) mongoQuery[field] = {};

        if (operator === "regex") {
          // Case-insensitive regex
          mongoQuery[field]["$regex"] = queryObj[key];
          mongoQuery[field]["$options"] = "i";
        } else {
          mongoQuery[field]["$" + operator] = isNaN(queryObj[key])
            ? queryObj[key]
            : Number(queryObj[key]);
        }
      } else if (key === "category") {
        mongoQuery[key] = queryObj[key]; // Category as string
      } else {
        mongoQuery[key] = queryObj[key];
      }
    }

  

    this.query = this.query.find(mongoQuery);
    this.mongoQuery = mongoQuery;
    return this;
  }

  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);

     
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;

    const limit = this.queryString.limit * 1 || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

const productCtrl = {
  getProducts: async (req, res) => {
    try {
      // console.log(req.query);
      const features = new APIfeatures(Products.find(), req.query)
        .filtering()
        .sorting()
        
      const totalCount = await features.query.clone().countDocuments();

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 9;
      const totalPages = Math.ceil(totalCount / limit);

      const products = await features.pagination().query;

      res.json({
        products,
        totalPages,
        totalCount,
        currentPage: page,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createProducts: async (req, res) => {
    try {
      const {
        product_id,
        title,
        price,
        description,
        content,
        images,
        category,
      } = req.body;

      if (!images) {
        return res.status(400).json({ msg: "No Image Uploaded" });
      }

      const product = await Products.findOne({ product_id });

      if (product) {
        return res.status(400).json({ msg: "This product already exists" });
      }

      const newProduct = new Products({
        product_id,
        title: title.toLowerCase(),
        price,
        description,
        content,
        images,
        category,
      });

      await newProduct.save();

      res.json({ msg: "Product created successfully", product: newProduct });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const product = await Products.findByIdAndDelete(req.params.id);

      res.json(product);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const { title, price, description, content, images, category } = req.body;

      if (!images) {
        return res.status(400).json({ msg: "No Image Uploaded" });
      }

      const updatedProduct = await Products.findOneAndUpdate(
        { _id: req.params.id },
        {
          title: title.toLowerCase(),
          price,
          description,
          content,
          images,
          category,
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ msg: "Product not found." });
      }

      res.json({
        msg: "Product updated successfully!",
        product: updatedProduct,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getProduct: async (req, res) => {
    try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
  }
};

module.exports = productCtrl;
