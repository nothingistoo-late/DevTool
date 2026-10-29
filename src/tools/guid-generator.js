import { Icons } from '../core/icons.js';
import { showToast, escapeHtml } from '../core/toast.js';

export const GuidGeneratorTool = {
  id: 'guid-generator',
  title: 'GUID / UUID Generator & Inspector',
  shortTitle: 'GUID Generator',
  category: 'Generators',
  icon: Icons.fingerprint,
  badge: 'New',
  description: 'Generate bulk cryptographically secure UUID v4, v7 (time-ordered), or inspect and validate existing GUIDs.',
  tags: ['guid', 'uuid', 'v4', 'v7', 'generator', 'unique', 'identifier', 'rfc9562', 'random'],

  state: {
    version: 'v4', // 'v4' | 'v7' | 'v1' | 'nil'
    quantity: 5,
    uppercase: false,
    hyphens: true,
    brackets: 'none', // 'none' | 'braces' | 'parentheses'
    quotes: 'none', // 'none' | 'double' | 'single'
    wrapper: 'list', // 'list' | 'json' | 'csharp' | 'sql'
    generatedList: [],
    activeTab: 'generator', // 'generator' | 'inspector'
  },

  init(container) {
    this.container = container;
    this.render();
    this.bindEvents();
    this.generateGuids();
  },

  destroy() {},

  render() {
    this.container.innerHTML = `
      <div class="flex flex-col h-full gap-3 overflow-hidden">
        
        <!-- Header Toolbar: Mode Tabs & Actions -->
        <div class="bg-base-100 border border-base-content/10 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-sm">
          <div class="tabs tabs-boxed bg-base-300/60 p-0.5 gap-0.5" id="guid-tabs">
            <button class="tab tab-xs sm:tab-sm tab-active font-medium" data-tab="generator">${Icons.fingerprint} Generator</button>
            <button class="tab tab-xs sm:tab-sm font-medium" data-tab="inspector">${Icons.search} Inspector & Validator</button>
          </div>

          <div class="flex items-center gap-1.5 ml-auto">
            <button class="btn btn-primary btn-xs sm:btn-sm gap-1.5 font-medium shadow-sm" id="btn-generate-main">
              ${Icons.refresh} <span>Tạo mới</span>
            </button>
            <button class="btn btn-ghost btn-xs sm:btn-sm gap-1" id="btn-copy-all" title="Sao chép toàn bộ danh sách">
              ${Icons.copy} <span class="hidden sm:inline text-xs">Copy Tất cả</span>
            </button>
            <button class="btn btn-ghost btn-xs sm:btn-sm gap-1" id="btn-download-guids" title="Tải về file .txt">
              ${Icons.download} <span class="hidden sm:inline text-xs">Tải .txt</span>
            </button>
          </div>
        </div>

        <!-- Tab 1: GUID Generator View -->
        <div id="view-generator" class="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
          
          <!-- Left Configuration Card -->
          <div class="lg:col-span-4 card bg-base-100 border border-base-content/10 shadow-sm overflow-y-auto p-4 flex flex-col gap-3.5 shrink-0">
            <div class="font-bold text-xs uppercase tracking-wider text-base-content/50 pb-1 border-b border-base-content/10">
              Cấu hình GUID / UUID
            </div>

            <!-- Version Selection -->
            <div>
              <label class="label p-0 pb-1.5 text-xs font-semibold text-base-content">Phiên bản UUID</label>
              <div class="grid grid-cols-2 gap-1.5" id="guid-version-group">
                <button class="btn btn-xs btn-active justify-start font-medium" data-ver="v4">
                  <span class="badge badge-xs badge-primary font-mono">v4</span> Random (Chuẩn)
                </button>
                <button class="btn btn-xs btn-ghost justify-start font-medium" data-ver="v7" title="UUID v7 theo thời gian, tối ưu Primary Key DB">
                  <span class="badge badge-xs badge-accent font-mono">v7</span> Time-ordered
                </button>
                <button class="btn btn-xs btn-ghost justify-start font-medium" data-ver="v1">
                  <span class="badge badge-xs badge-neutral font-mono">v1</span> Timestamp
                </button>
                <button class="btn btn-xs btn-ghost justify-start font-medium" data-ver="nil">
                  <span class="badge badge-xs badge-ghost font-mono">nil</span> Empty / Nil
                </button>
              </div>
            </div>

            <!-- Quantity -->
            <div>
              <label class="label p-0 pb-1.5 flex justify-between text-xs font-semibold text-base-content">
                <span>Số lượng</span>
                <span id="quantity-label" class="badge badge-sm badge-ghost font-mono text-[11px]">5</span>
              </label>
              <div class="join w-full" id="guid-qty-group">
                <button class="join-item btn btn-xs flex-1" data-qty="1">1</button>
                <button class="join-item btn btn-xs flex-1 btn-active" data-qty="5">5</button>
                <button class="join-item btn btn-xs flex-1" data-qty="10">10</button>
                <button class="join-item btn btn-xs flex-1" data-qty="25">25</button>
                <button class="join-item btn btn-xs flex-1" data-qty="50">50</button>
              </div>
            </div>

            <div class="divider my-0.5"></div>

            <!-- Format Options -->
            <div class="space-y-2">
              <label class="label p-0 text-xs font-semibold text-base-content">Định dạng hiển thị</label>
              
              <!-- Hyphens & Uppercase Toggles -->
              <div class="space-y-1.5 bg-base-200/50 p-2.5 rounded-lg border border-base-content/5">
                <label class="label cursor-pointer p-0 flex justify-between">
                  <span class="text-xs">Dấu gạch ngang (Hyphens)</span>
                  <input type="checkbox" id="opt-hyphens" class="checkbox checkbox-xs checkbox-primary" checked />
                </label>
                <label class="label cursor-pointer p-0 flex justify-between">
                  <span class="text-xs">Chữ in hoa (UPPERCASE)</span>
                  <input type="checkbox" id="opt-uppercase" class="checkbox checkbox-xs checkbox-primary" />
                </label>
              </div>
            </div>

            <!-- Brackets & Quotes -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="label p-0 pb-1 text-xs text-base-content/70">Dấu ngoặc</label>
                <select id="select-brackets" class="select select-bordered select-xs w-full text-xs">
                  <option value="none">Không có</option>
                  <option value="braces">{...} Ngoặc nhọn</option>
                  <option value="parentheses">(...) Ngoặc tròn</option>
                </select>
              </div>
              <div>
                <label class="label p-0 pb-1 text-xs text-base-content/70">Dấu nháy</label>
                <select id="select-quotes" class="select select-bordered select-xs w-full text-xs">
                  <option value="none">Không có</option>
                  <option value="double">"..." Nháy kép</option>
                  <option value="single">'...' Nháy đơn</option>
                </select>
              </div>
            </div>

            <!-- Wrapper format (C#, JSON, SQL) -->
            <div>
              <label class="label p-0 pb-1 text-xs text-base-content/70">Định dạng code xuất bản</label>
              <select id="select-wrapper" class="select select-bordered select-xs w-full text-xs">
                <option value="list">Danh sách từng dòng (Mặc định)</option>
                <option value="json">Mảng JSON ["...", "..."]</option>
                <option value="csharp">C# Guid.Parse("...")</option>
                <option value="sql">SQL IN ('...', '...')</option>
              </select>
            </div>
          </div>

          <!-- Right Results Card -->
          <div class="lg:col-span-8 card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
            <div class="px-4 py-2.5 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-xs text-base-content">Danh sách GUID / UUID đã tạo</span>
                <span id="result-count-badge" class="badge badge-sm badge-ghost font-mono text-[10px]">5 GUIDs</span>
              </div>
              <div class="text-[11px] text-base-content/50">
                Click vào từng dòng để sao chép nhanh
              </div>
            </div>

            <!-- GUID List Output Area -->
            <div id="guid-list-mount" class="flex-1 overflow-auto p-3 space-y-1.5 font-code text-xs bg-base-300/20">
              <!-- Dynamically populated -->
            </div>

            <!-- Formatted code preview area (if JSON, C#, or SQL is selected) -->
            <div id="guid-code-mount" class="flex-1 overflow-auto p-3 font-code text-xs bg-base-300/30 hidden">
              <pre class="whitespace-pre-wrap break-all text-base-content" id="guid-code-pre"></pre>
            </div>

            <!-- Footer Stats -->
            <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 flex items-center justify-between text-[11px] text-base-content/60 shrink-0">
              <span id="guid-meta-summary">Được tạo bằng thuật toán mã hóa ngẫu nhiên an toàn (Crypto API).</span>
              <span class="font-mono">RFC 4122 / RFC 9562</span>
            </div>
          </div>
        </div>

        <!-- Tab 2: GUID Inspector & Validator View -->
        <div id="view-inspector" class="card bg-base-100 border border-base-content/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-auto p-4 gap-4 hidden">
          <div>
            <h2 class="text-sm font-bold text-base-content mb-1">Kiểm tra & Giải mã chi tiết UUID / GUID</h2>
            <p class="text-xs text-base-content/60">Dán bất kỳ chuỗi UUID nào vào đây để kiểm tra tính hợp lệ và giải mã ngày giờ tạo (cho UUID v1 và UUID v7).</p>
          </div>

          <div class="flex gap-2">
            <input type="text" id="inspector-input" placeholder="Dán UUID vào đây (ví dụ: 018e69d7-84a1-79b8-a764-a690e50f3b0c)..." class="input input-bordered input-sm flex-1 font-code text-xs focus:input-primary" spellcheck="false" />
            <button class="btn btn-primary btn-sm text-xs" id="btn-inspect-trigger">Kiểm tra</button>
          </div>

          <div id="inspector-result-card" class="bg-base-200/50 border border-base-content/10 rounded-xl p-4 space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-base-content">Trạng thái:</span>
              <span id="inspect-status-badge" class="badge badge-neutral text-xs">Chưa nhập</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs" id="inspect-details-grid">
              <div class="bg-base-100 p-3 rounded-lg border border-base-content/5">
                <span class="text-base-content/50 block text-[11px]">Phiên bản (Version)</span>
                <span id="inspect-val-version" class="font-semibold text-base-content font-mono">-</span>
              </div>
              <div class="bg-base-100 p-3 rounded-lg border border-base-content/5">
                <span class="text-base-content/50 block text-[11px]">Biến thể (Variant)</span>
                <span id="inspect-val-variant" class="font-semibold text-base-content font-mono">-</span>
              </div>
              <div class="bg-base-100 p-3 rounded-lg border border-base-content/5 md:col-span-2">
                <span class="text-base-content/50 block text-[11px]">Thời gian khởi tạo (Timestamp trích xuất)</span>
                <span id="inspect-val-timestamp" class="font-semibold text-base-content font-mono">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    // Mode tabs (Generator vs Inspector)
    const tabBtns = this.container.querySelectorAll('#guid-tabs button');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        this.state.activeTab = btn.dataset.tab;

        const viewGen = this.container.querySelector('#view-generator');
        const viewInsp = this.container.querySelector('#view-inspector');
        if (this.state.activeTab === 'generator') {
          viewGen.classList.remove('hidden');
          viewInsp.classList.add('hidden');
        } else {
          viewGen.classList.add('hidden');
          viewInsp.classList.remove('hidden');
        }
      });
    });

    // Version buttons
    const verBtns = this.container.querySelectorAll('#guid-version-group button');
    verBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        verBtns.forEach(b => {
          b.className = 'btn btn-xs btn-ghost justify-start font-medium';
        });
        btn.className = 'btn btn-xs btn-active justify-start font-medium';
        this.state.version = btn.dataset.ver;
        this.generateGuids();
      });
    });

    // Quantity buttons
    const qtyBtns = this.container.querySelectorAll('#guid-qty-group button');
    qtyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        qtyBtns.forEach(b => b.classList.remove('btn-active'));
        btn.classList.add('btn-active');
        this.state.quantity = parseInt(btn.dataset.qty, 10);
        this.container.querySelector('#quantity-label').textContent = this.state.quantity;
        this.generateGuids();
      });
    });

    // Checkboxes
    const chkHyphens = this.container.querySelector('#opt-hyphens');
    chkHyphens.addEventListener('change', () => {
      this.state.hyphens = chkHyphens.checked;
      this.renderCurrentList();
    });

    const chkUppercase = this.container.querySelector('#opt-uppercase');
    chkUppercase.addEventListener('change', () => {
      this.state.uppercase = chkUppercase.checked;
      this.renderCurrentList();
    });

    // Selects
    const selectBrackets = this.container.querySelector('#select-brackets');
    selectBrackets.addEventListener('change', () => {
      this.state.brackets = selectBrackets.value;
      this.renderCurrentList();
    });

    const selectQuotes = this.container.querySelector('#select-quotes');
    selectQuotes.addEventListener('change', () => {
      this.state.quotes = selectQuotes.value;
      this.renderCurrentList();
    });

    const selectWrapper = this.container.querySelector('#select-wrapper');
    selectWrapper.addEventListener('change', () => {
      this.state.wrapper = selectWrapper.value;
      this.renderCurrentList();
    });

    // Generate button
    this.container.querySelector('#btn-generate-main').addEventListener('click', () => {
      this.generateGuids();
      showToast('Đã tạo danh sách GUID mới', 'success');
    });

    // Copy all
    this.container.querySelector('#btn-copy-all').addEventListener('click', () => {
      this.copyAllOutput();
    });

    // Download .txt
    this.container.querySelector('#btn-download-guids').addEventListener('click', () => {
      this.downloadOutput();
    });

    // Inspector events
    const inspectInput = this.container.querySelector('#inspector-input');
    const inspectBtn = this.container.querySelector('#btn-inspect-trigger');
    inspectBtn.addEventListener('click', () => {
      this.inspectGuid(inspectInput.value.trim());
    });
    inspectInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.inspectGuid(inspectInput.value.trim());
      }
    });
  },

  // Generates fresh raw UUIDs (in standard lowercase hyphenated form)
  generateGuids() {
    const list = [];
    for (let i = 0; i < this.state.quantity; i++) {
      if (this.state.version === 'v4') {
        list.push(this.createUuidV4());
      } else if (this.state.version === 'v7') {
        list.push(this.createUuidV7());
      } else if (this.state.version === 'v1') {
        list.push(this.createUuidV1());
      } else if (this.state.version === 'nil') {
        list.push('00000000-0000-0000-0000-000000000000');
      }
    }
    this.state.generatedList = list;
    this.renderCurrentList();
  },

  // UUID v4: Cryptographically secure random
  createUuidV4() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC 4122
    return this.bytesToUuid(bytes);
  },

  // UUID v7: Time-ordered (RFC 9562)
  createUuidV7() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    const now = Date.now();
    // 48-bit timestamp in milliseconds
    bytes[0] = (now / 0x10000000000) & 0xff;
    bytes[1] = (now / 0x100000000) & 0xff;
    bytes[2] = (now / 0x1000000) & 0xff;
    bytes[3] = (now / 0x10000) & 0xff;
    bytes[4] = (now / 0x100) & 0xff;
    bytes[5] = now & 0xff;

    // Version 7
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    // Variant RFC 9562
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return this.bytesToUuid(bytes);
  },

  // UUID v1: Timestamp-based fallback
  createUuidV1() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Gregorian epoch offset (1582-10-15) to Unix epoch (1970-01-01) in 100-ns intervals
    const now100ns = BigInt(Date.now()) * 10000n + 122192928000000000n;
    const timeLow = Number(now100ns & 0xffffffffn);
    const timeMid = Number((now100ns >> 32n) & 0xffffn);
    const timeHiAndVer = Number((now100ns >> 48n) & 0x0fffn) | 0x1000; // v1

    bytes[0] = (timeLow >>> 24) & 0xff;
    bytes[1] = (timeLow >>> 16) & 0xff;
    bytes[2] = (timeLow >>> 8) & 0xff;
    bytes[3] = timeLow & 0xff;
    bytes[4] = (timeMid >>> 8) & 0xff;
    bytes[5] = timeMid & 0xff;
    bytes[6] = (timeHiAndVer >>> 8) & 0xff;
    bytes[7] = timeHiAndVer & 0xff;
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant RFC

    return this.bytesToUuid(bytes);
  },

  bytesToUuid(bytes) {
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  },

  // Format a single raw UUID string based on current options
  formatSingleGuid(rawGuid) {
    let formatted = rawGuid;

    // Hyphens
    if (!this.state.hyphens) {
      formatted = formatted.replace(/-/g, '');
    }

    // Casing
    if (this.state.uppercase) {
      formatted = formatted.toUpperCase();
    } else {
      formatted = formatted.toLowerCase();
    }

    // Brackets
    if (this.state.brackets === 'braces') {
      formatted = `{${formatted}}`;
    } else if (this.state.brackets === 'parentheses') {
      formatted = `(${formatted})`;
    }

    // Quotes
    if (this.state.quotes === 'double') {
      formatted = `"${formatted}"`;
    } else if (this.state.quotes === 'single') {
      formatted = `'${formatted}'`;
    }

    return formatted;
  },

  renderCurrentList() {
    const mountList = this.container.querySelector('#guid-list-mount');
    const mountCode = this.container.querySelector('#guid-code-mount');
    const codePre = this.container.querySelector('#guid-code-pre');
    const countBadge = this.container.querySelector('#result-count-badge');

    countBadge.textContent = `${this.state.generatedList.length} GUIDs`;

    const formattedList = this.state.generatedList.map(raw => this.formatSingleGuid(raw));

    // Special wrapper outputs (JSON, C#, SQL)
    if (this.state.wrapper !== 'list') {
      mountList.classList.add('hidden');
      mountCode.classList.remove('hidden');

      let outputCode = '';
      if (this.state.wrapper === 'json') {
        outputCode = JSON.stringify(formattedList, null, 2);
      } else if (this.state.wrapper === 'csharp') {
        outputCode = formattedList.map(g => `var guid = Guid.Parse("${g.replace(/['"{}]/g, '')}");`).join('\n');
      } else if (this.state.wrapper === 'sql') {
        outputCode = `IN (\n  ` + formattedList.map(g => `'${g.replace(/['"{}]/g, '')}'`).join(',\n  ') + `\n)`;
      }
      codePre.textContent = outputCode;
      return;
    }

    // Standard list view
    mountList.classList.remove('hidden');
    mountCode.classList.add('hidden');
    mountList.innerHTML = '';

    formattedList.forEach((guidText, idx) => {
      const row = document.createElement('div');
      row.className = 'group p-2 rounded-lg bg-base-100 hover:bg-base-200 border border-base-content/5 hover:border-primary/30 flex items-center justify-between gap-2 transition-all cursor-pointer';
      row.innerHTML = `
        <div class="flex items-center gap-2.5 truncate">
          <span class="text-base-content/30 text-[10px] select-none w-4 text-right">${idx + 1}</span>
          <span class="font-mono text-xs select-all text-base-content">${escapeHtml(guidText)}</span>
        </div>
        <button class="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 text-xs gap-1 font-normal" data-copy="${escapeHtml(guidText)}">
          ${Icons.copy} Copy
        </button>
      `;

      row.addEventListener('click', () => {
        navigator.clipboard.writeText(guidText);
        showToast(`Đã sao chép: ${guidText}`, 'success', 2000);
      });

      mountList.appendChild(row);
    });
  },

  copyAllOutput() {
    let textToCopy = '';
    const formattedList = this.state.generatedList.map(raw => this.formatSingleGuid(raw));

    if (this.state.wrapper === 'json') {
      textToCopy = JSON.stringify(formattedList, null, 2);
    } else if (this.state.wrapper === 'csharp') {
      textToCopy = formattedList.map(g => `var guid = Guid.Parse("${g.replace(/['"{}]/g, '')}");`).join('\n');
    } else if (this.state.wrapper === 'sql') {
      textToCopy = `IN (\n  ` + formattedList.map(g => `'${g.replace(/['"{}]/g, '')}'`).join(',\n  ') + `\n)`;
    } else {
      textToCopy = formattedList.join('\n');
    }

    navigator.clipboard.writeText(textToCopy);
    showToast(`Đã sao chép toàn bộ ${formattedList.length} GUID vào clipboard!`, 'success');
  },

  downloadOutput() {
    let content = '';
    const formattedList = this.state.generatedList.map(raw => this.formatSingleGuid(raw));

    if (this.state.wrapper === 'json') {
      content = JSON.stringify(formattedList, null, 2);
    } else {
      content = formattedList.join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guids_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã bắt đầu tải file guids.txt', 'success');
  },

  // Inspect any UUID string
  inspectGuid(uuid) {
    const clean = uuid.trim().replace(/[{()}'"]/g, '');
    const badge = this.container.querySelector('#inspect-status-badge');
    const valVersion = this.container.querySelector('#inspect-val-version');
    const valVariant = this.container.querySelector('#inspect-val-variant');
    const valTimestamp = this.container.querySelector('#inspect-val-timestamp');

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-([89ab][0-9a-f]{3})-[0-9a-f]{12}$/i;
    const match = clean.match(uuidRegex);

    if (clean === '00000000-0000-0000-0000-000000000000') {
      badge.className = 'badge badge-success text-white text-xs';
      badge.textContent = 'Hợp lệ (Nil UUID)';
      valVersion.textContent = 'Nil (Empty)';
      valVariant.textContent = 'Nil';
      valTimestamp.textContent = 'N/A';
      return;
    }

    if (!match) {
      badge.className = 'badge badge-error text-white text-xs';
      badge.textContent = 'Không hợp lệ (Invalid UUID)';
      valVersion.textContent = '-';
      valVariant.textContent = '-';
      valTimestamp.textContent = '-';
      showToast('Chuỗi không phải là UUID chuẩn RFC 4122 / RFC 9562', 'danger');
      return;
    }

    badge.className = 'badge badge-success text-white text-xs';
    badge.textContent = 'Hợp lệ (Valid RFC UUID)';

    const versionNibble = parseInt(match[1], 16);
    let versionDesc = `Phiên bản ${versionNibble}`;
    if (versionNibble === 4) versionDesc += ' (Random - Ngẫu nhiên mã hóa)';
    else if (versionNibble === 7) versionDesc += ' (Time-ordered - Sắp xếp theo thời gian)';
    else if (versionNibble === 1) versionDesc += ' (Timestamp + Node MAC)';

    valVersion.textContent = versionDesc;
    valVariant.textContent = 'RFC 4122 / DCE 1.1';

    // Extract Timestamp for v7 and v1
    if (versionNibble === 7) {
      // First 48 bits (12 hex digits) are unix ms
      const hexMs = clean.replace(/-/g, '').slice(0, 12);
      const ms = parseInt(hexMs, 16);
      const date = new Date(ms);
      valTimestamp.textContent = `${date.toISOString()} (Giờ địa phương: ${date.toLocaleString('vi-VN')})`;
    } else if (versionNibble === 1) {
      const parts = clean.split('-');
      const timeLow = parts[0];
      const timeMid = parts[1];
      const timeHi = parts[2].slice(1); // strip version nibble
      const hex100ns = timeHi + timeMid + timeLow;
      const count100ns = BigInt('0x' + hex100ns);
      const unixMs = Number((count100ns - 122192928000000000n) / 10000n);
      const date = new Date(unixMs);
      valTimestamp.textContent = `${date.toISOString()} (Giờ địa phương: ${date.toLocaleString('vi-VN')})`;
    } else {
      valTimestamp.textContent = 'UUID v4 là số ngẫu nhiên thuần túy, không chứa timestamp.';
    }

    showToast('Đã phân tích thông tin UUID thành công!', 'success');
  }
};
