import { Icons } from '../core/icons.js';
import { showToast, escapeHtml } from '../core/toast.js';

export const RegexTesterTool = {
  id: 'regex-tester',
  title: 'Regex Tester & Cheatsheet',
  shortTitle: 'Regex Tester',
  category: 'Text & Comparison',
  icon: Icons.regex,
  badge: 'Popular',
  description: 'Test regular expressions in real-time with capture groups, live match highlighting, string replacement, and cheatsheet.',
  tags: ['regex', 'regexp', 'regular expression', 'pattern', 'test', 'matcher', 'cheatsheet', 'replace'],

  state: {
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    flags: {
      g: true,
      i: true,
      m: true,
      s: false,
    },
    testText: `Xin chao! Vui long lien he qua email sau:
- Support team: support@devpulse.io hoac contact@gmail.com
- Admin: admin@company.vn (backup: tech-lead_99@sub.domain.org)
Khong phai email hop le: user@, @domain.com, test@domain`,
    replacePattern: '[$1] -> domain: $2',
    activeTab: 'matches', // 'matches' | 'replace' | 'cheatsheet'
  },

  init(container) {
    this.container = container;
    this.render();
    this.bindEvents();
    this.runRegexTest();
  },

  destroy() {},

  render() {
    this.container.innerHTML = `
      <div class="flex flex-col h-full gap-3 overflow-hidden">
        
        <!-- Top Regex Pattern Input Card -->
        <div class="bg-base-100 border border-base-content/10 rounded-xl p-3 flex flex-col gap-2 shrink-0 shadow-sm">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-base-content uppercase tracking-wider flex items-center gap-1.5">
              <span class="text-primary">${Icons.regex}</span> Regular Expression Pattern
            </span>

            <!-- Pre-built Presets Dropdown -->
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-xs btn-outline border-base-content/20 gap-1 font-medium">
                ${Icons.sparkles} <span>Mẫu Regex thông dụng</span>
              </div>
              <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-box w-64 text-xs border border-base-content/15 space-y-1 mt-1">
                <li class="menu-title text-[10px] uppercase font-bold text-base-content/50">Chọn mẫu nhanh</li>
                <li><button class="btn-preset" data-preset="email">📧 Địa chỉ Email</button></li>
                <li><button class="btn-preset" data-preset="url">🌐 URL / Web Link</button></li>
                <li><button class="btn-preset" data-preset="phone">📱 Số điện thoại VN</button></li>
                <li><button class="btn-preset" data-preset="ipv4">🖥️ Địa chỉ IPv4</button></li>
                <li><button class="btn-preset" data-preset="uuid">🔑 UUID / GUID</button></li>
                <li><button class="btn-preset" data-preset="date">📅 Ngày YYYY-MM-DD</button></li>
                <li><button class="btn-preset" data-preset="hex">🎨 Mã màu Hex (#fff)</button></li>
              </ul>
            </div>
          </div>

          <!-- Pattern Input Row with / and Flags -->
          <div class="flex items-center gap-2">
            <span class="text-lg font-mono font-bold text-primary select-none">/</span>
            <input type="text" id="regex-pattern-input" class="input input-sm input-bordered flex-1 font-code text-xs focus:input-primary bg-base-200/50" value="${escapeHtml(this.state.pattern)}" placeholder="Nhập biểu thức chính quy (vd: [a-z]+)..." spellcheck="false" />
            <span class="text-lg font-mono font-bold text-primary select-none">/</span>

            <!-- Flags Checkboxes / Buttons -->
            <div class="join border border-base-content/10 bg-base-200/50 rounded-lg p-0.5">
              <button class="join-item btn btn-xs ${this.state.flags.g ? 'btn-primary' : 'btn-ghost'} font-mono" data-flag="g" title="Global (tìm tất cả)">g</button>
              <button class="join-item btn btn-xs ${this.state.flags.i ? 'btn-primary' : 'btn-ghost'} font-mono" data-flag="i" title="Case insensitive (không phân biệt hoa/thường)">i</button>
              <button class="join-item btn btn-xs ${this.state.flags.m ? 'btn-primary' : 'btn-ghost'} font-mono" data-flag="m" title="Multiline (nhiều dòng)">m</button>
              <button class="join-item btn btn-xs ${this.state.flags.s ? 'btn-primary' : 'btn-ghost'} font-mono" data-flag="s" title="DotAll (dấu . match cả ký tự xuống dòng)">s</button>
            </div>
          </div>

          <!-- Regex Compile Error Banner (hidden by default) -->
          <div id="regex-error-msg" class="text-error text-xs font-mono hidden flex items-center gap-1.5 pt-1">
            ${Icons.alertCircle} <span id="regex-error-text"></span>
          </div>
        </div>

        <!-- Main Grid: Test String & Matches / Cheatsheet -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
          
          <!-- Left Column: Test String Input & Highlight Overlay -->
          <div class="lg:col-span-6 card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
            <div class="px-3 py-2 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
              <span class="font-semibold text-xs text-base-content">Văn bản kiểm thử (Test String)</span>
              <button class="btn btn-ghost btn-xs btn-square text-error" id="btn-clear-test-text" title="Xóa văn bản">
                ${Icons.trash}
              </button>
            </div>

            <!-- Test String Editor -->
            <div class="flex-1 p-3 bg-base-300/30 overflow-auto">
              <textarea id="regex-test-input" class="w-full h-full p-2 bg-transparent outline-none resize-none font-code text-xs leading-5 text-base-content placeholder:text-base-content/40" placeholder="Nhập chuỗi văn bản cần kiểm tra regex vào đây..." spellcheck="false">${escapeHtml(this.state.testText)}</textarea>
            </div>

            <!-- Footer Stats -->
            <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 flex items-center justify-between text-[11px] text-base-content/60 shrink-0">
              <span id="match-count-badge" class="badge badge-sm badge-success text-white font-mono text-[10px]">0 Matches</span>
              <span id="test-len-stat">0 ký tự</span>
            </div>
          </div>

          <!-- Right Column: Results, Replace & Cheatsheet Tabs -->
          <div class="lg:col-span-6 card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
            <!-- Tabs Header -->
            <div class="px-3 py-1.5 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
              <div class="tabs tabs-boxed bg-base-300/60 p-0.5 gap-0.5" id="regex-result-tabs">
                <button class="tab tab-xs tab-active font-medium text-xs" data-tab="matches">Matches & Groups</button>
                <button class="tab tab-xs font-medium text-xs" data-tab="replace">Thay thế (Replace)</button>
                <button class="tab tab-xs font-medium text-xs" data-tab="cheatsheet">Bảng tra cứu (Cheatsheet)</button>
              </div>
            </div>

            <!-- Tab 1: Matches & Capture Groups List -->
            <div id="tab-matches-content" class="flex-1 overflow-auto p-3 space-y-2 text-xs bg-base-300/20">
              <div id="matches-list-mount" class="space-y-2 font-code"></div>
            </div>

            <!-- Tab 2: Replace String -->
            <div id="tab-replace-content" class="flex-1 flex flex-col p-3 gap-3 overflow-hidden hidden bg-base-300/20">
              <div>
                <label class="label p-0 pb-1 text-xs font-semibold text-base-content">Mẫu thay thế (Substitution pattern)</label>
                <input type="text" id="regex-replace-input" class="input input-sm input-bordered w-full font-code text-xs bg-base-100" value="${escapeHtml(this.state.replacePattern)}" placeholder="Dùng $1, $2 cho capture groups (vd: [$1])..." />
              </div>
              <div class="flex-1 flex flex-col min-h-0">
                <div class="flex items-center justify-between pb-1">
                  <label class="text-xs font-semibold text-base-content">Kết quả sau thay thế</label>
                  <button class="btn btn-ghost btn-xs text-xs gap-1" id="btn-copy-replaced">
                    ${Icons.copy} Copy
                  </button>
                </div>
                <div class="flex-1 p-3 bg-base-100 rounded-lg border border-base-content/10 font-code text-xs leading-5 overflow-auto whitespace-pre-wrap select-text text-base-content" id="regex-replace-output"></div>
              </div>
            </div>

            <!-- Tab 3: Cheatsheet Reference Table -->
            <div id="tab-cheatsheet-content" class="flex-1 overflow-auto p-3 text-xs bg-base-300/20 hidden space-y-3">
              <div>
                <h3 class="font-bold text-xs uppercase text-primary mb-1.5">Ký tự đặc biệt thông dụng</h3>
                <div class="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">.</code> : Bất kỳ ký tự nào</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">\\d</code> : Chữ số [0-9]</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">\\w</code> : Ký tự chữ/số/gạch dưới</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">\\s</code> : Khoảng trắng, tab, xuống dòng</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">^</code> : Bắt đầu chuỗi/dòng</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">$</code> : Kết thúc chuỗi/dòng</div>
                </div>
              </div>

              <div>
                <h3 class="font-bold text-xs uppercase text-primary mb-1.5">Số lượng lặp lại (Quantifiers)</h3>
                <div class="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">*</code> : 0 hoặc nhiều lần</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">+</code> : 1 hoặc nhiều lần</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">?</code> : 0 hoặc 1 lần (optional)</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">{n,m}</code> : Từ n đến m lần</div>
                </div>
              </div>

              <div>
                <h3 class="font-bold text-xs uppercase text-primary mb-1.5">Nhóm & Điều kiện (Groups & Lookaround)</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">(abc)</code> : Capture group</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">(?:abc)</code> : Non-capturing group</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">(?=abc)</code> : Positive Lookahead</div>
                  <div class="p-1.5 rounded bg-base-100 border border-base-content/5"><code class="text-primary font-bold">(?!abc)</code> : Negative Lookahead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const patternInput = this.container.querySelector('#regex-pattern-input');
    const testInput = this.container.querySelector('#regex-test-input');
    const replaceInput = this.container.querySelector('#regex-replace-input');

    patternInput.addEventListener('input', () => {
      this.state.pattern = patternInput.value;
      this.runRegexTest();
    });

    testInput.addEventListener('input', () => {
      this.state.testText = testInput.value;
      this.runRegexTest();
    });

    replaceInput.addEventListener('input', () => {
      this.state.replacePattern = replaceInput.value;
      this.runReplacement();
    });

    // Flags buttons
    this.container.querySelectorAll('[data-flag]').forEach(btn => {
      btn.addEventListener('click', () => {
        const flag = btn.dataset.flag;
        this.state.flags[flag] = !this.state.flags[flag];
        if (this.state.flags[flag]) {
          btn.className = 'join-item btn btn-xs btn-primary font-mono';
        } else {
          btn.className = 'join-item btn btn-xs btn-ghost font-mono';
        }
        this.runRegexTest();
      });
    });

    // Tabs
    const tabBtns = this.container.querySelectorAll('#regex-result-tabs button');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        this.switchTab(btn.dataset.tab);
      });
    });

    // Clear test text
    this.container.querySelector('#btn-clear-test-text').addEventListener('click', () => {
      testInput.value = '';
      this.state.testText = '';
      this.runRegexTest();
      showToast('Đã xóa văn bản test', 'info');
    });

    // Copy replaced
    this.container.querySelector('#btn-copy-replaced').addEventListener('click', () => {
      const replacedText = this.container.querySelector('#regex-replace-output').textContent;
      if (!replacedText) return;
      navigator.clipboard.writeText(replacedText);
      showToast('Đã sao chép chuỗi sau thay thế!', 'success');
    });

    // Preset dropdown clicks
    this.container.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadPreset(btn.dataset.preset);
      });
    });
  },

  switchTab(tab) {
    this.state.activeTab = tab;
    const tabMatches = this.container.querySelector('#tab-matches-content');
    const tabReplace = this.container.querySelector('#tab-replace-content');
    const tabCheat = this.container.querySelector('#tab-cheatsheet-content');

    tabMatches.classList.toggle('hidden', tab !== 'matches');
    tabReplace.classList.toggle('hidden', tab !== 'replace');
    tabCheat.classList.toggle('hidden', tab !== 'cheatsheet');

    if (tab === 'replace') {
      this.runReplacement();
    }
  },

  loadPreset(preset) {
    const patternInput = this.container.querySelector('#regex-pattern-input');
    const testInput = this.container.querySelector('#regex-test-input');

    if (preset === 'email') {
      this.state.pattern = '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})';
      this.state.testText = 'Support: support@devpulse.io, Admin: admin@company.vn, Test: test.email+alias@gmail.com';
    } else if (preset === 'url') {
      this.state.pattern = 'https?:\\/\\/([\\w.-]+)(:[0-9]+)?(\\/[\\w._~:/?#[\\]@!$&\'()*+,;=-]*)?';
      this.state.testText = 'Truy cập https://github.com/ hoặc http://localhost:5173/api/v1?token=123 va https://devpulse.io';
    } else if (preset === 'phone') {
      this.state.pattern = '(0[3|5|7|8|9])[0-9]{8}';
      this.state.testText = 'Hotline: 0912345678 hoac 0387654321, sdt ban: 02438888888 (khong match)';
    } else if (preset === 'ipv4') {
      this.state.pattern = '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b';
      this.state.testText = 'Localhost: 127.0.0.1, Gateway: 192.168.1.1, DNS: 8.8.8.8, Invalid: 999.999.1.1';
    } else if (preset === 'uuid') {
      this.state.pattern = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
      this.state.testText = 'UUIDs: 018e69d7-84a1-79b8-a764-a690e50f3b0c va f47ac10b-58cc-4372-a567-0e02b2c3d479';
    } else if (preset === 'date') {
      this.state.pattern = '\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\\b';
      this.state.testText = 'Ngay sinh: 1995-12-25, Ngay tao du an: 2026-10-29, Ngay loi: 2026-13-40';
    } else if (preset === 'hex') {
      this.state.pattern = '#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b';
      this.state.testText = 'Primary: #38bdf8, Accent: #818cf8, White: #fff, Black: #000000, Invalid: #12345';
    }

    patternInput.value = this.state.pattern;
    testInput.value = this.state.testText;
    this.runRegexTest();
    showToast(`Đã nạp mẫu Regex ${preset}`, 'success');
  },

  runRegexTest() {
    const errorBanner = this.container.querySelector('#regex-error-msg');
    const errorText = this.container.querySelector('#regex-error-text');
    const mountList = this.container.querySelector('#matches-list-mount');
    const countBadge = this.container.querySelector('#match-count-badge');
    const testLenStat = this.container.querySelector('#test-len-stat');

    testLenStat.textContent = `${this.state.testText.length} ký tự`;

    if (!this.state.pattern) {
      errorBanner.classList.add('hidden');
      mountList.innerHTML = `<div class="p-4 text-center text-xs text-base-content/40">Nhập biểu thức regex để bắt đầu</div>`;
      countBadge.textContent = '0 Matches';
      return;
    }

    let flagsStr = '';
    if (this.state.flags.g) flagsStr += 'g';
    if (this.state.flags.i) flagsStr += 'i';
    if (this.state.flags.m) flagsStr += 'm';
    if (this.state.flags.s) flagsStr += 's';

    let regex = null;
    try {
      regex = new RegExp(this.state.pattern, flagsStr);
      errorBanner.classList.add('hidden');
    } catch (err) {
      errorBanner.classList.remove('hidden');
      errorText.textContent = err.message;
      mountList.innerHTML = `<div class="p-4 text-center text-xs text-error">${escapeHtml(err.message)}</div>`;
      countBadge.textContent = 'Lỗi cú pháp';
      countBadge.className = 'badge badge-sm badge-error text-white font-mono text-[10px]';
      return;
    }

    // Find all matches
    const matches = [];
    const text = this.state.testText;

    if (this.state.flags.g) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          full: match[0],
          index: match.index,
          groups: match.slice(1),
        });
        if (match[0].length === 0) {
          regex.lastIndex++; // prevent infinite loop on empty matches
        }
      }
    } else {
      const match = regex.exec(text);
      if (match) {
        matches.push({
          full: match[0],
          index: match.index,
          groups: match.slice(1),
        });
      }
    }

    countBadge.textContent = `${matches.length} Matches`;
    countBadge.className = matches.length > 0 
      ? 'badge badge-sm badge-success text-white font-mono text-[10px]' 
      : 'badge badge-sm badge-ghost font-mono text-[10px]';

    if (matches.length === 0) {
      mountList.innerHTML = `<div class="p-6 text-center text-xs text-base-content/50">Không tìm thấy kết quả phù hợp nào trong văn bản.</div>`;
      return;
    }

    // Render matches cards
    let html = '';
    matches.forEach((m, idx) => {
      html += `
        <div class="p-2.5 rounded-lg bg-base-100 border border-base-content/10 shadow-sm space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="badge badge-xs badge-primary font-mono text-[10px]">Match #${idx + 1}</span>
            <span class="text-base-content/40 text-[10px] font-mono">Index: [${m.index}..${m.index + m.full.length}]</span>
          </div>
          <div class="p-1.5 rounded bg-base-200/60 font-mono text-xs break-all text-primary font-semibold">
            ${escapeHtml(m.full)}
          </div>
      `;

      if (m.groups && m.groups.length > 0) {
        html += `<div class="space-y-1 pt-1 border-t border-base-content/5">`;
        m.groups.forEach((grp, gIdx) => {
          html += `
            <div class="flex items-center gap-2 text-[11px] font-mono">
              <span class="text-base-content/50 w-16 shrink-0">Group $${gIdx + 1}:</span>
              <span class="text-accent truncate">${grp !== undefined ? escapeHtml(grp) : '<em class="text-base-content/30">undefined</em>'}</span>
            </div>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
    });

    mountList.innerHTML = html;

    if (this.state.activeTab === 'replace') {
      this.runReplacement();
    }
  },

  runReplacement() {
    const replaceOutput = this.container.querySelector('#regex-replace-output');
    if (!replaceOutput) return;

    let flagsStr = '';
    if (this.state.flags.g) flagsStr += 'g';
    if (this.state.flags.i) flagsStr += 'i';
    if (this.state.flags.m) flagsStr += 'm';
    if (this.state.flags.s) flagsStr += 's';

    try {
      const regex = new RegExp(this.state.pattern, flagsStr);
      const replaced = this.state.testText.replace(regex, this.state.replacePattern);
      replaceOutput.textContent = replaced;
    } catch {
      replaceOutput.textContent = 'Lỗi cú pháp biểu thức regex';
    }
  }
};
