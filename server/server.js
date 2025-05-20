require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || process.env.PROD_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
}));


// Mount webhook BEFORE express.json()
app.use('/api/stripe', require('./routes/webhook'));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing form data



//Routes
app.use('/user', require('./routes/useRouter.js'));
app.use('/api', require('./routes/categoryRouter.js'));
app.use('/api/upload', require('./routes/uploadRouter.js'));
app.use('/api', require('./routes/productRouter.js'));

app.use('/api/stripe', require('./routes/stripeRoutes.js'));
app.use('/api', require('./routes/history.js'));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.json({msg: "example"})
})

app.listen(PORT, () => {
    console.log("SERVER IS RUNNING");
});


// MongoDB connection
const URI = process.env.MONGODB_URL;

mongoose.connect(URI, {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
    console.log("MongoDB Connected")
}).catch((err) => {
    console.log(err);
});