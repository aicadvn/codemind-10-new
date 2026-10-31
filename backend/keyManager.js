import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Quản lý Hồ chứa Khóa (API Key Pool) và Điều phối 5 Luồng Xoay Vòng & Tự Động Dự Phòng (Failover)
 * - Tự động tải nhiều API Key từ file .env hoặc biến môi trường
 * - Cơ chế Round-Robin: Phân bổ đều lưu lượng qua các Key để nhân hạn mức RPM
 * - Cơ chế Tự động chuyển vùng (Auto Failover): Khi 1 Key chạm Rate Limit (429/Quota), lập tức chuyển sang Key tiếp theo
 */
class GeminiKeyManager {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.loadKeys();
  }

  loadKeys() {
    const rawKeys = [];

    // 1. Đọc từ danh sách chuỗi ngăn cách bởi dấu phẩy GEMINI_API_KEYS
    if (process.env.GEMINI_API_KEYS) {
      process.env.GEMINI_API_KEYS.split(',').forEach(k => {
        if (k && k.trim()) rawKeys.push(k.trim());
      });
    }

    // 2. Đọc từ các biến đánh số riêng biệt GEMINI_API_KEY_1 đến GEMINI_API_KEY_50
    for (let i = 1; i <= 50; i++) {
      const k = process.env[`GEMINI_API_KEY_${i}`];
      if (k && k.trim()) {
        rawKeys.push(k.trim());
      }
    }

    // 3. Đọc từ biến đơn truyền thống GEMINI_API_KEY
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
      rawKeys.push(process.env.GEMINI_API_KEY.trim());
    }

    // Lọc trùng và loại bỏ các giá trị placeholder chưa điền
    const uniqueKeys = Array.from(new Set(rawKeys)).filter(
      k => k && !k.includes('your_') && k.length > 10
    );

    this.keys = uniqueKeys.map((key, index) => ({
      id: index + 1,
      key,
      masked: `${key.slice(0, 6)}...${key.slice(-4)}`,
      client: new GoogleGenAI({ apiKey: key }),
      failureCount: 0,
      totalSuccess: 0,
      lastUsed: 0,
      cooldownUntil: 0
    }));

    if (this.keys.length === 0) {
      console.warn('⚠️ [KeyManager] CẢNH BÁO: Chưa tìm thấy API Key nào trong biến môi trường!');
    } else {
      console.log(`✅ [KeyManager] Đã khởi tạo hồ chứa ${this.keys.length} Luồng API Key xoay vòng:`);
      this.keys.forEach(k => {
        console.log(`   * Luồng #${k.id}: [${k.masked}] — Sẵn sàng hoạt động`);
      });
    }
  }

  /**
   * Lấy danh sách key theo thứ tự xoay vòng (Round-Robin) ưu tiên các key không bị Cooldown
   */
  /**
   * Lấy danh sách key theo thứ tự xoay vòng (Round-Robin) ưu tiên các key không bị Cooldown
   */
  getOrderedKeys() {
    if (this.keys.length === 0) return [];
    const ordered = [];
    const now = Date.now();

    // Bắt đầu từ currentIndex để chia đều tải
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      ordered.push(this.keys[idx]);
    }

    // Nhảy con trỏ sang key tiếp theo cho lượt sau
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;

    // Phân loại: Key khỏe (hết cooldown) và Key đang hồi phục
    const healthy = ordered.filter(k => k.cooldownUntil <= now);
    const cooling = ordered.filter(k => k.cooldownUntil > now).sort((a, b) => a.cooldownUntil - b.cooldownUntil);

    // Ưu tiên key khỏe trước, chỉ dùng key đang cooldown khi tất cả key khác đều bận
    return [...healthy, ...cooling];
  }

  /**
   * Thực thi yêu cầu với cơ chế Failover tự động qua tất cả các Key
   */
  async executeWithFailover(actionCallback) {
    if (this.keys.length === 0) {
      throw new Error('Hệ thống chưa có API Key nào được cấu hình trong biến môi trường.');
    }

    const orderedKeys = this.getOrderedKeys();
    let lastError = null;

    for (let attempt = 0; attempt < orderedKeys.length; attempt++) {
      const currentKey = orderedKeys[attempt];
      const now = Date.now();

      // Nếu key này đang trong thời gian cooldown và vẫn còn key khác phía sau, ưu tiên thử key sau
      if (currentKey.cooldownUntil > now && attempt < orderedKeys.length - 1) {
        continue;
      }

      try {
        // Thực thi gọi API với Client của Key hiện tại
        const result = await actionCallback(currentKey.client, currentKey);
        
        // Thành công: Cập nhật chỉ số hoạt động & xóa bỏ cooldown
        currentKey.lastUsed = Date.now();
        currentKey.totalSuccess++;
        currentKey.failureCount = 0;
        currentKey.cooldownUntil = 0;
        return result;

      } catch (err) {
        lastError = err;
        currentKey.failureCount++;
        const errMsg = err.message || '';
        const isRateLimit = errMsg.includes('429') || 
                            errMsg.includes('quota') || 
                            errMsg.includes('RESOURCE_EXHAUSTED') || 
                            errMsg.includes('Too Many Requests');

        if (isRateLimit) {
          // Cooldown ngắn 15s (thay vì 60s) để nhanh chóng tái sử dụng khi hết đợt xung đột tức thời
          currentKey.cooldownUntil = Date.now() + 15000;
          console.warn(`⚠️ [KeyManager] Luồng #${currentKey.id} (${currentKey.masked}) chạm hạn mức (429/Quota). Tạm nghỉ 15s, chuyển luồng tiếp theo...`);
        } else {
          console.warn(`⚠️ [KeyManager] Luồng #${currentKey.id} (${currentKey.masked}) gặp sự cố: ${errMsg.slice(0, 80)}. Thử luồng kế tiếp...`);
        }
      }
    }

    throw new Error(`Tất cả ${this.keys.length} luồng API Key đều không thể hoàn thành yêu cầu. Lỗi cuối: ${lastError?.message}`);
  }

  /**
   * Trả về trạng thái các Key để kiểm tra sức khỏe
   */
  getStatus() {
    const now = Date.now();
    return {
      totalKeys: this.keys.length,
      keys: this.keys.map(k => ({
        id: k.id,
        masked: k.masked,
        totalSuccess: k.totalSuccess,
        failureCount: k.failureCount,
        isCooldown: k.cooldownUntil > now,
        cooldownRemainingSeconds: Math.max(0, Math.round((k.cooldownUntil - now) / 1000))
      }))
    };
  }
}

export const keyManager = new GeminiKeyManager();
