// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Modüler Rotaları İçeri Aktar
const pokemonRoutes = require('./routes/pokemonRoutes'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rotaları sisteme bağla
app.use('/api/pokemons', pokemonRoutes);

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});