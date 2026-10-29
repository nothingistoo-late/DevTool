import { Icons } from '../core/icons.js';
import { showToast, escapeHtml } from '../core/toast.js';

export const JwtDebuggerTool = {
  id: 'jwt-debugger',
  title: 'JWT Token Debugger & Verifier',
  shortTitle: 'JWT Debugger',
  category: 'Security & Auth',
  icon: Icons.key,
  badge: 'Popular',
  description: 'Decode, inspect claims, calculate expiration countdown, and verify or sign JSON Web Tokens client-side.',
  tags: ['jwt', 'token', 'auth', 'bearer', 'decode', 'verify', 'json web token', 'security', 'hmac'],

  state: {
    token: '',
    secret: 'your-256-bit-secret',
    isSignatureValid: null,
    headerObj: null,
    payloadObj: null,
    signatureRaw: '',
  },

  init(container) {
    this.container = container;
    this.render();
    this.bindEvents();
    this.loadSample();
  },

  destroy() {},

  render() {
    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full overflow-hidden">
        
        <!-- Left Column: Encoded Token & Signature Verify -->
        <div class="lg:col-span-5 card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
          <div class="px-3 py-2 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-1.5 font-semibold text-xs text-base-content">
              <span class="text-primary">${Icons.key}</span>
              <span>Encoded JWT Token</span>
            </div>
            <div class="flex items-center gap-1">
              <button class="btn btn-ghost btn-xs gap-1" id="btn-jwt-sample" title="Nạp token mẫu">
                ${Icons.sparkles} <span class="hidden sm:inline text-xs">Mẫu</span>
              </button>
              <button class="btn btn-ghost btn-xs btn-square text-error" id="btn-jwt-clear" title="Xóa">
                ${Icons.trash}
              </button>
            </div>
          </div>

          <!-- Color Legend Header -->
          <div class="px-3 py-1.5 bg-base-200/30 border-b border-base-content/5 flex items-center gap-3 text-[11px] shrink-0 font-mono">
            <span class="flex items-center gap-1 text-rose-400 font-semibold"><span class="w-2 h-2 rounded-full bg-rose-400"></span> Header</span>
            <span class="flex items-center gap-1 text-purple-400 font-semibold"><span class="w-2 h-2 rounded-full bg-purple-400"></span> Payload</span>
            <span class="flex items-center gap-1 text-sky-400 font-semibold"><span class="w-2 h-2 rounded-full bg-sky-400"></span> Signature</span>
          </div>

          <!-- Raw Token Textarea Area -->
          <div class="flex-1 p-3 bg-base-300/30 overflow-auto">
            <textarea id="jwt-encoded-input" class="w-full h-full p-2 bg-transparent outline-none resize-none font-code text-xs leading-5 break-all text-base-content placeholder:text-base-content/40" placeholder="Dán mã Bearer JWT token vào đây (vd: eyJhbGciOiJIUzI1NiIs...)..." spellcheck="false"></textarea>
          </div>

          <!-- Secret Key Verification Footer -->
          <div class="p-3 bg-base-200/50 border-t border-base-content/10 flex flex-col gap-2 shrink-0">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-semibold text-base-content/80">Khóa bí mật HMAC Secret (để xác minh chữ ký)</label>
              <span id="jwt-verify-badge" class="badge badge-sm badge-ghost text-[10px]">Chưa kiểm tra</span>
            </div>
            <div class="flex gap-1.5">
              <input type="text" id="jwt-secret-input" value="your-256-bit-secret" placeholder="Nhập secret key..." class="input input-bordered input-xs flex-1 font-code text-xs bg-base-100" />
              <button class="btn btn-primary btn-xs text-xs" id="btn-verify-sig">Kiểm tra chữ ký</button>
            </div>
          </div>
        </div>

        <!-- Right Column: Decoded Header, Payload & Claim Analysis -->
        <div class="lg:col-span-7 flex flex-col gap-3 h-full overflow-hidden">
          
          <!-- Expiration Status Card Banner -->
          <div id="jwt-status-banner" class="bg-base-100 border border-base-content/10 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-sm">
            <div class="flex items-center gap-2.5 truncate">
              <span id="jwt-status-icon" class="text-emerald-500">${Icons.check}</span>
              <div class="truncate">
                <div id="jwt-status-title" class="font-bold text-xs text-base-content">Token hợp lệ</div>
                <div id="jwt-status-desc" class="text-[11px] text-base-content/60 truncate">Đang phân tích hạn sử dụng...</div>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button class="btn btn-ghost btn-xs gap-1" id="btn-copy-payload">
                ${Icons.copy} <span class="text-xs">Copy Payload</span>
              </button>
            </div>
          </div>

          <!-- Decoded Panels (Header + Payload) -->
          <div class="grid grid-cols-1 gap-3 flex-1 min-h-0 overflow-y-auto">
            
            <!-- Header Card -->
            <div class="card bg-base-100 border border-base-content/10 shadow-sm shrink-0">
              <div class="px-3 py-1.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center justify-between shrink-0">
                <span class="font-bold text-xs text-rose-400">HEADER: Thuật toán & Loại Token</span>
                <span id="jwt-alg-badge" class="badge badge-xs badge-ghost font-mono">HS256</span>
              </div>
              <div class="p-3 font-code text-xs bg-base-300/30 overflow-x-auto">
                <pre id="jwt-header-pre" class="text-rose-400 whitespace-pre-wrap leading-5"></pre>
              </div>
            </div>

            <!-- Payload Card -->
            <div class="card bg-base-100 border border-base-content/10 shadow-sm flex-1 min-h-[180px] flex flex-col">
              <div class="px-3 py-1.5 bg-purple-500/10 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                <span class="font-bold text-xs text-purple-400">PAYLOAD: Dữ liệu & Claims</span>
                <span id="jwt-claims-count" class="badge badge-xs badge-ghost font-mono">0 claims</span>
              </div>
              
              <!-- Human readable claims inspector -->
              <div id="jwt-claims-breakdown" class="p-3 bg-base-200/40 border-b border-base-content/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <!-- Injected claims info -->
              </div>

              <!-- Raw Decoded JSON View -->
              <div class="flex-1 p-3 font-code text-xs bg-base-300/30 overflow-auto">
                <pre id="jwt-payload-pre" class="text-purple-400 whitespace-pre-wrap leading-5"></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const tokenInput = this.container.querySelector('#jwt-encoded-input');
    const secretInput = this.container.querySelector('#jwt-secret-input');

    tokenInput.addEventListener('input', () => {
      this.decodeToken(tokenInput.value.trim());
    });

    this.container.querySelector('#btn-jwt-sample').addEventListener('click', () => {
      this.loadSample();
    });

    this.container.querySelector('#btn-jwt-clear').addEventListener('click', () => {
      tokenInput.value = '';
      this.clearDecoded();
      showToast('Đã xóa token', 'info');
    });

    this.container.querySelector('#btn-verify-sig').addEventListener('click', () => {
      this.verifySignature(tokenInput.value.trim(), secretInput.value);
    });

    secretInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.verifySignature(tokenInput.value.trim(), secretInput.value);
      }
    });

    this.container.querySelector('#btn-copy-payload').addEventListener('click', () => {
      if (!this.state.payloadObj) return;
      navigator.clipboard.writeText(JSON.stringify(this.state.payloadObj, null, 2));
      showToast('Đã sao chép Payload JSON!', 'success');
    });
  },

  loadSample() {
    // Generate a valid JWT with exp set to 1 hour from now
    const header = { alg: "HS256", typ: "JWT" };
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = {
      sub: "usr_94821a0f",
      name: "Nguyen Van Developer",
      email: "developer@devpulse.io",
      roles: ["admin", "editor"],
      iat: nowSec - 300, // issued 5 minutes ago
      exp: nowSec + 3600, // expires in 1 hour
      iss: "https://auth.devpulse.io",
      aud: "https://api.devpulse.io"
    };

    const b64Header = this.base64UrlEncode(JSON.stringify(header));
    const b64Payload = this.base64UrlEncode(JSON.stringify(payload));
    const dummySignature = "TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";

    const token = `${b64Header}.${b64Payload}.${dummySignature}`;
    const tokenInput = this.container.querySelector('#jwt-encoded-input');
    tokenInput.value = token;
    this.decodeToken(token);
    showToast('Đã nạp JWT token mẫu', 'success');
  },

  decodeToken(tokenStr) {
    if (!tokenStr) {
      this.clearDecoded();
      return;
    }

    // Strip "Bearer " prefix if present
    const cleanToken = tokenStr.replace(/^Bearer\s+/i, '').trim();

    const parts = cleanToken.split('.');
    if (parts.length < 2) {
      this.showInvalid('Cấu trúc JWT không hợp lệ (cần ít nhất 2 phần phân tách bằng dấu chấm)');
      return;
    }

    try {
      const headerJson = this.base64UrlDecode(parts[0]);
      const payloadJson = this.base64UrlDecode(parts[1]);

      const headerObj = JSON.parse(headerJson);
      const payloadObj = JSON.parse(payloadJson);

      this.state.headerObj = headerObj;
      this.state.payloadObj = payloadObj;
      this.state.signatureRaw = parts[2] || '';

      this.renderDecoded(headerObj, payloadObj, parts);
      this.verifySignature(cleanToken, this.container.querySelector('#jwt-secret-input').value, false);
    } catch (err) {
      this.showInvalid(`Lỗi giải mã JSON Base64: ${err.message}`);
    }
  },

  renderDecoded(headerObj, payloadObj, parts) {
    // Render Header
    const headerPre = this.container.querySelector('#jwt-header-pre');
    headerPre.textContent = JSON.stringify(headerObj, null, 2);
    this.container.querySelector('#jwt-alg-badge').textContent = headerObj.alg || 'none';

    // Render Payload
    const payloadPre = this.container.querySelector('#jwt-payload-pre');
    payloadPre.textContent = JSON.stringify(payloadObj, null, 2);
    this.container.querySelector('#jwt-claims-count').textContent = `${Object.keys(payloadObj).length} claims`;

    // Analyze Expiration & Common claims
    const breakdownEl = this.container.querySelector('#jwt-claims-breakdown');
    breakdownEl.innerHTML = '';

    const nowSec = Math.floor(Date.now() / 1000);
    let isExpired = false;
    let expDesc = 'Không có hạn sử dụng (Chưa đặt exp)';

    if (payloadObj.exp) {
      const expSec = payloadObj.exp;
      const expDate = new Date(expSec * 1000);
      const diffSec = expSec - nowSec;

      if (diffSec < 0) {
        isExpired = true;
        const absDiff = Math.abs(diffSec);
        const mins = Math.floor(absDiff / 60);
        const hours = Math.floor(mins / 60);
        expDesc = `Đã hết hạn ${hours > 0 ? `${hours} giờ ` : ''}${mins % 60} phút trước (${expDate.toLocaleString('vi-VN')})`;
      } else {
        const mins = Math.floor(diffSec / 60);
        const hours = Math.floor(mins / 60);
        expDesc = `Còn hạn trong ${hours > 0 ? `${hours} giờ ` : ''}${mins % 60} phút (${expDate.toLocaleString('vi-VN')})`;
      }

      breakdownEl.innerHTML += `
        <div class="p-2 rounded-lg bg-base-100 border border-base-content/5 ${isExpired ? 'border-error/40 bg-error/5' : 'border-success/40 bg-success/5'}">
          <span class="text-base-content/50 block text-[10px] uppercase font-bold">Hạn sử dụng (exp)</span>
          <span class="font-semibold ${isExpired ? 'text-error' : 'text-success'} font-mono text-xs">${escapeHtml(expDesc)}</span>
        </div>
      `;
    }

    if (payloadObj.iat) {
      const iatDate = new Date(payloadObj.iat * 1000);
      breakdownEl.innerHTML += `
        <div class="p-2 rounded-lg bg-base-100 border border-base-content/5">
          <span class="text-base-content/50 block text-[10px] uppercase font-bold">Khởi tạo lúc (iat)</span>
          <span class="font-semibold text-base-content font-mono text-xs">${iatDate.toLocaleString('vi-VN')}</span>
        </div>
      `;
    }

    if (payloadObj.sub) {
      breakdownEl.innerHTML += `
        <div class="p-2 rounded-lg bg-base-100 border border-base-content/5">
          <span class="text-base-content/50 block text-[10px] uppercase font-bold">Đối tượng (sub / User ID)</span>
          <span class="font-semibold text-base-content font-mono text-xs">${escapeHtml(String(payloadObj.sub))}</span>
        </div>
      `;
    }

    if (payloadObj.iss) {
      breakdownEl.innerHTML += `
        <div class="p-2 rounded-lg bg-base-100 border border-base-content/5">
          <span class="text-base-content/50 block text-[10px] uppercase font-bold">Nhà phát hành (iss)</span>
          <span class="font-semibold text-base-content font-mono text-xs">${escapeHtml(String(payloadObj.iss))}</span>
        </div>
      `;
    }

    // Update Status Banner
    const statusTitle = this.container.querySelector('#jwt-status-title');
    const statusDesc = this.container.querySelector('#jwt-status-desc');
    const statusIcon = this.container.querySelector('#jwt-status-icon');

    if (isExpired) {
      statusTitle.textContent = 'Token ĐÃ HẾT HẠN (Expired)';
      statusTitle.className = 'font-bold text-xs text-error';
      statusDesc.textContent = expDesc;
      statusIcon.innerHTML = Icons.alertCircle;
      statusIcon.className = 'text-error';
    } else {
      statusTitle.textContent = 'Token HỢP LỆ (Active)';
      statusTitle.className = 'font-bold text-xs text-success';
      statusDesc.textContent = expDesc;
      statusIcon.innerHTML = Icons.check;
      statusIcon.className = 'text-success';
    }
  },

  async verifySignature(tokenStr, secret, notify = true) {
    const badge = this.container.querySelector('#jwt-verify-badge');
    const parts = tokenStr.replace(/^Bearer\s+/i, '').trim().split('.');

    if (parts.length < 3 || !parts[2]) {
      badge.className = 'badge badge-sm badge-ghost text-[10px]';
      badge.textContent = 'Không có chữ ký (Unsigned)';
      return;
    }

    if (!secret) {
      badge.className = 'badge badge-sm badge-warning text-white text-[10px]';
      badge.textContent = 'Chưa nhập Secret';
      return;
    }

    try {
      const dataToSign = `${parts[0]}.${parts[1]}`;
      const encoder = new TextEncoder();

      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify', 'sign']
      );

      const computedSigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
      const computedSigB64 = this.bufferToBase64Url(computedSigBuffer);

      if (computedSigB64 === parts[2]) {
        badge.className = 'badge badge-sm badge-success text-white text-[10px]';
        badge.textContent = 'Chữ ký HỢP LỆ (Signature Verified)';
        if (notify) showToast('Chữ ký HMAC-SHA256 hoàn toàn chính xác!', 'success');
      } else {
        badge.className = 'badge badge-sm badge-error text-white text-[10px]';
        badge.textContent = 'Chữ ký KHÔNG KHỚP (Invalid)';
        if (notify) showToast('Chữ ký không khớp với secret key đã nhập!', 'danger');
      }
    } catch (err) {
      badge.className = 'badge badge-sm badge-error text-white text-[10px]';
      badge.textContent = 'Lỗi tính toán HMAC';
    }
  },

  base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decoded = atob(base64);
    return decodeURIComponent(escape(decoded));
  },

  base64UrlEncode(str) {
    const utf8 = unescape(encodeURIComponent(str));
    return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  bufferToBase64Url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  clearDecoded() {
    this.container.querySelector('#jwt-header-pre').textContent = '';
    this.container.querySelector('#jwt-payload-pre').textContent = '';
    this.container.querySelector('#jwt-claims-breakdown').innerHTML = '';
    this.container.querySelector('#jwt-alg-badge').textContent = '-';
    this.container.querySelector('#jwt-claims-count').textContent = '0 claims';
    this.container.querySelector('#jwt-verify-badge').textContent = 'Chưa kiểm tra';
    this.container.querySelector('#jwt-verify-badge').className = 'badge badge-sm badge-ghost text-[10px]';
    this.container.querySelector('#jwt-status-title').textContent = 'Chưa có token';
    this.container.querySelector('#jwt-status-desc').textContent = 'Dán token JWT để xem giải mã chi tiết';
  },

  showInvalid(msg) {
    this.container.querySelector('#jwt-status-title').textContent = 'Token Không Hợp Lệ';
    this.container.querySelector('#jwt-status-title').className = 'font-bold text-xs text-error';
    this.container.querySelector('#jwt-status-desc').textContent = msg;
    this.container.querySelector('#jwt-status-icon').innerHTML = Icons.alertCircle;
    this.container.querySelector('#jwt-status-icon').className = 'text-error';
  }
};
