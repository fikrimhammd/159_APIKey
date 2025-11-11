const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2'); // <== penting!
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === Koneksi ke database ===
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Kendari2023',
  database: 'db_apikey',
  port: 3309
});

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal konek ke database:', err);
  } else {
    console.log('✅ Terhubung ke database MySQL');
  }
});

// === Endpoint uji coba ===
app.get('/test', (req, res) => {
  res.send('Hello World!');
});

app.get('/status', (req, res) => {
  res.json({ success: true });
});

// === Endpoint buat API Key dan simpan ke DB ===
app.post('/create', (req, res) => {
  const rawKey = 'sk-sm-v1' + crypto.randomBytes(24).toString('hex').toUpperCase();
  const formattedKey = `API-${rawKey.slice(0, 8)}-${rawKey.slice(8, 16)}-${rawKey.slice(16, 24)}-${rawKey.slice(24, 32)}-${rawKey.slice(32, 40)}-${rawKey.slice(40, 48)}`;

  const sql = 'INSERT INTO apikeys (api_key_value, is_active) VALUES (?, 1)';
  db.query(sql, [formattedKey], (err, result) => {
    if (err) {
      console.error('❌ Gagal menyimpan API Key:', err);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan ke database' });
    }

    console.log('✅ API Key tersimpan dengan ID:', result.insertId);
    res.json({
      success: true,
      apiKey: formattedKey,
      id: result.insertId
    });
  });
});

