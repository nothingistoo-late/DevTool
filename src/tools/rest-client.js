import { Icons } from '../core/icons.js';
import { showToast, escapeHtml } from '../core/toast.js';

export const RestClientTool = {
  id: 'rest-client',
  title: 'Mini REST API & Webhook Client',
  shortTitle: 'REST API Client',
  category: 'Network & API',
  icon: Icons.send,
  badge: 'Pro',
  description: 'Test REST API endpoints and webhooks directly in your browser with custom headers, query params, and JSON body.',
  tags: ['api', 'rest', 'http', 'fetch', 'postman', 'curl', 'webhook', 'network', 'client'],

  state: {
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    params: [{ key: '', value: '' }],
    headers: [
      { key: 'Accept', value: 'application/json' },
      { key: 'Content-Type', value: 'application/json' }
    ],
    body: '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}',
    reqTab: 'params', // 'params' | 'headers' | 'body'
    resTab: 'body', // 'body' | 'headers'
    loading: false,
    response: null,
  },

  init(container) {
    this.container = container;
    this.render();
    this.bindEvents();
  },

  destroy() {},

  render() {
    this.container.innerHTML = `
      <div class="flex flex-col h-full gap-3 overflow-hidden">
        
        <!-- Top Request Bar: Method + URL + Send -->
        <div class="bg-base-100 border border-base-content/10 rounded-xl p-3 flex flex-col gap-2.5 shrink-0 shadow-sm">
          
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-base-content uppercase tracking-wider flex items-center gap-1.5">
              <span class="text-primary">${Icons.send}</span> HTTP Request Builder
            </span>

            <!-- Sample APIs Dropdown -->
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-xs btn-outline border-base-content/20 gap-1 font-medium">
                ${Icons.sparkles} <span>API Mẫu để Test</span>
              </div>
              <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-box w-72 text-xs border border-base-content/15 space-y-1 mt-1">
                <li class="menu-title text-[10px] uppercase font-bold text-base-content/50">Chọn nhanh endpoint</li>
                <li><button class="btn-api-preset" data-method="GET" data-url="https://jsonplaceholder.typicode.com/posts/1">GET Bài viết #1 (JSONPlaceholder)</button></li>
                <li><button class="btn-api-preset" data-method="GET" data-url="https://jsonplaceholder.typicode.com/users">GET Danh sách Users (JSONPlaceholder)</button></li>
                <li><button class="btn-api-preset" data-method="POST" data-url="https://jsonplaceholder.typicode.com/posts">POST Tạo bài viết mới</button></li>
                <li><button class="btn-api-preset" data-method="GET" data-url="https://httpbin.org/get">GET httpbin.org/get (Inspect Headers)</button></li>
                <li><button class="btn-api-preset" data-method="GET" data-url="https://api.github.com/zen">GET GitHub Zen Message</button></li>
              </ul>
            </div>
          </div>

          <!-- Input Row -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <!-- Method Selector -->
            <select id="api-method-select" class="select select-sm select-bordered font-bold font-mono text-xs w-28 shrink-0 bg-base-200/50">
              <option value="GET" class="text-sky-500 font-bold" ${this.state.method === 'GET' ? 'selected' : ''}>GET</option>
              <option value="POST" class="text-emerald-500 font-bold" ${this.state.method === 'POST' ? 'selected' : ''}>POST</option>
              <option value="PUT" class="text-amber-500 font-bold" ${this.state.method === 'PUT' ? 'selected' : ''}>PUT</option>
              <option value="PATCH" class="text-purple-500 font-bold" ${this.state.method === 'PATCH' ? 'selected' : ''}>PATCH</option>
              <option value="DELETE" class="text-rose-500 font-bold" ${this.state.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
            </select>

            <!-- URL input -->
            <input type="text" id="api-url-input" class="input input-sm input-bordered flex-1 font-mono text-xs focus:input-primary bg-base-200/50 text-base-content" value="${escapeHtml(this.state.url)}" placeholder="https://api.example.com/v1/resource..." spellcheck="false" />

            <!-- Send Button -->
            <button id="btn-send-request" class="btn btn-sm btn-primary gap-1.5 font-semibold shrink-0 shadow-sm">
              <span id="send-btn-icon">${Icons.send}</span>
              <span id="send-btn-text">Gửi</span>
            </button>
          </div>
        </div>

        <!-- Main Grid: Request Tabs (Left) & Response Viewer (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
          
          <!-- Left Column: Request Configuration (Params, Headers, Body) -->
          <div class="lg:col-span-5 card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
            <!-- Tabs -->
            <div class="px-3 py-1.5 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
              <div class="tabs tabs-boxed bg-base-300/60 p-0.5 gap-0.5" id="api-req-tabs">
                <button class="tab tab-xs tab-active font-medium text-xs" data-tab="params">Params</button>
                <button class="tab tab-xs font-medium text-xs" data-tab="headers">Headers</button>
                <button class="tab tab-xs font-medium text-xs" data-tab="body">Body (JSON)</button>
              </div>
              <span class="text-[10px] text-base-content/50">Cấu hình Request</span>
            </div>

            <!-- Tab 1: Params Key-Value Table -->
            <div id="tab-req-params" class="flex-1 flex flex-col p-3 overflow-hidden bg-base-300/20">
              <div class="text-[11px] font-semibold text-base-content/60 pb-2">Query Parameters (URL)</div>
              <div class="flex-1 overflow-auto space-y-1.5" id="params-rows-mount"></div>
              <button class="btn btn-ghost btn-xs text-xs self-start mt-2" id="btn-add-param">+ Thêm Tham số</button>
            </div>

            <!-- Tab 2: Headers Key-Value Table -->
            <div id="tab-req-headers" class="flex-1 flex flex-col p-3 overflow-hidden bg-base-300/20 hidden">
              <div class="text-[11px] font-semibold text-base-content/60 pb-2">HTTP Headers</div>
              <div class="flex-1 overflow-auto space-y-1.5" id="headers-rows-mount"></div>
              <button class="btn btn-ghost btn-xs text-xs self-start mt-2" id="btn-add-header">+ Thêm Header</button>
            </div>

            <!-- Tab 3: Request Body Editor -->
            <div id="tab-req-body" class="flex-1 flex flex-col p-3 overflow-hidden bg-base-300/20 hidden">
              <div class="flex items-center justify-between pb-2">
                <span class="text-[11px] font-semibold text-base-content/60">JSON Payload</span>
                <button class="btn btn-ghost btn-xs text-xs" id="btn-beautify-req-body">Beautify JSON</button>
              </div>
              <div class="flex-1 p-2 bg-base-100 rounded-lg border border-base-content/10 font-code text-xs">
                <textarea id="api-body-input" class="w-full h-full bg-transparent outline-none resize-none font-code text-xs leading-5 text-base-content" placeholder="Nhập JSON body cho POST / PUT / PATCH..." spellcheck="false">${escapeHtml(this.state.body)}</textarea>
              </div>
            </div>
          </div>

          <!-- Right Column: Response Viewer & Metrics -->
          <div class="lg:col-span-7 card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
            <!-- Response Meta Bar -->
            <div class="px-3 py-2 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between gap-2 shrink-0">
              <div class="flex items-center gap-2">
                <div class="tabs tabs-boxed bg-base-300/60 p-0.5 gap-0.5" id="api-res-tabs">
                  <button class="tab tab-xs tab-active font-medium text-xs" data-tab="body">Response Body</button>
                  <button class="tab tab-xs font-medium text-xs" data-tab="headers">Headers</button>
                </div>
                <div id="response-status-badge" class="badge badge-sm badge-ghost text-[10px] font-mono">Chưa gửi</div>
              </div>

              <!-- Response Metrics & Actions -->
              <div class="flex items-center gap-1.5">
                <span id="response-latency-badge" class="text-[11px] text-base-content/60 font-mono hidden">0 ms</span>
                <span id="response-size-badge" class="text-[11px] text-base-content/60 font-mono hidden">0 B</span>
                <button class="btn btn-ghost btn-xs gap-1" id="btn-copy-response" title="Copy Response">
                  ${Icons.copy} <span class="hidden sm:inline text-xs">Copy</span>
                </button>
              </div>
            </div>

            <!-- Response Body Output -->
            <div id="res-tab-body" class="flex-1 p-3 font-code text-xs bg-base-300/30 overflow-auto select-text leading-5">
              <pre id="response-body-pre" class="whitespace-pre text-base-content/50">Nhấn nút "Gửi" để bắt đầu gửi request và xem phản hồi tại đây.</pre>
            </div>

            <!-- Response Headers Output -->
            <div id="res-tab-headers" class="flex-1 p-3 overflow-auto bg-base-300/20 hidden">
              <div id="response-headers-mount" class="space-y-1 font-mono text-xs">
                <div class="p-4 text-center text-xs text-base-content/40">Chưa có response headers</div>
              </div>
            </div>

            <!-- Footer Note on CORS -->
            <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 flex items-center justify-between text-[11px] text-base-content/60 shrink-0">
              <span>Hỗ trợ mọi endpoint cho phép CORS hoặc API nội bộ (Localhost)</span>
              <span class="text-primary font-mono text-[10px]">Fetch API Client</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderParamsTable();
    this.renderHeadersTable();
  },

  renderParamsTable() {
    const mount = this.container.querySelector('#params-rows-mount');
    mount.innerHTML = '';

    this.state.params.forEach((param, idx) => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-1.5';
      row.innerHTML = `
        <input type="text" class="input input-bordered input-xs flex-1 font-mono text-xs bg-base-100 param-key" value="${escapeHtml(param.key)}" placeholder="Tên param..." />
        <input type="text" class="input input-bordered input-xs flex-1 font-mono text-xs bg-base-100 param-val" value="${escapeHtml(param.value)}" placeholder="Giá trị..." />
        <button class="btn btn-ghost btn-xs btn-square text-error btn-del-param" title="Xóa">${Icons.trash}</button>
      `;

      row.querySelector('.param-key').addEventListener('input', (e) => {
        param.key = e.target.value.trim();
        this.syncParamsToUrl();
      });

      row.querySelector('.param-val').addEventListener('input', (e) => {
        param.value = e.target.value;
        this.syncParamsToUrl();
      });

      row.querySelector('.btn-del-param').addEventListener('click', () => {
        this.state.params.splice(idx, 1);
        if (this.state.params.length === 0) {
          this.state.params.push({ key: '', value: '' });
        }
        this.renderParamsTable();
        this.syncParamsToUrl();
      });

      mount.appendChild(row);
    });
  },

  renderHeadersTable() {
    const mount = this.container.querySelector('#headers-rows-mount');
    mount.innerHTML = '';

    this.state.headers.forEach((header, idx) => {
      const row = document.createElement('div');
      row.className = 'flex items-center gap-1.5';
      row.innerHTML = `
        <input type="text" class="input input-bordered input-xs flex-1 font-mono text-xs bg-base-100 header-key" value="${escapeHtml(header.key)}" placeholder="Header Name..." />
        <input type="text" class="input input-bordered input-xs flex-1 font-mono text-xs bg-base-100 header-val" value="${escapeHtml(header.value)}" placeholder="Header Value..." />
        <button class="btn btn-ghost btn-xs btn-square text-error btn-del-header" title="Xóa">${Icons.trash}</button>
      `;

      row.querySelector('.header-key').addEventListener('input', (e) => {
        header.key = e.target.value.trim();
      });

      row.querySelector('.header-val').addEventListener('input', (e) => {
        header.value = e.target.value;
      });

      row.querySelector('.btn-del-header').addEventListener('click', () => {
        this.state.headers.splice(idx, 1);
        if (this.state.headers.length === 0) {
          this.state.headers.push({ key: '', value: '' });
        }
        this.renderHeadersTable();
      });

      mount.appendChild(row);
    });
  },

  bindEvents() {
    const methodSelect = this.container.querySelector('#api-method-select');
    const urlInput = this.container.querySelector('#api-url-input');
    const bodyInput = this.container.querySelector('#api-body-input');
    const sendBtn = this.container.querySelector('#btn-send-request');

    methodSelect.addEventListener('change', () => {
      this.state.method = methodSelect.value;
    });

    urlInput.addEventListener('input', () => {
      this.state.url = urlInput.value.trim();
    });

    bodyInput.addEventListener('input', () => {
      this.state.body = bodyInput.value;
    });

    // Send Request
    sendBtn.addEventListener('click', () => {
      this.executeRequest();
    });

    // Request tabs
    const reqTabBtns = this.container.querySelectorAll('#api-req-tabs button');
    reqTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reqTabBtns.forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        this.switchReqTab(btn.dataset.tab);
      });
    });

    // Response tabs
    const resTabBtns = this.container.querySelectorAll('#api-res-tabs button');
    resTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        resTabBtns.forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        this.switchResTab(btn.dataset.tab);
      });
    });

    // Add param / header
    this.container.querySelector('#btn-add-param').addEventListener('click', () => {
      this.state.params.push({ key: '', value: '' });
      this.renderParamsTable();
    });

    this.container.querySelector('#btn-add-header').addEventListener('click', () => {
      this.state.headers.push({ key: '', value: '' });
      this.renderHeadersTable();
    });

    // Beautify Body
    this.container.querySelector('#btn-beautify-req-body').addEventListener('click', () => {
      try {
        const obj = JSON.parse(bodyInput.value);
        bodyInput.value = JSON.stringify(obj, null, 2);
        this.state.body = bodyInput.value;
        showToast('Đã format JSON body', 'success');
      } catch {
        showToast('JSON body cú pháp không hợp lệ', 'warning');
      }
    });

    // Copy Response
    this.container.querySelector('#btn-copy-response').addEventListener('click', () => {
      const pre = this.container.querySelector('#response-body-pre');
      if (!pre.textContent) return;
      navigator.clipboard.writeText(pre.textContent);
      showToast('Đã sao chép phản hồi vào clipboard!', 'success');
    });

    // Preset buttons
    this.container.querySelectorAll('.btn-api-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.method = btn.dataset.method;
        this.state.url = btn.dataset.url;
        methodSelect.value = this.state.method;
        urlInput.value = this.state.url;
        this.executeRequest();
      });
    });
  },

  switchReqTab(tab) {
    this.state.reqTab = tab;
    this.container.querySelector('#tab-req-params').classList.toggle('hidden', tab !== 'params');
    this.container.querySelector('#tab-req-headers').classList.toggle('hidden', tab !== 'headers');
    this.container.querySelector('#tab-req-body').classList.toggle('hidden', tab !== 'body');
  },

  switchResTab(tab) {
    this.state.resTab = tab;
    this.container.querySelector('#res-tab-body').classList.toggle('hidden', tab !== 'body');
    this.container.querySelector('#res-tab-headers').classList.toggle('hidden', tab !== 'headers');
  },

  syncParamsToUrl() {
    try {
      const urlInput = this.container.querySelector('#api-url-input');
      const base = urlInput.value.split('?')[0];
      const validParams = this.state.params.filter(p => p.key);

      if (validParams.length === 0) {
        urlInput.value = base;
        this.state.url = base;
        return;
      }

      const searchParams = new URLSearchParams();
      validParams.forEach(p => searchParams.append(p.key, p.value));
      const fullUrl = `${base}?${searchParams.toString()}`;
      urlInput.value = fullUrl;
      this.state.url = fullUrl;
    } catch {
      // ignore
    }
  },

  async executeRequest() {
    const rawUrl = this.container.querySelector('#api-url-input').value.trim();
    if (!rawUrl) {
      showToast('Vui lòng nhập đường dẫn URL', 'warning');
      return;
    }

    const sendBtn = this.container.querySelector('#btn-send-request');
    const sendIcon = this.container.querySelector('#send-btn-icon');
    const sendText = this.container.querySelector('#send-btn-text');
    const statusBadge = this.container.querySelector('#response-status-badge');
    const latencyBadge = this.container.querySelector('#response-latency-badge');
    const sizeBadge = this.container.querySelector('#response-size-badge');
    const bodyPre = this.container.querySelector('#response-body-pre');
    const headersMount = this.container.querySelector('#response-headers-mount');

    // UI Loading state
    sendBtn.disabled = true;
    sendIcon.innerHTML = `<span class="loading loading-spinner loading-xs"></span>`;
    sendText.textContent = 'Đang gửi...';

    const reqHeaders = new Headers();
    this.state.headers.forEach(h => {
      if (h.key && h.value) {
        reqHeaders.append(h.key, h.value);
      }
    });

    const options = {
      method: this.state.method,
      headers: reqHeaders,
    };

    if (['POST', 'PUT', 'PATCH'].includes(this.state.method)) {
      options.body = this.container.querySelector('#api-body-input').value;
    }

    const startTime = performance.now();

    try {
      const res = await fetch(rawUrl, options);
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      // Status badge
      statusBadge.textContent = `${res.status} ${res.statusText || ''}`;
      if (res.ok) {
        statusBadge.className = 'badge badge-sm badge-success text-white font-mono text-[10px]';
      } else if (res.status >= 400 && res.status < 500) {
        statusBadge.className = 'badge badge-sm badge-warning text-white font-mono text-[10px]';
      } else {
        statusBadge.className = 'badge badge-sm badge-error text-white font-mono text-[10px]';
      }

      // Latency & size
      latencyBadge.textContent = `${latencyMs} ms`;
      latencyBadge.classList.remove('hidden');

      const rawText = await res.text();
      const bytes = new Blob([rawText]).size;
      sizeBadge.textContent = bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
      sizeBadge.classList.remove('hidden');

      // Format Body (JSON if possible)
      try {
        const json = JSON.parse(rawText);
        bodyPre.textContent = JSON.stringify(json, null, 2);
      } catch {
        bodyPre.textContent = rawText || '(Empty response body)';
      }

      // Response Headers
      headersMount.innerHTML = '';
      res.headers.forEach((val, key) => {
        headersMount.innerHTML += `
          <div class="p-1.5 rounded bg-base-100 border border-base-content/5 flex items-center justify-between text-xs font-mono">
            <span class="text-primary font-semibold">${escapeHtml(key)}:</span>
            <span class="text-base-content/80 break-all select-all">${escapeHtml(val)}</span>
          </div>
        `;
      });

      showToast(`Đã nhận phản hồi: ${res.status}`, res.ok ? 'success' : 'warning');
    } catch (err) {
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      statusBadge.textContent = 'Error / CORS Blocked';
      statusBadge.className = 'badge badge-sm badge-error text-white font-mono text-[10px]';

      latencyBadge.textContent = `${latencyMs} ms`;
      latencyBadge.classList.remove('hidden');
      sizeBadge.classList.add('hidden');

      bodyPre.textContent = `❌ Lỗi thực thi Request: ${err.message}\n\n💡 Lưu ý về bảo mật trình duyệt (CORS):\n- Nếu gọi API của bên thứ 3 (như Facebook, Google, v.v.), trình duyệt có thể chặn do chính sách Same-Origin Policy (CORS).\n- Để test trơn tru, bạn có thể gọi các API công cộng cho phép CORS (như jsonplaceholder.typicode.com, httpbin.org) hoặc các API máy chủ nội bộ (Localhost).`;
      headersMount.innerHTML = `<div class="p-4 text-center text-xs text-error font-mono">Không nhận được Response Headers do lỗi kết nối hoặc CORS.</div>`;

      showToast(`Lỗi gửi request: ${err.message}`, 'danger');
    } finally {
      sendBtn.disabled = false;
      sendIcon.innerHTML = Icons.send;
      sendText.textContent = 'Gửi';
    }
  }
};
