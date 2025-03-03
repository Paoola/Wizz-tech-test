const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');

const gameRoutes = require('./routes/games');

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

app.use('/api/games', gameRoutes);

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

module.exports = app;
