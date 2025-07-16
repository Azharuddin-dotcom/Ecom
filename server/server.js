require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');


const app = express();

app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL // this will be https://ecom-1-b7dd.onrender.com
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));


// Mount webhook BEFORE express.json()
app.use('/api/stripe', require('./routes/webhook.js'));

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing form data

// Routes
app.use('/user', require('./routes/useRouter.js'));
app.use('/api', require('./routes/categoryRouter.js'));
app.use('/api/upload', require('./routes/uploadRouter.js'));
app.use('/api', require('./routes/productRouter.js'));
app.use('/api/stripe', require('./routes/stripeRoutes.js'));
app.use('/api', require('./routes/history.js'));  



// app.use(express.static(path.join(__dirname, 'client', 'build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
// });
// const clientBuildPath = process.env.NODE_ENV === 'production' 
//   ? path.join(__dirname, '..', 'client', 'build')  // Adjust this path as needed
//   : path.join(__dirname, 'client', 'build');

// // Serve static files
// app.use(express.static(clientBuildPath));

// // Handle React routing, return all requests to React app
// app.get('*', (req, res) => {
//   res.sendFile(path.join(clientBuildPath, 'index.html'));
// });


// MongoDB connection
const URI = process.env.MONGODB_URL;
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB Connected");
}).catch((err) => {
  console.log(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING on port ${PORT}`);
});
