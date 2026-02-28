// server/routes/pokemonRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../db');

// TÜM POKEMONLARI GETİR (PokedexModule için)
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pokemons = await prisma.pokemon.findMany({
      where: search ? { name: { contains: search.toLowerCase(), mode: 'insensitive' } } : {},
      include: { types: { include: { type: true } }, stats: true },
      orderBy: { id: 'asc' }
    });

    const formattedPokemons = pokemons.map(p => ({
      ...p,
      sprites: { front_default: p.spriteUrl, other: { 'official-artwork': { front_default: p.spriteUrl } } },
      types: p.types.map(t => ({ type: { name: t.type.name } })),
      stats: [
        { base_stat: p.stats?.hp || 0, stat: { name: 'hp' } },
        { base_stat: p.stats?.attack || 0, stat: { name: 'attack' } },
        { base_stat: p.stats?.defense || 0, stat: { name: 'defense' } },
        { base_stat: p.stats?.special_attack || 0, stat: { name: 'special-attack' } },
        { base_stat: p.stats?.special_defense || 0, stat: { name: 'special-defense' } },
        { base_stat: p.stats?.speed || 0, stat: { name: 'speed' } },
      ]
    }));
    res.json(formattedPokemons);
  } catch (error) {
    res.status(500).json({ error: "Veritabanından veriler çekilemedi." });
  }
});

// POKEMON DETAYI GETİR (PokemonDetail için - YENİ VERİLERLE)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pokemon = await prisma.pokemon.findUnique({
      where: { id: parseInt(id) },
      include: {
        types: { include: { type: true } },
        stats: true,
        abilities: { include: { ability: true } } // YENİ: Yetenekleri dahil et
      }
    });

    if (!pokemon) return res.status(404).json({ error: "Pokemon bulunamadı." });

    const evolutionChain = await prisma.pokemon.findMany({
      where: { evolutionChainId: pokemon.evolutionChainId },
      orderBy: { id: 'asc' },
      select: { id: true, name: true, spriteUrl: true }
    });

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
        { base_stat: pokemon.stats?.special_attack || 0, stat: { name: 'special-attack' } },
        { base_stat: pokemon.stats?.special_defense || 0, stat: { name: 'special-defense' } },
        { base_stat: pokemon.stats?.speed || 0, stat: { name: 'speed' } },
      ],
      abilities: pokemon.abilities.map(a => ({
        isHidden: a.isHidden,
        ability: { name: a.ability.name }
      })),
      evolutionChain
    });
  } catch (error) {
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
});

module.exports = router;