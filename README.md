# 🚀 DipayPrem Bot - Setup & Deployment

Telegram Bot + API Server untuk DipayPrem

## 📋 Persyaratan

- Node.js v14+
- Telegram Bot Token (@BotFather)
- Chat ID Admin

## ⚙️ Setup Local

### 1. Buat Bot di @BotFather
- Buka Telegram dan cari @BotFather
- Ketik `/newbot`
- Ikuti petunjuk
- Ambil Bot Token

### 2. Dapatkan Chat ID
- Buka bot Anda di Telegram
- Ketik `/start`
- Buka URL ini (ganti TOKEN):
```
  https://api.telegram.org/bot<TOKEN>/getUpdates
```
- Cari field `"chat":"id"` - angka itu adalah Chat ID Anda

### 3. Clone Repository
```bash
git clone <repo>
cd dipay-bot
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Setup .env File
```bash
cp .env.example .env
```

Edit file `.env` dengan credentials Anda:
```env
TELEGRAM_BOT_TOKEN=5123456789:ABCdefGHIjklmnOPQRstuvWXYZ1234567890
ADMIN_CHAT_ID=987654321
PORT=3000
NODE_ENV=development
```

### 6. Jalankan Server
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## ☁️ GitHub Codespaces Setup

1. Buka repository di GitHub
2. Klik tombol **Code**
3. Pilih **Codespaces** → **Create codespace on main**
4. Tunggu Codespaces terbuka (2-3 menit)
5. Di terminal Codespaces, jalankan:
```bash
   npm install
   cp .env.example .env
```
6. Edit `.env` dengan Bot Token & Chat ID
7. Jalankan:
```bash
   npm start
```
8. Buka tab **PORTS** → Copy URL publik port 3000
9. Gunakan URL itu di website untuk integrasi

## 🔗 API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/health` | Test server |
| GET | `/api/orders` | Lihat semua pesanan |
| GET | `/api/orders/:trxId` | Detail pesanan |
| POST | `/api/orders` | Terima pesanan baru |
| GET | `/api/stats` | Lihat statistik |
| PUT | `/api/orders/:trxId/status` | Update status |

### Contoh:

**Test Server:**
```bash
curl http://localhost:3000/api/health
```

**Lihat Semua Pesanan:**
```bash
curl http://localhost:3000/api/orders
```

**Terima Pesanan Baru:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "product": "Netflix Premium",
    "package": "1 Bulan",
    "payment": "Dana",
    "notes": "Urgent",
    "trxId": "JD-123456-7890"
  }'
```

## 📱 Telegram Bot Commands

- `/menu` - Tampilkan menu admin
- `/orders` - Lihat semua pesanan
- `/stats` - Lihat statistik penjualan
- `/help` - Bantuan

## 🚀 Deploy ke Production

### Option 1: Railway.app (Recommended)

1. Push code ke GitHub
2. Buka https://railway.app
3. Klik **New Project** → **Deploy from GitHub repo**
4. Pilih repository `dipay-bot`
5. Setup environment variables (.env)
6. Deploy!

Public URL: `https://dipay-bot.up.railway.app`

### Option 2: Render.com

1. Buka https://render.com
2. Klik **Create +** → **Web Service**
3. Connect GitHub repository
4. Setup environment variables
5. Deploy!

### Option 3: Heroku (Paid)
```bash
heroku login
heroku create dipay-bot-prod
git push heroku main
heroku config:set TELEGRAM_BOT_TOKEN=xxx
heroku config:set ADMIN_CHAT_ID=xxx
```

## 🐛 Troubleshooting

### Bot tidak menerima pesan?
- Pastikan Bot Token benar di `.env`
- Restart server: `npm start`
- Ketik `/start` di bot

### API Server error?
- Cek port 3000 terbuka
- Lihat logs di terminal
- Pastikan `.env` sudah diisi

### GitHub Codespaces auto-stop?
- Codespaces otomatis stop setelah 30 menit idle
- Gunakan Railway atau Render untuk 24/7

### Data pesanan hilang saat restart?
- Bot menggunakan in-memory storage
- Untuk production, upgrade dengan MongoDB

## 📊 Upgrade dengan Database

Untuk production, tambahkan MongoDB:
```bash
npm install mongoose
```

Buat file `models/Order.js`:
```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    trxId: String,
    name: String,
    email: String,
    product: String,
    package: String,
    payment: String,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
```

## 📞 Support

- **WhatsApp:** +62 895-3916-94499
- **Email:** emipay@yahoo.com
- **Telegram:** @dipay_prem_bot

## 📝 License

MIT License - Gratis digunakan untuk komersial

---

**Happy Coding! 🚀**