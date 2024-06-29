/* eslint-disable no-undef */

const mongoose = require("mongoose");
const Models = require("./models.js");
//const uuid = require("uuid"); // Not used in the provided code, might be used elsewhere
//const path = require("path"); // Not used in the provided code, might be used elsewhere
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const { check, validationResult } = require("express-validator");

// Importing models from models.js
const Movies = Models.Movie;
const Users = Models.User;

const process = require("process");

// Connect to MongoDB using the connection URI from environment variables
//mongoose.connect(process.env.CONNECTION_URI);

const mongoURI = process.env.MONGO_URI;
console.log("mongoURI", mongoURI);
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const bodyParser = require("body-parser");
const express = require("express");

const app = express();

// Define allowed origins for CORS
const allowedOrigins = ["http://myflix-client-bucket.s3-website-us-east-1.amazonaws.com", "https://jeheald23myflix.netlify.app", "http://localhost:8080", "http://testsite.com", "http://localhost:4200", "http://localhost:1234", "https://jeheald23.github.io"];

// Set up CORS middleware
app.use(cors({
  origin: allowedOrigins
})
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Authentication middleware
require("./auth.js")(app);

const passport = require("passport");
require("./passport.js");

app.use(express.static("public"));

// Route to serve home page
app.get("/", (req, res) => {
  const path = require("path");
  const indexPath = path.join(__dirname, "index.html");
  res.sendFile(indexPath);
  console.log("Welcome to the home page");
});

// Set up server port
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});

/**
 * Register a user
 * @param {String} Username - The username of the user
 * @param {String} Password - The password of the user
 * @param {String} Email - The email of the user
 * @param {Date} Birthday - The birthday of the user
 */
app.post("/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check("Username", "Username contains non alphanumeric characters - not allowed.").isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send("Please check your username and password and try again.");
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  });

/**
 * Get all users
 */
app.get("/users", async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * Get a user by username
 * @param {String} Username - The username of the user
 */
app.get("/users/:Username", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

// Update a user's username by username
// @param {String} Username - The username of the user
app.put("/users/:Username", passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check("Username", "Username contains non alphanumeric characters - not allowed.").isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
      { new: true }) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error: " + err);
      })
  });

/**
 * Get a list of a user's favorite movies
 * @param {String} Username - The username of the user
 */
app.get("/users/:Username/movies", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user.FavoriteMovies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

/**
 * Add a movie to a user's list of favorites
 * @param {String} Username - The username of the user
 * @param {String} _id - The ID of the movie to be added to favorites
 */
app.post("/users/:Username/movies/:_id", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $push: { FavoriteMovies: req.params._id }
    },
      { new: true })
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

/**
 * Delete a movie from a user's list of favorites
 * @param {String} Username - The username of the user
 * @param {String} _id - The ID of the movie to be deleted from favorites
 */
app.delete("/users/:Username/movies/:_id", passport.authenticate("jwt", { session: false }),
  async (req, res) => {

    await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $pull: { FavoriteMovies: req.params._id }
    },
      { new: true })
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

/**
 * Delete a user by username
 * @param {String} Username - The username of the user to be deleted
 */
app.delete("/users/:Username", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Permission check
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    await Users.findOneAndDelete({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

/**
 * Get a list of all movies
 */
app.get("/movies", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

/**
 * Get data about a single movie by title
 * @param {String} title - The title of the movie
 */
app.get("/movies/:title", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.findOne({ title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

/**
 * Get list of movies by genre
 * @param {String} genreName - The name of the genre
 */
app.get("/movies/genres/:genreName", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find({ "genre.name": req.params.genreName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });

/**
 * Get a list of movies by director name
 * @param {String} directorName - The name of the director
 */
app.get("/movies/directors/:directorName", passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find({ "director.name": req.params.directorName })
      .then((movies) => {
        res.json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  });
