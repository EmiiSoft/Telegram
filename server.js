const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

// ========== SETUP EXPRESS ==========
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ========== SETUP TELEGRAM BOT ==========
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_CHAT_ID;

// Database & Stats
const orders = new Map();
const stats = {
    totalOrders: 0,
    totalRevenue: 0,
    lastUpdated: new Date()
};

const productPrices = {
    'Netflix Premium': { min: 4000, max: 30000, avg: 17000 },
    'Canva Premium': { min: 4500, max: 10000, avg: 7250 },
    'CapCut Premium': { min: 25000, max: 40000, avg: 32500 },
    'WeTV Premium': { min: 17000, max: 17000, avg: 17000 },
    'Bstation Premium': { min: 13000, max: 205000, avg: 109000 },
    'Vidio Premiere': { min: 25000, max: 25000, avg: 25000 },
    'Alight Motion Premium': { min: 6000, max: 60000, avg: 33000 },
    'YouTube Premium': { min: 6000, max: 11000, avg: 8500 },
    'Gift MLBB': { min: 24000, max: 47000, avg: 35500 }
};

// ========== BOT COMMANDS ==========
bot.start((ctx) => {
    if (ctx.chat.id.toString() === ADMIN_ID) {
        ctx.reply(
            '👋 Selamat datang di DipayPrem Bot!\n\n' +
            '📋 Anda adalah ADMIN\n\n' +
            'Perintah: /menu, /orders, /stats, /help',
            Markup.keyboard([['/menu', '/orders'], ['/stats', '/help']]).resize()
        );
    } else {
        ctx.reply('🔒 Bot hanya untuk admin. Hubungi: +62 895-3916-94499');
    }
});

bot.command('menu', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_ID) {
        ctx.reply('❌ Akses ditolak!');
        return;
    }
    ctx.reply('📋 MENU ADMIN', Markup.inlineKeyboard([
        [Markup.button.callback('📊 Pesanan', 'view_orders')],
        [Markup.button.callback('📈 Statistik', 'show_stats')],
        [Markup.button.callback('⚙️ Pengaturan', 'settings')]
    ]));
});

bot.command('orders', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_ID) {
        ctx.reply('❌ Akses ditolak!');
        return;
    }
    showAllOrders(ctx);
});

bot.command('stats', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_ID) {
        ctx.reply('❌ Akses ditolak!');
        return;
    }
    showStatistics(ctx);
});

bot.command('help', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_ID) return;
    ctx.reply(`📖 BANTUAN\n\nPerintah:\n/menu - Menu utama\n/orders - Lihat pesanan\n/stats - Statistik`);
});

// Callback handlers
bot.action('view_orders', (ctx) => {
    ctx.answerCbQuery();
    showAllOrders(ctx);
});

bot.action('show_stats', (ctx) => {
    ctx.answerCbQuery();
    showStatistics(ctx);
});

bot.action('settings', (ctx) => {
    ctx.answerCbQuery();
    ctx.editMessageText('⚙️ PENGATURAN', Markup.inlineKeyboard([
        [Markup.button.callback('🗑️ Hapus Semua', 'confirm_clear')],
        [Markup.button.callback('❌ Tutup', 'close')]
    ]));
});

bot.action('confirm_clear', (ctx) => {
    ctx.answerCbQuery();
    ctx.editMessageText('⚠️ Hapus SEMUA pesanan?', Markup.inlineKeyboard([
        [Markup.button.callback('✅ Ya', 'clear_orders'), Markup.button.callback('❌ Batal', 'settings')]
    ]));
});

bot.action('clear_orders', (ctx) => {
    orders.clear();
    ctx.answerCbQuery('✅ Dihapus!');
    ctx.editMessageText('✅ Semua pesanan dihapus!');
});

bot.action('close', (ctx) => {
    ctx.answerCbQuery();
    ctx.deleteMessage().catch(() => {});
});

bot.action(/^complete_(.+)$/, (ctx) => {
    const trxId = ctx.match[1];
    const order = orders.get(trxId);
    if (order) {
        order.status = 'Completed';
        order.completedAt = new Date().toLocaleString('id-ID');
        ctx.answerCbQuery('✅ Selesai!');
        ctx.editMessageText(ctx.message.text + '\n\n✅ STATUS: SELESAI');
    }
});

bot.action(/^cancel_(.+)$/, (ctx) => {
    const trxId = ctx.match[1];
    const order = orders.get(trxId);
    if (order) {
        order.status = 'Cancelled';
        order.cancelledAt = new Date().toLocaleString('id-ID');
        ctx.answerCbQuery('❌ Batal!');
        ctx.editMessageText(ctx.message.text + '\n\n❌ STATUS: DIBATALKAN');
    }
});

bot.catch((err, ctx) => {
    console.error('❌ Bot Error:', err);
});

