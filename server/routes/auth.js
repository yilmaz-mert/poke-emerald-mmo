const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'emerald_secret_key_123';

// KAYIT OL (REGISTER)
router.post('/register', async (req, res) => {
  try {
    const { username, password, avatar } = req.body;

    // Kullanıcı var mı kontrolü
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu eğitmen adı zaten alınmış!' });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Kullanıcıyı oluştur
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        avatar: avatar || 'brendan'
      },
    });

    // Token oluştur
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: 'Eğitmen kaydı başarılı!', 
      token, 
      user: { id: newUser.id, username: newUser.username, avatar: newUser.avatar, pokeDollars: newUser.pokeDollars } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
});

// GİRİŞ YAP (LOGIN)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Eğitmen bulunamadı.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Hatalı şifre!' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ 
      message: 'Hoş geldin!', 
      token, 
      user: { id: user.id, username: user.username, avatar: user.avatar, pokeDollars: user.pokeDollars, mapLocation: user.mapLocation } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
});

// TOKEN DOĞRULAMA & KULLANICI BİLGİSİ GETİRME
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token bulunamadı.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: { id: true, username: true, avatar: true, pokeDollars: true, mapLocation: true, posX: true, posY: true }
    });
    
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token.' });
  }
});

module.exports = router;