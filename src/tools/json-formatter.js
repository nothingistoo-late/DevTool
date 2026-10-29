import { Icons } from '../core/icons.js';
import { showToast, escapeHtml } from '../core/toast.js';

export const JsonFormatterTool = {
  id: 'json-formatter',
  title: 'JSON Formatter & Validator',
  shortTitle: 'JSON Formatter',
  category: 'Formatters & Parsers',
  icon: Icons.json,
  badge: 'Popular',
  description: 'Format, validate, repair, sort, and inspect JSON in colorized code or interactive tree view.',
  tags: ['json', 'format', 'beautify', 'minify', 'validate', 'tree', 'linter', 'parser', 'repair'],

  state: {
    indent: 2,
    activeTab: 'code', // 'code' | 'tree' | 'minified'
    parsedData: null,
    validationError: null,
    sortOrder: 'none', // 'none' | 'asc' | 'desc'
  },

  init(container) {
    this.container = container;
    this.render();
    this.bindEvents();
    this.loadInitialData();
  },

  destroy() {},

  render() {
    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full overflow-hidden">
        
        <!-- Left Panel: Input Editor -->
        <div class="card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
          <!-- Header -->
          <div class="px-3 py-2 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between gap-2 shrink-0">
            <div class="flex items-center gap-1.5 font-semibold text-xs text-base-content">
              <span class="text-primary">${Icons.code}</span>
              <span>Input JSON</span>
            </div>
            <div class="flex items-center gap-1">
              <button class="btn btn-ghost btn-xs gap-1" id="btn-load-sample" title="Nạp mẫu JSON">
                ${Icons.sparkles} <span class="hidden sm:inline text-xs">Mẫu</span>
              </button>
              <label class="btn btn-ghost btn-xs gap-1 cursor-pointer" title="Tải file .json">
                ${Icons.upload} <span class="hidden sm:inline text-xs">File</span>
                <input type="file" id="input-json-file" accept=".json,.txt" class="hidden" />
              </label>
              <button class="btn btn-ghost btn-xs btn-square text-error" id="btn-clear-input" title="Xóa nội dung">
                ${Icons.trash}
              </button>
            </div>
          </div>

          <!-- Input Code Editor Area -->
          <div class="flex-1 flex overflow-hidden font-code text-xs bg-base-300/30">
            <div id="input-line-numbers" class="w-10 shrink-0 py-2.5 text-right pr-2 select-none text-base-content/30 border-r border-base-content/10 overflow-hidden leading-5">1</div>
            <textarea id="json-input" class="flex-1 h-full w-full p-2.5 bg-transparent outline-none resize-none overflow-auto leading-5 text-base-content" placeholder="Dán hoặc gõ mã JSON vào đây... (nhấn nút 'Mẫu' để xem thử)" spellcheck="false"></textarea>
          </div>

          <!-- Error Alert Banner (Hidden by default) -->
          <div id="json-error-banner" class="alert alert-error text-white py-2 px-3 text-xs rounded-none border-x-0 border-b-0 hidden items-center justify-between shrink-0">
            <div class="flex items-center gap-2 truncate">
              <span>${Icons.alertCircle}</span>
              <span id="json-error-message" class="truncate">Cú pháp JSON không hợp lệ</span>
            </div>
            <button class="btn btn-warning btn-xs shrink-0 text-[11px] gap-1 font-bold text-base-content" id="btn-fix-json" title="Tự động sửa lỗi phổ biến">
              ${Icons.wrench} Auto Fix
            </button>
          </div>

          <!-- Left Footer Stats & Action -->
          <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 flex items-center justify-between text-xs shrink-0">
            <div class="flex items-center gap-2">
              <span id="json-valid-badge" class="badge badge-sm badge-ghost text-[10px]">Chưa có dữ liệu</span>
              <span id="input-size-stat" class="text-[11px] text-base-content/60">0 B</span>
            </div>
            <button class="btn btn-primary btn-xs text-xs gap-1 font-medium" id="btn-format-trigger" title="Định dạng JSON (Ctrl+Enter)">
              ${Icons.sparkles} Format JSON
            </button>
          </div>
        </div>

        <!-- Right Panel: Output & Tree View -->
        <div class="card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
          <!-- Header with Tabs and Output Actions -->
          <div class="px-3 py-1.5 bg-base-200/50 border-b border-base-content/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <!-- Tabs -->
            <div class="tabs tabs-boxed bg-base-300/60 p-0.5 gap-0.5" id="output-tab-group">
              <button class="tab tab-xs tab-active font-medium text-xs" data-tab="code">Formatted</button>
              <button class="tab tab-xs font-medium text-xs" data-tab="tree">Tree View</button>
              <button class="tab tab-xs font-medium text-xs" data-tab="minified">Minified</button>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-1 ml-auto">
              <!-- Indent Join -->
              <div class="join hidden sm:inline-flex" id="indent-selector">
                <button class="join-item btn btn-xs btn-active text-[11px]" data-indent="2">2s</button>
                <button class="join-item btn btn-xs btn-ghost text-[11px]" data-indent="4">4s</button>
                <button class="join-item btn btn-xs btn-ghost text-[11px]" data-indent="tab">Tab</button>
              </div>

              <!-- Sort Keys -->
              <button class="btn btn-ghost btn-xs gap-1" id="btn-sort-keys" title="Sắp xếp keys A-Z">
                ${Icons.sort} <span class="hidden md:inline text-xs">A-Z</span>
              </button>

              <!-- Copy Output -->
              <button class="btn btn-ghost btn-xs gap-1" id="btn-copy-output" title="Sao chép kết quả">
                ${Icons.copy} <span class="hidden sm:inline text-xs">Copy</span>
              </button>

              <!-- Download -->
              <button class="btn btn-ghost btn-xs gap-1" id="btn-download-output" title="Tải về file .json">
                ${Icons.download} <span class="hidden sm:inline text-xs">Lưu</span>
              </button>
            </div>
          </div>

          <!-- Tab 1: Formatted Colorized Code -->
          <div id="tab-content-code" class="flex-1 flex overflow-hidden font-code text-xs bg-base-300/30">
            <div id="output-line-numbers" class="w-10 shrink-0 py-2.5 text-right pr-2 select-none text-base-content/30 border-r border-base-content/10 overflow-hidden leading-5">1</div>
            <div id="json-output-viewer" class="flex-1 p-2.5 overflow-auto leading-5 whitespace-pre break-all select-text text-base-content"></div>
          </div>

          <!-- Tab 2: Interactive Tree View -->
          <div id="tab-content-tree" class="flex-1 overflow-auto p-3 font-code text-xs bg-base-300/30 hidden">
            <div class="mb-2 flex items-center justify-between pb-2 border-b border-base-content/10">
              <div class="flex items-center gap-1.5">
                <button class="btn btn-ghost btn-xs" id="btn-tree-expand-all">Mở rộng tất cả</button>
                <button class="btn btn-ghost btn-xs" id="btn-tree-collapse-all">Thu gọn tất cả</button>
              </div>
              <span class="text-[10px] text-base-content/50">Click để đóng/mở node</span>
            </div>
            <div id="json-tree-mount"></div>
          </div>

          <!-- Tab 3: Minified View -->
          <div id="tab-content-minified" class="flex-1 p-2.5 font-code text-xs bg-base-300/30 hidden">
            <textarea id="json-output-minified" class="w-full h-full p-2 bg-transparent outline-none resize-none font-code text-xs break-all leading-5 text-base-content" readonly spellcheck="false" placeholder="Kết quả minified..."></textarea>
          </div>

          <!-- Right Footer Stats -->
          <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 flex items-center justify-between text-[11px] text-base-content/60 shrink-0">
            <div class="flex items-center gap-3">
              <span id="output-keys-stat">Keys: 0</span>
              <span id="output-depth-stat">Depth: 0</span>
              <span id="output-compression-stat">Size: 0 B</span>
            </div>
            <span id="output-lines-stat">Lines: 0</span>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const textarea = this.container.querySelector('#json-input');
    const lineNums = this.container.querySelector('#input-line-numbers');

    const updateInputLineNumbers = () => {
      const lines = textarea.value.split('\n').length;
      let nums = '';
      for (let i = 1; i <= lines; i++) {
        nums += i + '<br/>';
      }
      lineNums.innerHTML = nums || '1';
    };

    textarea.addEventListener('input', () => {
      updateInputLineNumbers();
      this.updateStats();
      this.parseAndFormat(false);
    });

    textarea.addEventListener('scroll', () => {
      lineNums.scrollTop = textarea.scrollTop;
    });

    // Indent selector
    const indentBtns = this.container.querySelectorAll('#indent-selector button');
    indentBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        indentBtns.forEach(b => {
          b.className = 'join-item btn btn-xs btn-ghost text-[11px]';
        });
        btn.className = 'join-item btn btn-xs btn-active text-[11px]';
        const val = btn.dataset.indent;
        this.state.indent = val === 'tab' ? '\t' : parseInt(val, 10);
        this.parseAndFormat(true);
      });
    });

    // Tab switching
    const tabBtns = this.container.querySelectorAll('#output-tab-group button');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        this.switchTab(btn.dataset.tab);
      });
    });

    // Buttons
    this.container.querySelector('#btn-format-trigger').addEventListener('click', () => {
      this.parseAndFormat(true);
    });

    this.container.querySelector('#btn-load-sample').addEventListener('click', () => {
      this.loadSample();
    });

    this.container.querySelector('#btn-clear-input').addEventListener('click', () => {
      textarea.value = '';
      updateInputLineNumbers();
      this.clearOutput();
      showToast('Đã xóa nội dung', 'info');
    });

    this.container.querySelector('#btn-fix-json').addEventListener('click', () => {
      this.autoRepairJson();
    });

    this.container.querySelector('#btn-sort-keys').addEventListener('click', () => {
      this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
      const sortBtn = this.container.querySelector('#btn-sort-keys');
      sortBtn.innerHTML = this.state.sortOrder === 'asc' 
        ? `${Icons.sort} <span class="hidden md:inline text-xs">Z-A</span>` 
        : `${Icons.sort} <span class="hidden md:inline text-xs">A-Z</span>`;
      this.parseAndFormat(true);
    });

    this.container.querySelector('#btn-copy-output').addEventListener('click', () => {
      this.copyCurrentOutput();
    });

    this.container.querySelector('#btn-download-output').addEventListener('click', () => {
      this.downloadJsonFile();
    });

    // File upload
    const fileInput = this.container.querySelector('#input-json-file');
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        textarea.value = event.target.result;
        updateInputLineNumbers();
        this.parseAndFormat(true);
        showToast(`Đã mở file ${file.name}`, 'success');
      };
      reader.readAsText(file);
    });

    // Tree controls
    this.container.querySelector('#btn-tree-expand-all').addEventListener('click', () => {
      this.expandAllTree(true);
    });
    this.container.querySelector('#btn-tree-collapse-all').addEventListener('click', () => {
      this.expandAllTree(false);
    });

    // Keyboard shortcut Ctrl+Enter
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.parseAndFormat(true);
      }
    });
  },

  loadInitialData() {
    const saved = localStorage.getItem('devpulse_json_input');
    const textarea = this.container.querySelector('#json-input');
    if (saved) {
      textarea.value = saved;
      this.parseAndFormat(false);
    } else {
      this.loadSample();
    }
  },

  loadSample() {
    const sample = {
      project: "DevPulse Toolbox",
      version: "1.0.0",
      status: "active",
      author: {
        name: "Developer Pair",
        github: "https://github.com",
        verified: true,
        roles: ["admin", "developer", "architect"]
      },
      stats: {
        totalTools: 2,
        activeSessions: 42,
        loadTimeMs: 12.8,
        uptimePercentage: 99.98
      },
      features: [
        { id: "json-formatter", name: "JSON Formatter", ready: true, level: "advanced" },
        { id: "text-diff", name: "Text Diff & Comparison", ready: true, level: "word-level-highlight" }
      ],
      metadata: null
    };

    const textarea = this.container.querySelector('#json-input');
    textarea.value = JSON.stringify(sample, null, 2);
    this.container.querySelector('#input-line-numbers').innerHTML = 
      textarea.value.split('\n').map((_, i) => i + 1).join('<br/>');
    this.parseAndFormat(false);
    showToast('Đã nạp JSON mẫu', 'success');
  },

  switchTab(tab) {
    this.state.activeTab = tab;
    const tabCode = this.container.querySelector('#tab-content-code');
    const tabTree = this.container.querySelector('#tab-content-tree');
    const tabMin = this.container.querySelector('#tab-content-minified');

    if (tab === 'code') {
      tabCode.classList.remove('hidden');
      tabCode.classList.add('flex');
      tabTree.classList.add('hidden');
      tabMin.classList.add('hidden');
    } else if (tab === 'tree') {
      tabCode.classList.add('hidden');
      tabCode.classList.remove('flex');
      tabTree.classList.remove('hidden');
      tabMin.classList.add('hidden');
    } else {
      tabCode.classList.add('hidden');
      tabCode.classList.remove('flex');
      tabTree.classList.add('hidden');
      tabMin.classList.remove('hidden');
    }
  },

  parseAndFormat(notifySuccess = false) {
    const raw = this.container.querySelector('#json-input').value.trim();
    const errorBanner = this.container.querySelector('#json-error-banner');
    const errorMsg = this.container.querySelector('#json-error-message');
    const validBadge = this.container.querySelector('#json-valid-badge');

    if (!raw) {
      this.clearOutput();
      validBadge.className = 'badge badge-sm badge-ghost text-[10px]';
      validBadge.textContent = 'Chưa có dữ liệu';
      errorBanner.classList.add('hidden');
      errorBanner.classList.remove('flex');
      return;
    }

    localStorage.setItem('devpulse_json_input', raw);

    try {
      let data = JSON.parse(raw);

      if (this.state.sortOrder !== 'none') {
        data = this.sortObjectKeys(data, this.state.sortOrder === 'asc');
      }

      this.state.parsedData = data;
      this.state.validationError = null;

      validBadge.className = 'badge badge-sm badge-success text-white text-[10px]';
      validBadge.innerHTML = `${Icons.check} JSON Hợp lệ`;
      errorBanner.classList.add('hidden');
      errorBanner.classList.remove('flex');

      const formatted = JSON.stringify(data, null, this.state.indent);
      this.renderFormattedCode(formatted);

      const minified = JSON.stringify(data);
      this.container.querySelector('#json-output-minified').value = minified;

      this.renderTreeView(data);
      this.updateDetailedStats(raw, formatted, minified, data);

      if (notifySuccess) {
        showToast('JSON đã được định dạng chuẩn xác!', 'success');
      }
    } catch (err) {
      this.state.parsedData = null;
      this.state.validationError = err;

      validBadge.className = 'badge badge-sm badge-error text-white text-[10px]';
      validBadge.innerHTML = `${Icons.alertCircle} Cú pháp lỗi`;
      errorBanner.classList.remove('hidden');
      errorBanner.classList.add('flex');

      let message = err.message;
      const match = message.match(/at position (\d+)/);
      if (match) {
        const pos = parseInt(match[1], 10);
        const upToError = raw.substring(0, pos);
        const line = upToError.split('\n').length;
        const col = pos - upToError.lastIndexOf('\n');
        message += ` (Dòng ${line}, Cột ${col})`;
      }
      errorMsg.textContent = message;

      if (notifySuccess) {
        showToast('JSON bị lỗi cú pháp! Nhấn Auto Fix để thử sửa.', 'danger');
      }
    }
  },

  sortObjectKeys(obj, asc = true) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item, asc));
    } else if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj).sort((a, b) => {
        return asc ? a.localeCompare(b) : b.localeCompare(a);
      });
      const sorted = {};
      for (const k of keys) {
        sorted[k] = this.sortObjectKeys(obj[k], asc);
      }
      return sorted;
    }
    return obj;
  },

  autoRepairJson() {
    let str = this.container.querySelector('#json-input').value;
    if (!str.trim()) return;

    try {
      str = str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1');
      str = str.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
      str = str.replace(/([{\[,]\s*)([a-zA-Z0-9_$-]+)\s*:/g, '$1"$2":');
      str = str.replace(/,\s*([}\]])/g, '$1');
      str = str.replace(/:\s*undefined/g, ': null');
      str = str.replace(/:\s*NaN/g, ': null');

      JSON.parse(str);

      const textarea = this.container.querySelector('#json-input');
      textarea.value = str;
      this.container.querySelector('#input-line-numbers').innerHTML = 
        str.split('\n').map((_, i) => i + 1).join('<br/>');

      this.parseAndFormat(true);
      showToast('Đã tự động sửa các lỗi cú pháp JSON!', 'success');
    } catch {
      showToast('Không thể tự động sửa toàn bộ lỗi. Vui lòng kiểm tra lại.', 'danger');
    }
  },

  renderFormattedCode(formatted) {
    const viewer = this.container.querySelector('#json-output-viewer');
    const outLineNums = this.container.querySelector('#output-line-numbers');

    const lines = formatted.split('\n');
    let lineNumsHtml = '';
    for (let i = 1; i <= lines.length; i++) {
      lineNumsHtml += i + '<br/>';
    }
    outLineNums.innerHTML = lineNumsHtml;

    const highlightedHtml = this.syntaxHighlight(formatted);
    viewer.innerHTML = highlightedHtml;
  },

  syntaxHighlight(json) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
          const keyText = match.slice(0, -1);
          return `<span class="${cls}">${escapeHtml(keyText)}</span><span class="json-punct">:</span>`;
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${escapeHtml(match)}</span>`;
    });
  },

  renderTreeView(data) {
    const mount = this.container.querySelector('#json-tree-mount');
    mount.innerHTML = '';
    mount.appendChild(this.buildTreeNode(data, 'root', ''));
  },

  buildTreeNode(value, key, path) {
    const nodeEl = document.createElement('div');
    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);

    nodeEl.className = 'tree-node';

    const rowEl = document.createElement('div');
    rowEl.className = 'tree-row';

    const currentPath = path ? (isArray || typeof key === 'number' ? `${path}[${key}]` : `${path}.${key}`) : key;

    if (isObject) {
      const keys = Object.keys(value);
      const count = keys.length;
      const typeLabel = isArray ? `[${count}]` : `{${count}}`;

      rowEl.innerHTML = `
        <span class="tree-toggle text-base-content/50" data-toggle="true">▼</span>
        <span class="json-key font-semibold">${escapeHtml(key)}</span>
        <span class="json-punct">:</span>
        <span class="badge badge-xs badge-ghost font-mono ml-1 text-[10px]">${typeLabel}</span>
        <button class="btn btn-ghost btn-xs text-[10px] ml-auto opacity-0 hover:opacity-100 tree-copy-btn" data-path="${escapeHtml(currentPath)}" title="Copy Path">Path</button>
      `;

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';

      for (const k of keys) {
        childrenContainer.appendChild(this.buildTreeNode(value[k], k, currentPath));
      }

      nodeEl.appendChild(rowEl);
      nodeEl.appendChild(childrenContainer);

      const toggle = rowEl.querySelector('.tree-toggle');
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = toggle.classList.toggle('collapsed');
        childrenContainer.style.display = isCollapsed ? 'none' : 'block';
      });
    } else {
      let valClass = 'json-string';
      let displayVal = JSON.stringify(value);
      if (typeof value === 'number') valClass = 'json-number';
      else if (typeof value === 'boolean') valClass = 'json-boolean';
      else if (value === null) valClass = 'json-null';

      rowEl.innerHTML = `
        <span class="tree-toggle invisible">•</span>
        <span class="json-key font-semibold">${escapeHtml(key)}</span>
        <span class="json-punct">:</span>
        <span class="${valClass} ml-1 break-all">${escapeHtml(displayVal)}</span>
        <button class="btn btn-ghost btn-xs text-[10px] ml-auto opacity-0 hover:opacity-100 tree-copy-btn" data-path="${escapeHtml(currentPath)}" title="Copy Path">Path</button>
      `;

      nodeEl.appendChild(rowEl);
    }

    const copyBtn = rowEl.querySelector('.tree-copy-btn');
    if (copyBtn) {
      rowEl.addEventListener('mouseenter', () => copyBtn.classList.remove('opacity-0'));
      rowEl.addEventListener('mouseleave', () => copyBtn.classList.add('opacity-0'));
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(copyBtn.dataset.path);
        showToast(`Đã sao chép đường dẫn: ${copyBtn.dataset.path}`, 'success');
      });
    }

    return nodeEl;
  },

  expandAllTree(expand = true) {
    const toggles = this.container.querySelectorAll('.tree-toggle:not(.invisible)');
    const containers = this.container.querySelectorAll('.tree-children');

    toggles.forEach(t => {
      if (expand) t.classList.remove('collapsed');
      else t.classList.add('collapsed');
    });

    containers.forEach(c => {
      c.style.display = expand ? 'block' : 'none';
    });
  },

  updateDetailedStats(raw, formatted, minified, data) {
    const rawBytes = new Blob([raw]).size;
    const minBytes = new Blob([minified]).size;

    this.container.querySelector('#input-size-stat').textContent = this.formatBytes(rawBytes);
    this.container.querySelector('#output-lines-stat').textContent = `Lines: ${formatted.split('\n').length}`;

    let totalKeys = 0;
    let maxDepth = 0;

    const traverse = (obj, depth = 1) => {
      if (depth > maxDepth) maxDepth = depth;
      if (obj !== null && typeof obj === 'object') {
        const keys = Object.keys(obj);
        totalKeys += keys.length;
        for (const k of keys) {
          traverse(obj[k], depth + 1);
        }
      }
    };
    traverse(data);

    this.container.querySelector('#output-keys-stat').textContent = `Keys: ${totalKeys}`;
    this.container.querySelector('#output-depth-stat').textContent = `Depth: ${maxDepth}`;

    const savings = rawBytes > 0 ? Math.round(((rawBytes - minBytes) / rawBytes) * 100) : 0;
    this.container.querySelector('#output-compression-stat').textContent = 
      `Min: ${this.formatBytes(minBytes)} (${savings > 0 ? `-${savings}%` : '0%'})`;
  },

  updateStats() {
    const raw = this.container.querySelector('#json-input').value;
    const bytes = new Blob([raw]).size;
    this.container.querySelector('#input-size-stat').textContent = this.formatBytes(bytes);
  },

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  clearOutput() {
    this.container.querySelector('#json-output-viewer').innerHTML = '';
    this.container.querySelector('#output-line-numbers').innerHTML = '1';
    this.container.querySelector('#json-output-minified').value = '';
    this.container.querySelector('#json-tree-mount').innerHTML = '';
    this.container.querySelector('#output-keys-stat').textContent = 'Keys: 0';
    this.container.querySelector('#output-depth-stat').textContent = 'Depth: 0';
    this.container.querySelector('#output-compression-stat').textContent = 'Size: 0 B';
    this.container.querySelector('#output-lines-stat').textContent = 'Lines: 0';
  },

  copyCurrentOutput() {
    let textToCopy = '';
    if (this.state.activeTab === 'minified') {
      textToCopy = this.container.querySelector('#json-output-minified').value;
    } else {
      if (this.state.parsedData) {
        textToCopy = JSON.stringify(this.state.parsedData, null, this.state.indent);
      }
    }

    if (!textToCopy) {
      showToast('Không có nội dung để sao chép', 'warning');
      return;
    }

    navigator.clipboard.writeText(textToCopy);
    showToast('Đã sao chép mã JSON vào clipboard!', 'success');
  },

  downloadJsonFile() {
    if (!this.state.parsedData) {
      showToast('Không có dữ liệu JSON hợp lệ để tải về', 'warning');
      return;
    }
    const jsonStr = JSON.stringify(this.state.parsedData, null, this.state.indent);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã bắt đầu tải file formatted.json', 'success');
  }
};
