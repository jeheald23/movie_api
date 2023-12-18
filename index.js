const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB');

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
  await Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
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
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//update a user's username by username
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
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
//app.get('/users/:username/favorites', (req, res) => {
//  res.json(users.find((user) =>
//  { return user.username === req.params.username }).favorites);
//}); 

//add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
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
//app.delete('/users/:username/favorites/:movie', (req, res) => {
//  let user = users.find((user) => { return user.username === req.params.username });
//  if (user) {
//    user.favorites = user.favorites.filter((value) => { return value !== req.params.movie });
//    res.status(200).send(user);
//  } else {
//    res.status(404).send('User not found.');
//  }
//});

//delete a user by username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
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
  await Users.findOne({ Title: req.params.title })
    .then((title) => {
      res.json(title);
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
  //app.get('/directors', (req, res) => {
   // res.json(directors);
 //   });  

//get data about a director by name
//app.get('/directors/:name', (req, res) => {
//  res.json(directors.find((director) =>
//  { return director.name === req.params.name }));
//  });

  
app.listen(port, () => {
console.log(`Your app is listening on port ${port}.`);
});