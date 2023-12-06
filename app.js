// this means that this is running in development
if (process.env.NODE_ENV !== "development") {
  require("dotenv").config();
}

require("dotenv").config();

// console.log(process.env.SECRET);

//dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utilities/ExpressError");
const methodOverride = require("method-override");
const router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

mongoose.set("strictQuery", false);

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1/yelp-camp";

// define what to require and what directory
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const MongoStore = require("connect-mongo");

// const dbUrl = process.env.DB_URL;
// line of code for mongoose or connection to the database
// 'mongodb://127.0.0.1:27017/yelp-camp'
main().catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (e) {
    console.log("Error found: ", e);
  }
}

// logic to check if there is an error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

// use the express app for http verbs
const app = express();

// Middlewares
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// secret
const secret = process.env.SECRET || "thisshouldbeabettersecret";

// connecting to Mongo atlas
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60, // this part will tell
});

store.on("error", function (e) {
  console, log("session store error", e);
});

// this is for configuring the session
const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    htttpOnly: true,
    // secure: true, // would not work in local host but works in https
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

// config for both the session and flash or pop ups
app.use(session(sessionConfig));
app.use(flash());
// helmet

// app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dyj3kyaxl/",
  "https://cdn.jsdelivr.net/npm/ionicons@7.1.2/dist/collection/components/icon/icon.min.css",
  "https://cdn.jsdelivr.net/npm/ionicons@7.1.2/dist/esm/ionicons.min.js",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://res.cloudinary.com/dyj3kyaxl/",
  "https://cdn.jsdelivr.net/npm/ionicons@7.1.2/dist/collection/components/icon/icon.min.css",
  "https://cdn.jsdelivr.net/npm/ionicons@7.1.2/dist/esm/ionicons.min.js",
];
const connectSrcUrls = [
  "https://*.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://events.mapbox.com",
  "https://res.cloudinary.com/dyj3kyaxl/",
  "https://cdn.jsdelivr.net/npm/ionicons@7.1.2/dist/collection/components/icon/icon.min.css",
  "https://cdn.jsdelivr.net/npm/ionicons@7.1.2/dist/esm/ionicons.min.js",
];
const fontSrcUrls = ["https://res.cloudinary.com/dyj3kyaxl/"];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
          "'self'",
          "blob:",
          "data:",
          "https://res.cloudinary.com/dyj3kyaxl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
          "https://images.unsplash.com/",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
        mediaSrc: ["https://res.cloudinary.com/dyj3kyaxl/"],
        childSrc: ["blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// config for passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); // it says "passport use the new local strat having an authentication method of athenticate in the User model"

passport.serializeUser(User.serializeUser()); // how to store user in a session
passport.deserializeUser(User.deserializeUser()); // how to remove user in a session

app.use((req, res, next) => {
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = await new User({ email: "zy@gmail.com", username: "zy" });
  const registerUser = await User.register(user, "chicken");
  res.send(registerUser);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// show the home page: index
app.get("/", (req, res) => {
  res.render("home");
});

//
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log(`Serving on port ${port}`);
});
