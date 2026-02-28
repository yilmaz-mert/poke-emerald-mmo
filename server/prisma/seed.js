// server/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const connectionString = "postgresql://postgres:12345@localhost:5432/pipirik-s-pokeworld?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Görselleri indirmek için yardımcı fonksiyon
async function downloadImage(url, destPath) {
  if (fs.existsSync(destPath)) return; // Dosya zaten varsa indirme
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`İndirme başarısız: ${url}`);
  
  const folder = path.dirname(destPath);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  
  const fileStream = fs.createWriteStream(destPath);
  await pipeline(response.body, fileStream);
}

async function main() {
  console.log("Bağımsız varlık sistemi kuruluyor... 🚀");

  for (let i = 1; i <= 151; i++) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const data = await response.json();

      // Tür ve Evrim verilerini çek
      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();
      const evoChainId = parseInt(speciesData.evolution_chain.url.split('/').filter(Boolean).pop());

      // Yerel dosya yollarını belirle (Profesyonel Dizin Yapısı)
      const staticLocalPath = `/assets/gfx/pokemon/gen1/static/${i}.png`;
      const animatedLocalPath = `/assets/gfx/pokemon/gen1/animated/${i}.gif`;
      const artworkLocalPath = `/assets/gfx/pokemon/gen1/artwork/${i}.png`;

      // Gerçek dosya sistemine indirme işlemi (server/public/...)
      await downloadImage(data.sprites.front_default, path.join(__dirname, '../public', staticLocalPath));
      
      const animatedUrl = data.sprites.versions['generation-v']['black-white']?.animated?.front_default;
      if (animatedUrl) {
        await downloadImage(animatedUrl, path.join(__dirname, '../public', animatedLocalPath));
      }

      const artworkUrl = data.sprites.other['official-artwork']?.front_default;
      if (artworkUrl) {
        await downloadImage(artworkUrl, path.join(__dirname, '../public', artworkLocalPath));
      }

      // Veritabanını yerel yollarla güncelle
      await prisma.pokemon.upsert({
        where: { id: data.id },
        update: {
          spriteUrl: staticLocalPath,
          animatedUrl: animatedUrl ? animatedLocalPath : staticLocalPath,
          artworkUrl: artworkUrl ? artworkLocalPath : staticLocalPath,
          evolutionChainId: evoChainId
        },
        create: {
          id: data.id,
          name: data.name,
          spriteUrl: staticLocalPath,
          animatedUrl: animatedUrl ? animatedLocalPath : staticLocalPath,
          artworkUrl: artworkUrl ? artworkLocalPath : staticLocalPath,
          evolutionChainId: evoChainId,
          // stats ve types kısımları eski seed.js ile aynı kalacak
        }
      });

      console.log(`[${i}/151] ${data.name.toUpperCase()} indirildi ve yerelleştirildi. ✅`);
    } catch (error) {
      console.error(`${i} ID'li Pokemon işlenirken hata:`, error);
    }
  }
  console.log("Tüm varlıklar yerel diske alındı! %100 Bağımsızlık sağlandı. 🐉");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());