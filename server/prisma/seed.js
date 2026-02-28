// server/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

// Kendi veritabanı url'in
const connectionString = "postgresql://postgres:12345@localhost:5432/pipirik-s-pokeworld?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Artık sadece resim değil, ses dosyası da indireceğimiz için adını downloadFile yaptık
async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath)) return; // Dosya zaten varsa indirmeyi atla
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`İndirme başarısız: ${url}`);
  
  const folder = path.dirname(destPath);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  
  const fileStream = fs.createWriteStream(destPath);
  await pipeline(response.body, fileStream);
}

async function main() {
  console.log("Akıllı varlık sistemi kuruluyor... Tüm sütunlar kontrol edilecek 🚀");

  for (let i = 1; i <= 151; i++) {
    try {
      // 1. AKILLI KONTROL: Veritabanında bu Pokemon var mı ve TÜM VERİLERİ tam mı?
      const existingPokemon = await prisma.pokemon.findUnique({
        where: { id: i },
        include: { types: true, stats: true, abilities: true }
      });

      // Bütün zorunlu/istenen alanların dolu olup olmadığını kontrol ediyoruz
      const isDataComplete = existingPokemon &&
        existingPokemon.spriteUrl &&
        existingPokemon.animatedUrl &&
        existingPokemon.artworkUrl &&
        existingPokemon.flavorText &&
        existingPokemon.criesUrl &&
        existingPokemon.stats &&
        existingPokemon.types.length > 0 &&
        existingPokemon.abilities.length > 0;

      if (isDataComplete) {
        console.log(`[${i}/151] Eksiksiz! Tüm veriler ve ilişkiler mevcut, atlanıyor... ⏭️`);
        continue; // API'ye istek atmadan direkt bir sonrakine geç
      }

      // 2. VERİ ÇEKME İŞLEMİ (Eğer üstteki kontrolden geçemediyse eksik var demektir)
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const data = await response.json();

      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();

      // --- VERİ AYIKLAMA ---
      
      // Evrim Zinciri ID'si
      const evoChainId = parseInt(speciesData.evolution_chain.url.split('/').filter(Boolean).pop());

      // Hikaye (Flavor Text) - İngilizce olanı bul ve satır atlamalarını temizle
      const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
      const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/[\n\f\r]/g, ' ') : "Açıklama bulunamadı.";

      // --- DOSYA İNDİRME İŞLEMLERİ (Görsel ve Ses) ---
      
      const staticLocalPath = `/assets/gfx/pokemon/gen1/static/${i}.png`;
      const animatedLocalPath = `/assets/gfx/pokemon/gen1/animated/${i}.gif`;
      const artworkLocalPath = `/assets/gfx/pokemon/gen1/artwork/${i}.png`;
      const criesLocalPath = `/assets/audio/cries/${i}.ogg`;

      // Temel Sprite
      await downloadFile(data.sprites.front_default, path.join(__dirname, '../public', staticLocalPath));
      
      // Animasyonlu Sprite
      const animatedUrl = data.sprites.versions['generation-v']['black-white']?.animated?.front_default;
      if (animatedUrl) await downloadFile(animatedUrl, path.join(__dirname, '../public', animatedLocalPath));

      // Artwork (Yüksek kalite)
      const artworkUrl = data.sprites.other['official-artwork']?.front_default;
      if (artworkUrl) await downloadFile(artworkUrl, path.join(__dirname, '../public', artworkLocalPath));

      // Ses (Cries)
      const criesFetchUrl = data.cries?.latest;
      if (criesFetchUrl) await downloadFile(criesFetchUrl, path.join(__dirname, '../public', criesLocalPath));

      // --- VERİTABANI İLİŞKİLERİNİ HAZIRLAMA ---

      // Yetenekleri (Abilities) Upsert ile hazırlıyoruz (Ara tabloya bağlamadan önce veritabanında olmalılar)
      const abilityConnections = [];
      for (const ab of data.abilities) {
        await prisma.ability.upsert({
          where: { name: ab.ability.name },
          update: {},
          create: { name: ab.ability.name }
        });
        // Ara tablo bağlantısı için array'e atıyoruz
        abilityConnections.push({
          ability: { connect: { name: ab.ability.name } },
          isHidden: ab.is_hidden
        });
      }

      // Türleri (Types) Upsert ile hazırlıyoruz
      const typeConnections = [];
      for (const t of data.types) {
        await prisma.type.upsert({
          where: { name: t.type.name },
          update: {},
          create: { name: t.type.name }
        });
        typeConnections.push({
          type: { connect: { name: t.type.name } }
        });
      }

      // 3. VERİTABANINA KAYDETME (Eksikleri tamamla veya yeni oluştur)
      await prisma.pokemon.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          height: data.height,
          weight: data.weight,
          baseExperience: data.base_experience,
          spriteUrl: staticLocalPath,
          animatedUrl: animatedUrl ? animatedLocalPath : staticLocalPath,
          artworkUrl: artworkUrl ? artworkLocalPath : staticLocalPath,
          criesUrl: criesFetchUrl ? criesLocalPath : null,
          flavorText: flavorText,
          evolutionChainId: evoChainId,
          // İlişkileri yenilemek için önce eskileri silip yenilerini ekliyoruz
          types: { deleteMany: {}, create: typeConnections },
          abilities: { deleteMany: {}, create: abilityConnections },
          stats: {
            upsert: {
              create: {
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                special_attack: data.stats[3].base_stat,
                special_defense: data.stats[4].base_stat,
                speed: data.stats[5].base_stat,
              },
              update: {
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                special_attack: data.stats[3].base_stat,
                special_defense: data.stats[4].base_stat,
                speed: data.stats[5].base_stat,
              }
            }
          }
        },
        create: {
          id: data.id,
          name: data.name,
          height: data.height,
          weight: data.weight,
          baseExperience: data.base_experience,
          spriteUrl: staticLocalPath,
          animatedUrl: animatedUrl ? animatedLocalPath : staticLocalPath,
          artworkUrl: artworkUrl ? artworkLocalPath : staticLocalPath,
          criesUrl: criesFetchUrl ? criesLocalPath : null,
          flavorText: flavorText,
          evolutionChainId: evoChainId,
          types: { create: typeConnections },
          abilities: { create: abilityConnections },
          stats: {
            create: {
              hp: data.stats[0].base_stat,
              attack: data.stats[1].base_stat,
              defense: data.stats[2].base_stat,
              special_attack: data.stats[3].base_stat,
              special_defense: data.stats[4].base_stat,
              speed: data.stats[5].base_stat,
            }
          }
        }
      });

      console.log(`[${i}/151] ${data.name.toUpperCase()} için eksik veriler indirildi ve güncellendi. ✅`);
    } catch (error) {
      console.error(`${i} ID'li Pokemon işlenirken hata:`, error);
    }
  }
  console.log("İşlem Tamamlandı! Tüm varlıklar ve veriler %100 güncel. 🐉");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());