const bodyParser = require('body-parser');
const express = require('express');
const uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

const port = 8080;

let users = [
  {
    id: 1,
    name: 'Bob Smith',
    username: 'bobsmith',
    favorites: ['Blade Runner', 'A Clockwork Orange', 'Stalker']
  }
];

let movies = [
    {
      title: 'Blade Runner',
      director: 'Ridley Scott',
      genre: 'Science Fiction',
      description: 'some text here',
      image: 'some image here',
      featured: true
    },
    {
      title: 'A Clockwork Orange',
      director: 'Stanley Kubrick',
      genre: 'Science Fiction',
      description: 'some text here',
      image: 'some image here',
      featured: false
    },
    {
      title: 'Brazil',
      director: 'Terry Gilliam',
      genre: 'Science Fiction',
      description: 'some text here',
      image: 'some image here',
      featured: true
    },
    {
      title: '8 1/2',
      director: 'Federico Fellini',
      genre: 'Drama',
      description: 'some text here',
      image: 'some image here',
      featured: true
    },
    {
      title: 'Mulholland Drive',
      director: 'David Lynch',
      genre: 'Drama',
      description: 'some text here',
      image: 'some image here',
      featured: false
    }
  ];

  let directors = [
    {
      name: 'Michelangelo Antonioni',
      bio: "[A]n Italian director and filmmaker… best known for his 'trilogy on modernity and its discontents'—L'Avventura (1960), La Notte (1961), and L'Eclisse (1962)—as well as the English-language film Blowup (1966). His films have been described as 'enigmatic and intricate mood pieces' that feature elusive plots, striking visual composition, and a preoccupation with modern landscapes. His work substantially influenced subsequent art cinema. Antonioni received numerous awards and nominations throughout his career, being the only director to have won the Palme d'Or, the Golden Lion, the Golden Bear and the Golden Leopard. (from Wikipedia)",
      birth: '1912',
      death: '2007'
    },
    {
      name: 'Federico Fellini',
      bio:  'some text here',
      birth: '1920',
      death: '1993'
    }
  ];

//get a list of all users
app.get('/users', (req, res) => {
  res.json(users);
});

//register a user
app.post('/users', (req, res) => {
  let newUser = req.body;
  if (!newUser.name) {
    const message = 'Missing name in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});

//get a user by username
app.get('/users/:username', (req, res) => {
  res.json(users.find((user) =>
  { return user.username === req.params.username }));
});

//update a user's username by username
app.put('/users/:username', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });
  if (user) {
    user.username = req.body.username;
    res.status(200).send(user);
  } else {
    res.status(404).send('User not found.');
  }
});

//get a list of a user's favorite movies
app.get('/users/:username/favorites', (req, res) => {
  res.json(users.find((user) =>
  { return user.username === req.params.username }).favorites);
}); 

//add a movie to a user's list of favorites
app.post('/users/:username/favorites/:movie', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });
  if (user) {
    user.favorites.push(req.params.movie);
    res.status(200).send(user);
  } else {
    res.status(404).send('User not found.');
  }
}); 

//delete a movie from a user's list of favorites  
app.delete('/users/:username/favorites/:movie', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });
  if (user) {
    user.favorites = user.favorites.filter((value) => { return value !== req.params.movie });
    res.status(200).send(user);
  } else {
    res.status(404).send('User not found.');
  }
});

//delete a user by userID
app.delete('/users/:userID', (req, res) => {
  let user = users.find((user) => { return user.id === req.params.userID });
  if (user) {
    users = users.filter((value) => { return value !== user });
    res.status(200).send('User ' + req.params.userID + ' was deleted.');
  } else {
    res.status(404).send('User not found.');
  }
});  


//get a list of all movies
app.get('/movies', (req, res) => {
res.json(movies);
});

//get data about a single movie by title
app.get('/movies/:title', (req, res) => {
res.json(movies.find((movie) =>
{ return movie.title === req.params.title }));
});

//get a list of all genres
app.get('/movies/genres', (req, res) => {
  res.json(movies.map((movie) => { return movie.genre }));
  });

//get a list of movies by genre
app.get('/movies/genres/:genre', (req, res) => {
  res.json(movies.filter((movie) =>
  { return movie.genre === req.params.genre }));
  });

//get genre by movie title
app.get('/movies/:title/genre', (req, res) => {
  res.json(movies.find((movie) =>
  { return movie.title === req.params.title }).genre);
  });

//get data about a movie by director
app.get('/movies/directors/:name', (req, res) => {
  res.json(movies.find((movie) =>
  { return movie.director === req.params.name }));
  });

//get a list of all directors
  app.get('/directors', (req, res) => {
    res.json(directors);
    });  

//get data about a director by name
app.get('/directors/:name', (req, res) => {
  res.json(directors.find((director) =>
  { return director.name === req.params.name }));
  });

  
app.listen(port, () => {
console.log(`Your app is listening on port ${port}.`);
});