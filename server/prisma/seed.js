// server/prisma/seed.js
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { createClient } = require('@supabase/supabase-js');

// --- SUPABASE KURULUMU ---
// Lütfen kendi Supabase ANON KEY'inizi buraya yapıştırın.
// (Dashboard > Project Settings > API kısmından bulabilirsiniz)
const supabaseUrl = process.env.SUPABASE_URL || 'https://mrwutzuwgqroidgxbwxh.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Hata: .env dosyasında SUPABASE_URL veya SUPABASE_ANON_KEY bulunamadı!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- PRISMA VE VERİTABANI KURULUMU ---
const connectionString = process.env.DIRECT_URL; 
const pool = new Pool({ 
  connectionString,
  // SSL sertifika doğrulama hatasını aşmak için bu kısmı ekliyoruz
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- SUPABASE STORAGE YÜKLEME FONKSİYONU ---
async function uploadToSupabase(url, fileName, folder) {
  if (!url) return null;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`İndirme başarısız: ${url}`);
    
    // Veriyi blob olarak al
    const blob = await response.blob();
    const filePath = `${folder}/${fileName}`;

    // Dosyayı Supabase 'pokemon-assets' bucket'ına yükle (varsa üzerine yazar)
    const { data, error } = await supabase.storage
      .from('pokemon-assets')
      .upload(filePath, blob, { upsert: true });

    if (error) throw error;

    // Yüklenen dosyanın herkese açık (Public) URL'ini al
    const { data: { publicUrl } } = supabase.storage
      .from('pokemon-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error(`${fileName} yüklenirken hata:`, error.message);
    return null;
  }
}

async function main() {
  console.log("Akıllı varlık sistemi çalışıyor... Tüm veriler Supabase'e aktarılacak 🚀");

  for (let i = 1; i <= 151; i++) {
    try {
      // 1. AKILLI KONTROL
      const existingPokemon = await prisma.pokemon.findUnique({
        where: { id: i },
        include: { types: true, stats: true, abilities: true }
      });

      // Eski yerel bağlantılar ('/assets/...') yerine Supabase bağlantıları var mı diye kontrol ediyoruz
      const isDataComplete = existingPokemon &&
        existingPokemon.spriteUrl?.includes('supabase.co') && 
        existingPokemon.animatedUrl?.includes('supabase.co') &&
        existingPokemon.artworkUrl?.includes('supabase.co') &&
        existingPokemon.flavorText &&
        existingPokemon.stats &&
        existingPokemon.types.length > 0 &&
        existingPokemon.abilities.length > 0;

      if (isDataComplete) {
        console.log(`[${i}/151] Eksiksiz! Veriler zaten Supabase üzerinde mevcut, atlanıyor... ⏭️`);
        continue; 
      }

      // 2. VERİ ÇEKME İŞLEMİ (PokeAPI'den)
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
      const data = await response.json();

      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();

      // --- VERİ AYIKLAMA ---
      const evoChainId = parseInt(speciesData.evolution_chain.url.split('/').filter(Boolean).pop());

      const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
      const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/[\n\f\r]/g, ' ') : "Açıklama bulunamadı.";

      // --- DOSYA YÜKLEME İŞLEMLERİ (Supabase Storage) ---
      console.log(`[${i}/151] ${data.name.toUpperCase()} dosyaları çekilip Supabase Storage'a yükleniyor...`);
      
      const staticUrl = await uploadToSupabase(data.sprites.front_default, `${i}.png`, 'static');
      
      const animatedFetchUrl = data.sprites.versions['generation-v']['black-white']?.animated?.front_default;
      const animatedUrl = animatedFetchUrl ? await uploadToSupabase(animatedFetchUrl, `${i}.gif`, 'animated') : staticUrl;

      const artworkFetchUrl = data.sprites.other['official-artwork']?.front_default;
      const artworkUrl = artworkFetchUrl ? await uploadToSupabase(artworkFetchUrl, `${i}.png`, 'artwork') : staticUrl;

      const criesFetchUrl = data.cries?.latest;
      const criesUrl = criesFetchUrl ? await uploadToSupabase(criesFetchUrl, `${i}.ogg`, 'cries') : null;

      // --- VERİTABANI İLİŞKİLERİNİ HAZIRLAMA ---
      const abilityConnections = [];
      for (const ab of data.abilities) {
        await prisma.ability.upsert({
          where: { name: ab.ability.name },
          update: {},
          create: { name: ab.ability.name }
        });
        abilityConnections.push({
          ability: { connect: { name: ab.ability.name } },
          isHidden: ab.is_hidden
        });
      }

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

      // 3. VERİTABANINA KAYDETME (Supabase URL'leri ile güncelleniyor)
      await prisma.pokemon.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          height: data.height,
          weight: data.weight,
          baseExperience: data.base_experience,
          spriteUrl: staticUrl,
          animatedUrl: animatedUrl,
          artworkUrl: artworkUrl,
          criesUrl: criesUrl,
          flavorText: flavorText,
          evolutionChainId: evoChainId,
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
          spriteUrl: staticUrl,
          animatedUrl: animatedUrl,
          artworkUrl: artworkUrl,
          criesUrl: criesUrl,
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

      console.log(`[${i}/151] ${data.name.toUpperCase()} için Supabase linkleri ve veritabanı güncellendi. ✅`);
    } catch (error) {
      console.error(`${i} ID'li Pokemon işlenirken hata:`, error);
    }
  }
  console.log("İşlem Tamamlandı! Tüm varlıklar buluta taşındı ve veritabanı %100 güncel. 🐉");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());