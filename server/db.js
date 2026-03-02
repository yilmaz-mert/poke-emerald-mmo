// server/db.js
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// const pool = new Pool({ 
//   connectionString: process.env.DATABASE_URL,
//   // SSL ayarı buraya da eklenmeli
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

const isLocal = process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Yereldeyse SSL'i kapat, değilse (canlı ortam) aç
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;