// ========== HELPER FUNCTIONS ==========
function showAllOrders(ctx) {
    if (orders.size === 0) {
        ctx.editMessageText('📭 Belum ada pesanan.');
        return;
    }
    let message = '📋 DAFTAR PESANAN\n\n';
    let count = 1;
    orders.forEach((order, trxId) => {
        const icon = order.status === 'Pending' ? '⏳' : order.status === 'Completed' ? '✅' : '❌';
        message += `${count}. ${icon} [${order.status}] ${trxId}\n`;
        message += `   ${order.name} - ${order.product}\n\n`;
        count++;
    });
    ctx.editMessageText(message);
}

function showStatistics(ctx) {
    let pending = 0, completed = 0, cancelled = 0;
    orders.forEach(order => {
        if (order.status === 'Pending') pending++;
        else if (order.status === 'Completed') completed++;
        else cancelled++;
    });
    const msg = `📊 STATISTIK\n\n📈 Total: ${stats.totalOrders}\n✅ Selesai: ${completed}\n⏳ Pending: ${pending}\n❌ Batal: ${cancelled}\n💰 Revenue: Rp ${stats.totalRevenue.toLocaleString('id-ID')}`;
    ctx.editMessageText(msg);
}

// ========== API ROUTES ==========
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'DipayPrem API Server berjalan',
        timestamp: new Date().toLocaleString('id-ID')
    });
});

app.post('/api/orders', async (req, res) => {
    try {
        const { name, email, product, package: pkg, payment, notes, trxId } = req.body;

        if (!name || !email || !product || !pkg || !payment || !trxId) {
            return res.status(400).json({
                success: false,
                message: 'Data tidak lengkap'
            });
        }

        orders.set(trxId, {
            name,
            email,
            product,
            package: pkg,
            payment,
            notes: notes || '-',
            trxId,
            status: 'Pending',
            timestamp: new Date().toLocaleString('id-ID'),
            createdAt: new Date()
        });

        stats.totalOrders++;
        stats.lastUpdated = new Date();

        const prodPrice = productPrices[product];
        if (prodPrice) {
            stats.totalRevenue += prodPrice.avg;
        }

        const message = `
🎉 PESANAN BARU!

🆔 ID TRX: <b>${trxId}</b>
👤 Nama: ${name}
📧 Email: ${email}
📦 Produk: ${product}
📌 Paket: ${pkg}
💳 Metode: ${payment}
📝 Catatan: ${notes || '-'}

⏰ Waktu: ${orders.get(trxId).timestamp}
💰 Est. Harga: Rp ${prodPrice.avg.toLocaleString('id-ID')}

Silakan proses pesanan ini.
        `.trim();

        await bot.telegram.sendMessage(
            ADMIN_ID,
            message,
            {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [
                        Markup.button.callback('✅ Berhasil', `complete_${trxId}`),
                        Markup.button.callback('❌ Batal', `cancel_${trxId}`)
                    ]
                ])
            }
        );

        res.json({
            success: true,
            message: 'Pesanan diterima dan notifikasi dikirim',
            trxId: trxId,
            timestamp: new Date().toLocaleString('id-ID')
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
            error: error.message
        });
    }
});

app.get('/api/orders', (req, res) => {
    const orderList = Array.from(orders.values());
    res.json({
        success: true,
        total: orders.size,
        orders: orderList
    });
});

app.get('/api/orders/:trxId', (req, res) => {
    const order = orders.get(req.params.trxId);
    if (order) {
        res.json({
            success: true,
            order: order
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Pesanan tidak ditemukan'
        });
    }
});

app.get('/api/stats', (req, res) => {
    let pending = 0, completed = 0, cancelled = 0;
    orders.forEach(order => {
        if (order.status === 'Pending') pending++;
        else if (order.status === 'Completed') completed++;
        else cancelled++;
    });

    res.json({
        success: true,
        stats: {
            totalOrders: stats.totalOrders,
            completed: completed,
            pending: pending,
            cancelled: cancelled,
            totalRevenue: stats.totalRevenue,
            lastUpdated: stats.lastUpdated
        }
    });
});

app.put('/api/orders/:trxId/status', (req, res) => {
    const { status } = req.body;
    const order = orders.get(req.params.trxId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Pesanan tidak ditemukan'
        });
    }

    if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Status tidak valid'
        });
    }

    order.status = status;
    order.updatedAt = new Date().toLocaleString('id-ID');

    res.json({
        success: true,
        message: `Status diubah menjadi ${status}`,
        order: order
    });
});

app.use(express.static('public'));

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route tidak ditemukan'
    });
});

// ========== START ==========
app.listen(PORT, () => {
    console.log(`\n🚀 DipayPrem Server Berjalan!`);
    console.log(`📡 Express API: http://localhost:${PORT}`);
});

bot.launch();
console.log(`✅ Bot Telegram Siap Menerima Pesanan`);

process.once('SIGINT', () => {
    console.log('\n⛔ Shutdown...');
    bot.stop('SIGINT');
    process.exit(0);
});

module.exports = app;