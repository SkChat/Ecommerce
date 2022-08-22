const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoute");
const userRouter = require("./routes/userRoute");
const reviewRouter = require("./routes/reviewRoute");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();
//GLOBAL MIDDLEWARES

//Serving static files
app.use(express.static(`${__dirname}/public`));

app.set("view engine", "pug");
app.set("views", `${__dirname}/views`);

//Set Security HTTP Headers
app.use(helmet());

//Limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP.Please try again in an hour",
});

app.use("/api", limiter);
//Body parser,reading data from body into req.body
app.use(express.json());
// app.use(express.json({limit:10kb}));  limits the amount of data in body of request
app.use(cookieParser());

//Data Sanitization against NOSQL query injection
app.use(mongoSanitize());

//Data Sanitization against xss
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["duration", "ratingsQuantity", "ratingsAverage"],
  })
);

//Test middleware
app.use((req, res, next) => {
  // res.setHeader(
  //   "Content-Security-Policy",
  //   "script-src 'self' http://127.0.0.1:3000/api/v1/users/login"
  // );
  console.log("hi i am from middleware");
  next();
});

// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);
// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

//ROUTES
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter); //mounting a router on a route
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

//START THE SERVER
module.exports = app;
