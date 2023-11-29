const express = require('express');
const app = express();
morgan = require('morgan');

const port = 8080;

let favoriteMovies = [
    {
      title: 'Blade Runner',
      director: 'Ridley Scott'
    },
    {
      title: 'A Clockwork Orange',
      director: 'Stanley Kubrick'
    },
    {
      title: 'Brazil',
      director: 'Terry Gilliam'
    },
    {
      title: '8 1/2',
      director: 'Federico Fellini'
    },
    {
      title: 'Mulholland Drive',
      director: 'David Lynch'
    },
    {
      title: 'Excalibur',
      director: 'John Boorman'
    },
    {
      title: 'Alphaville',
      director: 'Jean-Luc Godard'
    },
    {
      title: 'L\'Avventura',
      director: 'Michelangelo Antonioni'
    },
    {
      title: 'My Dinner with Andre',
      director: 'Louis Malle'
    },
    {
      title: 'Stalker',
      director: 'Andrei Tarkovsky'
    }
  ];

app.use(morgan('common'));

app.get('/', (req, res, next) => {
res.send('Welcome to my myFlix movie app!');
});


app.get('/movies', (req, res, next) => {
res.json(favoriteMovies);
});

app.get('/secreturl', (req, res, next) => {
    res.send('Why are you here?');
  });

app.use(express.static('public'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Danger Will Robinson!');
  });
  

app.listen(port, () => {
console.log(`Your app is listening on port ${port}.`);
});