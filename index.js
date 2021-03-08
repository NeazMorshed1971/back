require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
// const stripeRoutes = require("./routes/stripepayment");
const paymentbRoutes = require("./routes/paymentb");

const app = express();
//Port
const port = process.env.PORT || 8000;

//Database connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch(() => {
    console.log("DB not connected");
  });

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//Handling the Routes
app.use("/gamify", authRoutes);
app.use("/gamify", userRoutes);
app.use("/gamify", categoryRoutes);
app.use("/gamify", productRoutes);
app.use("/gamify", orderRoutes);
app.use("/gamify", paymentbRoutes);

//Strating the server
app.listen(port, () => {
  console.log(`App is running at ${port}`);
});
