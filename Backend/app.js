const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require( "cookie-parser");
const { connectToDb } = require('./db/dbConnect');

const userRoutes = require('./modules/User/routes/user.routes');
const errorHandler = require('./modules/utils/globalErrorHandler');
const productRoutes = require('./modules/Product/routes/product.route');
const couponRoutes = require('./modules/Coupon/routes/coupon.routes');
const wishlistRoutes = require('./modules/Wishlist/router/wishlist.routes');
const cartRoutes = require('./modules/cart/router/cart.routes');

dotenv.config();


const app = express();

connectToDb();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/user', userRoutes );
app.use('/product', productRoutes );
app.use('/coupon', couponRoutes );
app.use('/wishlist', wishlistRoutes );
app.use('/cart', cartRoutes );
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log("🚀 Server running...");
});


module.exports = app;