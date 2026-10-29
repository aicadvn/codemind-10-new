import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: 'Xin chào gia sư CodeMind, hãy bắt đầu buổi học nào!' }] },
        { role: 'model', parts: [{ text: 'Chào bạn, chúng ta cùng tìm hiểu Bài 18: Các lệnh vào ra đơn giản nhé!' }] },
        { role: 'user', parts: [{ text: '1' }] }
      ]
    });
    console.log('SUCCESS:', res.text);
    process.exit(0);
  } catch (err) {
    console.error('ERROR DETAILS:', JSON.stringify(err, null, 2));
    console.error('ERROR MESSAGE:', err.message);
    process.exit(1);
  }
}
run();
