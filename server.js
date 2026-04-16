const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

const app = express();

// تعديل الـ CORS للسماح لموقعك في فيرسل بالدخول
app.use(cors({
    origin: '*', // يسمح لجميع المواقع بالاتصال، وهذا يحل مشكلة الـ Blocked فوراً
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50mb' }));

// 1. تحميل المخ الذكي
async function initAI() {
    console.log("---------------------------------------");
    console.log("جاري تجهيز مخ الذكاء الاصطناعي... 🧠");
    try {
        model = await use.load();
        console.log("تم تحميل المخ بنجاح باهر يا حسين! ✅");
    } catch (err) {
        console.log("❌ فشل التحميل، سأحاول مجدداً...");
        setTimeout(initAI, 5000);
    }
}
initAI();

// 2. نقطة اتصال لمنع النوم (Ping)
app.get('/ping', (req, res) => {
    res.send('I am awake! 🧠');
});

// 3. البحث الذكي
app.post('/ai-search', async (req, res) => {
    try {
        const { query, products } = req.body;
        if (!model) return res.status(500).json({ error: "المخ يحمل.." });

        const productNames = products.map(p => p.name);
        const embeddings = await model.embed([query, ...productNames]);
        const vectors = await embeddings.array();
        const queryVector = vectors[0];
        const productVectors = vectors.slice(1);

        let results = products.map((product, index) => ({
            ...product,
            score: cosineSimilarity(queryVector, productVectors[index])
        }));

        // --- التعديل السحري هنا ---
        // سنظهر فقط المنتجات التي نسبة تشابهها أكثر من 45% 
        // لكي لا تظهر منتجات عشوائية
        results = results.filter(r => r.score > 0.45); 

        results.sort((a, b) => b.score - a.score);
        res.json(results.slice(0, 15));
    } catch (e) { res.status(500).send("خطأ"); }
});
function cosineSimilarity(v1, v2) {
    let dot = 0, m1 = 0, m2 = 0;
    for (let i = 0; i < v1.length; i++) {
        dot += v1[i] * v2[i];
        m1 += v1[i] * v1[i];
        m2 += v2[i] * v2[i];
    }
    return dot / (Math.sqrt(m1) * Math.sqrt(m2));
}

// 4. المجدول الخرافي (Cron Job)
// مثال: يطبع في السجلات كل ساعة أن السيرفر يعمل وبصحة جيدة
cron.schedule('0 * * * *', () => {
    console.log('⏰ تنفيذ المهمة المجدولة: فحص حالة النظام ونشاط السيرفر...');
});

// 5. المنبه الذاتي (يشتغل كل 10 دقائق لضرب الـ Ping)
setInterval(async () => {
    try {
        await axios.get('https://belad-ai-server.onrender.com/ping');
        console.log('✅ تم إرسال نبضة حياة للسيرفر بنجاح');
    } catch (e) { console.log('خطأ في نبضة الحياة'); }
}, 600000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 السيرفر الخرافي يعمل على المنفذ ${PORT}`));
