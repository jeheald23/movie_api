const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/cfDB');

const bodyParser = require('body-parser');
const express = require('express');
const uuid = require('uuid');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(bodyParser.json());

const port = 8080;

//register a user
app.post('/users', async (req, res) => {
  await Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//get all users
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:username', async (req, res) => {
  await Users.findOne({ username: req.params.username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//update a user's username by username
app.put('/users/:username', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  })

});

//get a list of a user's favorite movies
app.get('/users/:username/movies', async (req, res) => {
  await Users.findOne({ username: req.params.username })
    .then((user) => {
      res.json(user.FavoriteMovies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//add a movie to a user's list of favorites
app.put('/users/:username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, {
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
app.delete('/users/:username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ username: req.params.username }, {
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
app.delete('/users/:username', async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get a list of all movies
app.get('/movies', async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get data about a single movie by title
app.get('/movies/:title', async (req, res) => {
  await Movies.findOne({ title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//get a list of all genres
//app.get('/movies/genres', (req, res) => {
//  res.json(movies.map((movie) => { return movie.genre }));
//  });

//get a list of movies by genre
//app.get('/movies/genres/:genre', (req, res) => {
//  res.json(movies.filter((movie) =>
//  { return movie.genre === req.params.genre }));
//  });

//get genre by movie title
//app.get('/movies/:title/genre', (req, res) => {
//  res.json(movies.find((movie) =>
//  { return movie.title === req.params.title }).genre);
//  });

//get data about a movie by director
//app.get('/movies/directors/:name', (req, res) => {
  //res.json(movies.find((movie) =>
  //{ return movie.director === req.params.name }));
 // });

//get a list of all directors
//app.get('/directors', async (req, res) => { 
//  await Movies.find()
//    .then((movie) => {
//      res.status(201).json(movie.director);
//    })
//    .catch((err) => {
//      console.error(err);
//      res.status(500).send('Error: ' + err);
//    });
//});

//get data about a director by name
//app.get('/directors/:name', async (req, res) => {
//  await Movies.findOne({ director: req.params.director })
//    .then((movies) => {
//      res.json(movies.director);
//    })
//    .catch((err) => {
//      console.error(err);
//      res.status(500).send('Error: ' + err);
//    });
//});

app.listen(port, () => {
console.log(`Your app is listening on port ${port}.`);
});