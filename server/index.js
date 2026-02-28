// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(cors());
app.use(express.json());
// Serve static assets from the public folder (e.g. /assets/...)
app.use(express.static('public'));

// --- 1. TÜM POKEMONLARI GETİR (Pokedex Listesi) ---
app.get('/api/pokemons', async (req, res) => {
  const { search } = req.query;

  try {
    const pokemons = await prisma.pokemon.findMany({
      where: search ? {
        name: { contains: search.toLowerCase(), mode: 'insensitive' }
      } : {},
      include: {
        types: { include: { type: true } },
        stats: true
      },
      orderBy: { id: 'asc' }
    });

    const formattedPokemons = pokemons.map(p => ({
      ...p,
      sprites: { 
        front_default: p.spriteUrl,
        other: { 'official-artwork': { front_default: p.spriteUrl } }
      },
      types: p.types.map(t => ({ type: { name: t.type.name } })),
      stats: [
        { base_stat: p.stats?.hp || 0, stat: { name: 'hp' } },
        { base_stat: p.stats?.attack || 0, stat: { name: 'attack' } },
        { base_stat: p.stats?.defense || 0, stat: { name: 'defense' } },
        { base_stat: p.stats?.specialAttack || 0, stat: { name: 'special-attack' } },
        { base_stat: p.stats?.specialDefense || 0, stat: { name: 'special-defense' } },
        { base_stat: p.stats?.speed || 0, stat: { name: 'speed' } },
      ]
    }));

    res.json(formattedPokemons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Veritabanından veriler çekilemedi." });
  }
});

app.get('/api/pokemons/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pokemon = await prisma.pokemon.findUnique({
      where: { id: parseInt(id) },
      include: {
        types: { include: { type: true } },
        stats: true
      }
    });

    if (!pokemon) {
      return res.status(404).json({ error: "Pokemon bulunamadı." });
    }

    // Evrim zinciri ID'si ile tüm aileyi buluyoruz
    const evolutionChain = await prisma.pokemon.findMany({
      where: { evolutionChainId: pokemon.evolutionChainId },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        spriteUrl: true
      }
    });

    // Frontend'in beklediği formata sokuyoruz
    res.json({
      ...pokemon,
      sprites: {
        front_default: pokemon.spriteUrl,
        animated: pokemon.animatedUrl,
        artwork: pokemon.artworkUrl
      },
      types: pokemon.types.map(t => ({ type: { name: t.type.name } })),
      stats: [
        { base_stat: pokemon.stats?.hp || 0, stat: { name: 'hp' } },
        { base_stat: pokemon.stats?.attack || 0, stat: { name: 'attack' } },
        { base_stat: pokemon.stats?.defense || 0, stat: { name: 'defense' } },
        { base_stat: pokemon.stats?.specialAttack || 0, stat: { name: 'special-attack' } },
        { base_stat: pokemon.stats?.specialDefense || 0, stat: { name: 'special-defense' } },
        { base_stat: pokemon.stats?.speed || 0, stat: { name: 'speed' } },
      ],
      evolutionChain // Evrim zinciri verisi artık burada!
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});