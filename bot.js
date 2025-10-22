const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_CHAT_ID;

const orders = new Map();
const stats = {
    totalOrders: 0,
    totalRevenue: 0,
    lastUpdated: new Date()
};

bot.start((ctx) => {
    if (ctx.chat.id.toString() === ADMIN_ID) {
        ctx.reply(
            '👋 Selamat datang di DipayPrem Bot!\n\n' +
            'Perintah: /menu, /orders, /stats',
            Markup.keyboard([['/menu', '/orders'], ['/stats']]).resize()
        );
    } else {
        ctx.reply('🔒 Bot hanya untuk admin');
    }
});

bot.command('menu', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_ID) return;
    ctx.reply('📋 MENU', Markup.inlineKeyboard([
        [Markup.button.callback('📊 Pesanan', 'view_orders')],
        [Markup.button.callback('📈 Statistik', 'show_stats')]
    ]));
});

bot.command('orders', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_ID) return;
    if (orders.size === 0) {
        ctx.reply('📭 Belum ada pesanan');
        return;
    }
    let msg = '📋 PESANAN\n\n';
    orders.forEach((order, id) => {
        msg += `${id}\n${order.name}\n${order.product}\n\n`;
    });
    ctx.reply(msg);
});

bot.command('stats', (ctx) => {
    if (ctx.chat.id.toString() !== ADMIN_ID) return;
    let pending = 0, completed = 0;
    orders.forEach(o => {
        if (o.status === 'Pending') pending++;
        if (o.status === 'Completed') completed++;
    });
    ctx.reply(`📊 Total: ${stats.totalOrders}\n✅ Selesai: ${completed}\n⏳ Pending: ${pending}`);
});

bot.action('view_orders', (ctx) => {
    ctx.answerCbQuery();
    ctx.editMessageText('📋 Lihat di /orders');
});

bot.action('show_stats', (ctx) => {
    ctx.answerCbQuery();
    ctx.editMessageText('📈 Lihat di /stats');
});

bot.catch((err) => console.error('Error:', err));

bot.launch();
console.log('🚀 Bot Telegram Berjalan...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));