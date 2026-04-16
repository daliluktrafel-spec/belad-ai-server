const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

const app = express();
let model;

// 1. إعدادات السماح بمرور البيانات (CORS) - يجب أن تكون في البداية
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. زيادة السعة لاستقبال قائمة المنتجات الكبيرة
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// 3. تحميل المخ الذكي
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

// 4. نقطة اتصال لمنع النوم (Ping)
app.get('/ping', (req, res) => {
    res.send('I am awake! 🧠');
});

// 5. البحث الذكي
app.post('/ai-search', async (req, res) => {
    try {
        const { query, products } = req.body;
        if (!model) return res.status(503).json({ error: "المخ ما زال يحمل، انتظر ثواني.." });

        const productNames = products.map(p => p.name);
        const embeddings = await model.embed([query, ...productNames]);
        const vectors = await embeddings.array();
        const queryVector = vectors[0];
        const productVectors = vectors.slice(1);

        let results = products.map((product, index) => ({
            ...product,
            score: cosineSimilarity(queryVector, productVectors[index])
        }));

        // تصفية النتائج لضمان الجودة
        results = results.filter(r => r.score > 0.45); 
        results.sort((a, b) => b.score - a.score);
        
        res.json(results.slice(0, 15));
    } catch (e) { 
        console.error("خطأ في البحث:", e);
        res.status(500).send("خطأ داخلي في السيرفر"); 
    }
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

// 6. المجدول الملقب بـ "المنبه"
cron.schedule('*/10 * * * *', async () => {
    try {
        // السيرفر ينادي نفسه ليبقى مستيقظاً
        const URL = `https://belad-ai-server.onrender.com/ping`;
        await axios.get(URL);
        console.log('⏰ نبضة حياة مجدولة بنجاح');
    } catch (e) { console.log('فشل المنبه الداخلي'); }
});

// 7. تشغيل السيرفر على المنفذ الصحيح لـ Render
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 السيرفر الخرافي يعمل الآن على المنفذ ${PORT}`);
});
