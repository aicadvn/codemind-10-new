/**
 * LỚP LÁ CHẮN BẢO MẬT HỌC ĐƯỜNG (CLIENT-SIDE INTEGRITY & ANTI-TAMPER SHIELD)
 * Bản quyền: THPT Lạng Giang số 1 - Dự án CodeMind 10
 * 
 * Tính năng chính:
 * 1. Chống phím tắt mở DevTools: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S
 * 2. Chống chuột phải (Context Menu) mở tính năng 'Kiểm tra' (Inspect Element)
 * 3. Phát hiện mở DevTools (DevTools Detector) và hiển thị màn chắn bảo vệ dữ liệu
 * 4. Chống can thiệp, chỉnh sửa DOM (Anti-DOM Tampering)
 */

let overlayElement = null;

function createSecurityOverlay() {
  if (overlayElement) return overlayElement;

  const overlay = document.createElement('div');
  overlay.id = 'codemind-security-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.95)';
  overlay.style.backdropFilter = 'blur(8px)';
  overlay.style.zIndex = '999999';
  overlay.style.display = 'none';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.color = '#ffffff';
  overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  overlay.style.padding = '24px';
  overlay.style.textAlign = 'center';

  overlay.innerHTML = `
    <div style="background: rgba(30, 41, 59, 0.9); border: 2px solid #ef4444; border-radius: 20px; padding: 36px 32px; max-width: 520px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
      <div style="width: 72px; height: 72px; background: rgba(239, 68, 68, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <h2 style="font-size: 22px; font-weight: 800; color: #f87171; margin-bottom: 12px; letter-spacing: -0.5px;">CẢNH BÁO BẢO MẬT HỌC ĐƯỜNG</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
        Hệ thống phát hiện công cụ kiểm tra mã (<strong>F12 / Developer Tools</strong>) đang mở trên trình duyệt.
      </p>
      <div style="background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; font-size: 13.5px; color: #94a3b8; text-align: left; border-left: 4px solid #ef4444;">
        🔒 Để đảm bảo tính trung thực, bảo vệ dữ liệu học tập và ngăn chặn hành vi can thiệp giao diện (DOM tampering), <strong>vui lòng đóng cửa sổ kiểm tra mã</strong> để tiếp tục sử dụng CodeMind 10!
      </div>
      <p style="font-size: 12px; color: #64748b; font-style: italic;">
        Bản quyền THPT Lạng Giang số 1 • Hệ thống bảo mật Socrates CodeMind
      </p>
    </div>
  `;

  document.body.appendChild(overlay);
  overlayElement = overlay;
  return overlay;
}

export function initSecurityShield() {
  if (typeof window === 'undefined') return;

  // 1. Chống mở Context Menu (Chuột phải -> Kiểm tra / Inspect)
  window.addEventListener('contextmenu', (e) => {
    // Cho phép chuột phải trong Monaco Editor nếu cần, còn lại chặn toàn bộ
    const target = e.target;
    if (target && target.closest && target.closest('.monaco-editor')) {
      return; // Để Monaco Editor hiện menu ngữ cảnh riêng của nó
    }
    e.preventDefault();
    e.stopPropagation();
  }, { capture: true });

  // 2. Chống các phím tắt can thiệp mã nguồn và DevTools
  window.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl + Shift + I (DevTools)
    // Ctrl + Shift + J (Console)
    // Ctrl + Shift + C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl + U (View Page Source)
    if (e.ctrlKey && ['u', 'U'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl + S (Save Page)
    if (e.ctrlKey && ['s', 'S'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Cơ chế phát hiện DevTools đang mở (Window Dimension Differential)
  const overlay = createSecurityOverlay();
  let isDevToolsOpen = false;
  const threshold = 160;

  const detectDevTools = () => {
    // Đo chênh lệch giữa kích thước ngoài và trong của cửa sổ trình duyệt
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;

    const detected = widthDiff || heightDiff;

    if (detected && !isDevToolsOpen) {
      isDevToolsOpen = true;
      if (overlay) overlay.style.display = 'flex';
    } else if (!detected && isDevToolsOpen) {
      isDevToolsOpen = false;
      if (overlay) overlay.style.display = 'none';
    }
  };

  window.addEventListener('resize', detectDevTools);
  setInterval(detectDevTools, 800);
}
