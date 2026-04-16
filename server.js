const express = require('express');
const cors = require('cors');
const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

let model;

// دالة لتحميل الموديل مع الصبر على الإنترنت
async function initAI() {
    console.log("---------------------------------------");
    console.log("جاري محاولة تجهيز مخ الذكاء الاصطناعي... 🧠");
    console.log("ملاحظة: قد يستغرق هذا دقيقتين بسبب جودة الإنترنت");
    
    try {
        // زيادة وقت المحاولة
        model = await use.load();
        console.log("تم تحميل المخ بنجاح باهر يا حسين! ✅");
    } catch (err) {
        console.log("❌ فشل التحميل بسبب الإنترنت، سأحاول مرة أخرى بعد 5 ثوانٍ...");
        setTimeout(initAI, 5000);
    }
    console.log("---------------------------------------");
}
initAI();

app.post('/ai-search', async (req, res) => {
    try {
        const { query, products } = req.body;
        if (!model) return res.status(500).json({ error: "المخ لا يزال يحمل من الإنترنت، انتظر دقيقة" });

        const productNames = products.map(p => p.name);
        const embeddings = await model.embed([query, ...productNames]);
        const vectors = await embeddings.array();

        const queryVector = vectors[0];
        const productVectors = vectors.slice(1);

        let results = products.map((product, index) => ({
            ...product,
            score: cosineSimilarity(queryVector, productVectors[index])
        }));

        results.sort((a, b) => b.score - a.score);
        res.json(results.slice(0, 15));
    } catch (e) {
        res.status(500).json({ error: "خطأ فني" });
    }
});

function cosineSimilarity(v1, v2) {
    let dot = 0, m1 = 0, m2 = 0;
    for (let i = 0; i < v1.length; i++) { dot += v1[i] * v2[i]; m1 += v1[i] * v1[i]; m2 += v2[i] * v2[i]; }
    return dot / (Math.sqrt(m1) * Math.sqrt(m2));
}

app.listen(3000, () => console.log("🚀 السيرفر شغال ومنتظر المخ على المنفذ 3000"));