const mongoose = require("mongoose"); 
Models = require("./models.js");
uuid = require("uuid");
path = require ("path");
cors = require("cors");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;

const process = require("process");

//mongoose.connect('mongodb://localhost:27017/cfDB');
mongoose.connect(process.env.CONNECTION_URI);


const bodyParser = require("body-parser");
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());

let auth = require("./auth.js")(app);

const passport = require("passport");
require("./passport.js");

app.use(express.static("public"));

app.get('/', (req, res) => {
  const path = require('path');
  const indexPath = path.join(__dirname, 'index.html');
  res.sendFile(indexPath);
  console.log('Welcome to the home page');
});

const corsOptions = {
  origin: "*", // Adjust this based on your specific needs
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0",() => {
 console.log("Listening on Port " + port);
});

//register a user
app.post("/users", 
[
  check("Username", "Username is required").isLength({min: 5}),
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
        return res.status(400).send(req.body.Username + " already exists");
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
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

//get all users
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

// Get a user by username
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

//update a user's username by username
app.put("/users/:Username", passport.authenticate("jwt", { session: false }), 
[
  check("Username", "Username is required").isLength({min: 5}),
  check("Username", "Username contains non alphanumeric characters - not allowed.").isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check("Email", "Email does not appear to be valid").isEmail()
],
async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  if(req.user.Username !== req.params.Username){
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

//get a list of a user's favorite movies
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

//add a movie to a user's list of favorites
app.put("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false }),
async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
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

//delete a movie from a user's list of favorites  
app.delete("/users/:Username/movies/:MovieID", passport.authenticate("jwt", { session: false }),
async (req, res) => {
  
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
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

//delete a user by username
app.delete("/users/:Username", passport.authenticate("jwt", { session: false }),
async (req, res) => {
  // CONDITION TO CHECK ADDED HERE
  if(req.user.Username !== req.params.Username){
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

//get a list of all movies
app.get("/movies", async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//get data about a single movie by title
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

//get list of movies by genre
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

//get a list of movies by director name
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
