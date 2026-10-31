import { keyManager } from './keyManager.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    console.log('Kiểm tra trạng thái hồ chứa Key:', keyManager.getStatus());
    const res = await keyManager.executeWithFailover(async (aiClient, currentKey) => {
      console.log(`Đang gửi yêu cầu kiểm tra qua Luồng #${currentKey.id} (${currentKey.masked})...`);
      const response = await aiClient.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        contents: [
          { role: 'user', parts: [{ text: 'Xin chào, hãy chào lại ngắn gọn đúng 1 câu!' }] }
        ]
      });
      return response.text;
    });
    console.log('Phản hồi thành công từ AI:\n', res);
    process.exit(0);
  } catch (err) {
    console.error('Lỗi kiểm tra:', err.message);
    process.exit(1);
  }
}

run();
