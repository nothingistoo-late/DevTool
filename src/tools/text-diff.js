import * as Diff from 'diff';
import { Icons } from '../core/icons.js';
import { showToast, escapeHtml } from '../core/toast.js';

export const TextDiffTool = {
  id: 'text-diff',
  title: 'Text Diff & Comparison',
  shortTitle: 'Text Diff',
  category: 'Text & Comparison',
  icon: Icons.diff,
  badge: 'Highlight',
  description: 'Compare two text snippets side-by-side or unified with detailed word-level and character-level change highlighting.',
  tags: ['diff', 'compare', 'text', 'merge', 'changes', 'patch', 'highlight', 'revision', 'git'],

  state: {
    viewMode: 'split', // 'split' | 'unified'
    diffGranularity: 'word', // 'word' | 'char' | 'line'
    ignoreWhitespace: false,
    ignoreCase: false,
    currentDiffIndex: -1,
    diffBlocks: [],
    showInputs: true,
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
      <div class="flex flex-col h-full gap-3 overflow-hidden">
        
        <!-- Diff Toolbar: Compact, Responsive, Never Broken -->
        <div class="bg-base-100 border border-base-content/10 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-sm">
          
          <!-- Left Controls: View Mode & Granularity & Options -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- View Mode -->
            <div class="join" id="diff-view-group">
              <button class="join-item btn btn-xs sm:btn-sm btn-primary font-medium" data-view="split">Side-by-Side</button>
              <button class="join-item btn btn-xs sm:btn-sm btn-ghost font-medium" data-view="unified">Unified</button>
            </div>

            <!-- Granularity -->
            <div class="join" id="diff-granularity-group">
              <button class="join-item btn btn-xs sm:btn-sm btn-active font-medium" data-granularity="word" title="Highlight từng từ">Word</button>
              <button class="join-item btn btn-xs sm:btn-sm btn-ghost font-medium" data-granularity="char" title="Highlight từng ký tự">Char</button>
              <button class="join-item btn btn-xs sm:btn-sm btn-ghost font-medium" data-granularity="line" title="Highlight theo dòng">Line</button>
            </div>

            <!-- Settings Dropdown to save horizontal space on mobile -->
            <div class="dropdown dropdown-bottom">
              <div tabindex="0" role="button" class="btn btn-xs sm:btn-sm btn-outline border-base-content/20 gap-1" title="Tùy chọn so sánh">
                <span>⚙️</span>
                <span class="hidden sm:inline text-xs">Tùy chọn</span>
              </div>
              <ul tabindex="0" class="dropdown-content z-50 menu p-3 shadow-xl bg-base-100 rounded-box w-60 text-xs border border-base-content/15 space-y-2 mt-1">
                <li class="menu-title text-[10px] uppercase font-bold text-base-content/50 p-0">Bộ lọc nâng cao</li>
                <li>
                  <label class="label cursor-pointer p-0 flex justify-between">
                    <span class="text-xs">Bỏ qua khoảng trắng</span>
                    <input type="checkbox" id="diff-opt-whitespace" class="checkbox checkbox-xs checkbox-primary" />
                  </label>
                </li>
                <li>
                  <label class="label cursor-pointer p-0 flex justify-between">
                    <span class="text-xs">Bỏ qua hoa / thường</span>
                    <input type="checkbox" id="diff-opt-case" class="checkbox checkbox-xs checkbox-primary" />
                  </label>
                </li>
              </ul>
            </div>
          </div>

          <!-- Right Controls: Navigator, Actions, Toggle Inputs -->
          <div class="flex items-center gap-1.5 sm:gap-2 ml-auto flex-wrap">
            <!-- Navigator Prev / Next -->
            <div class="join">
              <button class="join-item btn btn-xs sm:btn-sm btn-ghost" id="btn-diff-prev" title="Điểm khác biệt trước (↑)">
                ${Icons.arrowUp}
              </button>
              <span id="diff-nav-counter" class="join-item btn btn-xs sm:btn-sm btn-ghost pointer-events-none font-mono text-[11px] px-2">0/0</span>
              <button class="join-item btn btn-xs sm:btn-sm btn-ghost" id="btn-diff-next" title="Điểm khác biệt sau (↓)">
                ${Icons.arrowDown}
              </button>
            </div>

            <div class="divider divider-horizontal my-1 mx-0 hidden sm:flex"></div>

            <!-- Swap sides -->
            <button class="btn btn-xs sm:btn-sm btn-ghost gap-1" id="btn-swap-diff" title="Đổi bên">
              ${Icons.swap}
              <span class="hidden md:inline text-xs">Đổi bên</span>
            </button>

            <!-- Sample -->
            <button class="btn btn-xs sm:btn-sm btn-ghost gap-1" id="btn-diff-sample" title="Nạp văn bản mẫu">
              ${Icons.sparkles}
              <span class="hidden md:inline text-xs">Mẫu</span>
            </button>

            <!-- Copy Patch -->
            <button class="btn btn-xs sm:btn-sm btn-ghost gap-1" id="btn-copy-patch" title="Sao chép Unified Patch">
              ${Icons.copy}
              <span class="hidden md:inline text-xs">Patch</span>
            </button>

            <!-- Toggle inputs collapse -->
            <button class="btn btn-xs sm:btn-sm btn-outline border-base-content/20 gap-1" id="btn-toggle-inputs" title="Ẩn/Hiện khung nhập dữ liệu">
              <span id="toggle-inputs-text" class="text-xs">Ẩn nhập liệu</span>
            </button>
          </div>
        </div>

        <!-- Input Editors Grid (Collapsible) -->
        <div id="diff-inputs-wrapper" class="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0 transition-all duration-300">
          
          <!-- Left: Original Text -->
          <div class="card bg-base-100 border border-base-content/10 shadow-sm overflow-hidden flex flex-col h-44 md:h-48">
            <div class="px-3 py-1.5 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
              <span class="badge badge-sm badge-error text-white text-[10px] font-semibold">Bản gốc (Original)</span>
              <div class="flex items-center gap-1">
                <label class="btn btn-ghost btn-xs text-xs gap-1 cursor-pointer" title="Mở file">
                  ${Icons.upload} File
                  <input type="file" id="diff-file-old" class="hidden" />
                </label>
                <button class="btn btn-ghost btn-xs btn-square text-error" id="btn-clear-old" title="Xóa">${Icons.trash}</button>
              </div>
            </div>
            <div class="flex-1 flex overflow-hidden font-code text-xs bg-base-300/40">
              <div id="diff-line-nums-old" class="w-9 shrink-0 py-2 text-right pr-2 select-none text-base-content/40 border-r border-base-content/10 overflow-hidden leading-5">1</div>
              <textarea id="diff-text-old" class="flex-1 h-full w-full p-2 bg-transparent outline-none resize-none overflow-auto leading-5 text-base-content" placeholder="Dán văn bản gốc vào đây..." spellcheck="false"></textarea>
            </div>
          </div>

          <!-- Right: Modified Text -->
          <div class="card bg-base-100 border border-base-content/10 shadow-sm overflow-hidden flex flex-col h-44 md:h-48">
            <div class="px-3 py-1.5 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
              <span class="badge badge-sm badge-success text-white text-[10px] font-semibold">Bản sửa đổi (Modified)</span>
              <div class="flex items-center gap-1">
                <label class="btn btn-ghost btn-xs text-xs gap-1 cursor-pointer" title="Mở file">
                  ${Icons.upload} File
                  <input type="file" id="diff-file-new" class="hidden" />
                </label>
                <button class="btn btn-ghost btn-xs btn-square text-error" id="btn-clear-new" title="Xóa">${Icons.trash}</button>
              </div>
            </div>
            <div class="flex-1 flex overflow-hidden font-code text-xs bg-base-300/40">
              <div id="diff-line-nums-new" class="w-9 shrink-0 py-2 text-right pr-2 select-none text-base-content/40 border-r border-base-content/10 overflow-hidden leading-5">1</div>
              <textarea id="diff-text-new" class="flex-1 h-full w-full p-2 bg-transparent outline-none resize-none overflow-auto leading-5 text-base-content" placeholder="Dán văn bản mới/chỉnh sửa vào đây..." spellcheck="false"></textarea>
            </div>
          </div>
        </div>

        <!-- Diff Result Viewer Card -->
        <div class="card bg-base-100 border border-base-content/10 shadow-sm flex-1 min-h-[220px] overflow-hidden flex flex-col">
          <!-- Result Card Header -->
          <div class="px-3 py-2 bg-base-200/40 border-b border-base-content/10 flex items-center justify-between gap-2 shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-primary">${Icons.diff}</span>
              <span class="font-semibold text-xs text-base-content">Kết quả so sánh & Highlight</span>
            </div>
            <div id="diff-stats-badges" class="flex items-center gap-1.5">
              <span id="badge-additions" class="badge badge-sm badge-success text-white text-[10px] font-medium">+0 thêm</span>
              <span id="badge-deletions" class="badge badge-sm badge-error text-white text-[10px] font-medium">-0 xóa</span>
              <span id="badge-modifications" class="badge badge-sm badge-ghost text-[10px] font-medium">0 thay đổi</span>
            </div>
          </div>

          <!-- Split View -->
          <div id="diff-view-split" class="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden font-code text-xs leading-5 bg-base-300/20">
            <div id="diff-split-left" class="overflow-auto h-full border-r border-base-content/10"></div>
            <div id="diff-split-right" class="overflow-auto h-full"></div>
          </div>

          <!-- Unified View -->
          <div id="diff-view-unified" class="flex-1 overflow-auto font-code text-xs leading-5 bg-base-300/20 hidden"></div>

          <!-- Footer Status -->
          <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 flex items-center justify-between text-[11px] text-base-content/60 shrink-0">
            <span id="diff-status-text">Đang phân tích thay đổi...</span>
            <span class="hidden sm:inline">Dùng nút Prev / Next để cuộn nhanh đến thay đổi</span>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const textOld = this.container.querySelector('#diff-text-old');
    const textNew = this.container.querySelector('#diff-text-new');
    const numsOld = this.container.querySelector('#diff-line-nums-old');
    const numsNew = this.container.querySelector('#diff-line-nums-new');

    const updateLineNumbers = (textarea, numsEl) => {
      const lines = textarea.value.split('\n').length;
      let html = '';
      for (let i = 1; i <= lines; i++) {
        html += i + '<br/>';
      }
      numsEl.innerHTML = html || '1';
    };

    textOld.addEventListener('input', () => {
      updateLineNumbers(textOld, numsOld);
      this.computeDiff();
    });
    textOld.addEventListener('scroll', () => {
      numsOld.scrollTop = textOld.scrollTop;
    });

    textNew.addEventListener('input', () => {
      updateLineNumbers(textNew, numsNew);
      this.computeDiff();
    });
    textNew.addEventListener('scroll', () => {
      numsNew.scrollTop = textNew.scrollTop;
    });

    // View mode switch (Split vs Unified)
    const viewBtns = this.container.querySelectorAll('#diff-view-group button');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => {
          b.className = 'join-item btn btn-xs sm:btn-sm btn-ghost font-medium';
        });
        btn.className = 'join-item btn btn-xs sm:btn-sm btn-primary font-medium';
        this.state.viewMode = btn.dataset.view;

        const splitView = this.container.querySelector('#diff-view-split');
        const unifiedView = this.container.querySelector('#diff-view-unified');
        if (this.state.viewMode === 'split') {
          splitView.classList.remove('hidden');
          splitView.classList.add('grid');
          unifiedView.classList.add('hidden');
        } else {
          splitView.classList.add('hidden');
          splitView.classList.remove('grid');
          unifiedView.classList.remove('hidden');
        }
        this.computeDiff();
      });
    });

    // Granularity switch
    const granBtns = this.container.querySelectorAll('#diff-granularity-group button');
    granBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        granBtns.forEach(b => {
          b.className = 'join-item btn btn-xs sm:btn-sm btn-ghost font-medium';
        });
        btn.className = 'join-item btn btn-xs sm:btn-sm btn-active font-medium';
        this.state.diffGranularity = btn.dataset.granularity;
        this.computeDiff();
      });
    });

    // Checkboxes
    const chkWhitespace = this.container.querySelector('#diff-opt-whitespace');
    chkWhitespace.addEventListener('change', () => {
      this.state.ignoreWhitespace = chkWhitespace.checked;
      this.computeDiff();
    });

    const chkCase = this.container.querySelector('#diff-opt-case');
    chkCase.addEventListener('change', () => {
      this.state.ignoreCase = chkCase.checked;
      this.computeDiff();
    });

    // Toggle Input Editors to maximize diff view area
    const btnToggleInputs = this.container.querySelector('#btn-toggle-inputs');
    const inputsWrapper = this.container.querySelector('#diff-inputs-wrapper');
    const toggleText = this.container.querySelector('#toggle-inputs-text');
    btnToggleInputs.addEventListener('click', () => {
      this.state.showInputs = !this.state.showInputs;
      if (this.state.showInputs) {
        inputsWrapper.classList.remove('hidden');
        toggleText.textContent = 'Ẩn nhập liệu';
      } else {
        inputsWrapper.classList.add('hidden');
        toggleText.textContent = 'Hiện nhập liệu';
      }
    });

    // Swap sides
    this.container.querySelector('#btn-swap-diff').addEventListener('click', () => {
      const temp = textOld.value;
      textOld.value = textNew.value;
      textNew.value = temp;
      updateLineNumbers(textOld, numsOld);
      updateLineNumbers(textNew, numsNew);
      this.computeDiff();
      showToast('Đã hoán đổi vị trí 2 bản văn bản', 'info');
    });

    // Sample
    this.container.querySelector('#btn-diff-sample').addEventListener('click', () => {
      this.loadSample();
    });

    // Clear
    this.container.querySelector('#btn-clear-old').addEventListener('click', () => {
      textOld.value = '';
      updateLineNumbers(textOld, numsOld);
      this.computeDiff();
    });
    this.container.querySelector('#btn-clear-new').addEventListener('click', () => {
      textNew.value = '';
      updateLineNumbers(textNew, numsNew);
      this.computeDiff();
    });

    // File upload
    const setupFile = (inputId, textarea, numsEl) => {
      const input = this.container.querySelector(inputId);
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          textarea.value = event.target.result;
          updateLineNumbers(textarea, numsEl);
          this.computeDiff();
          showToast(`Đã mở file ${file.name}`, 'success');
        };
        reader.readAsText(file);
      });
    };
    setupFile('#diff-file-old', textOld, numsOld);
    setupFile('#diff-file-new', textNew, numsNew);

    // Copy patch
    this.container.querySelector('#btn-copy-patch').addEventListener('click', () => {
      this.copyUnifiedPatch();
    });

    // Navigators
    this.container.querySelector('#btn-diff-prev').addEventListener('click', () => {
      this.navigateDiff(-1);
    });
    this.container.querySelector('#btn-diff-next').addEventListener('click', () => {
      this.navigateDiff(1);
    });

    // Synchronized scrolling
    const leftCol = this.container.querySelector('#diff-split-left');
    const rightCol = this.container.querySelector('#diff-split-right');
    let isSyncingLeft = false;
    let isSyncingRight = false;

    leftCol.addEventListener('scroll', () => {
      if (!isSyncingLeft) {
        isSyncingRight = true;
        rightCol.scrollTop = leftCol.scrollTop;
        rightCol.scrollLeft = leftCol.scrollLeft;
      }
      isSyncingLeft = false;
    });

    rightCol.addEventListener('scroll', () => {
      if (!isSyncingRight) {
        isSyncingLeft = true;
        leftCol.scrollTop = rightCol.scrollTop;
        leftCol.scrollLeft = rightCol.scrollLeft;
      }
      isSyncingRight = false;
    });
  },

  loadInitialData() {
    const savedOld = localStorage.getItem('devpulse_diff_old');
    const savedNew = localStorage.getItem('devpulse_diff_new');
    const textOld = this.container.querySelector('#diff-text-old');
    const textNew = this.container.querySelector('#diff-text-new');

    if (savedOld !== null && savedNew !== null) {
      textOld.value = savedOld;
      textNew.value = savedNew;
      this.updateLineNumbers(textOld, this.container.querySelector('#diff-line-nums-old'));
      this.updateLineNumbers(textNew, this.container.querySelector('#diff-line-nums-new'));
      this.computeDiff();
    } else {
      this.loadSample();
    }
  },

  updateLineNumbers(textarea, numsEl) {
    const lines = textarea.value.split('\n').length;
    let html = '';
    for (let i = 1; i <= lines; i++) {
      html += i + '<br/>';
    }
    numsEl.innerHTML = html || '1';
  },

  loadSample() {
    const sampleOld = `function calculateDiscount(user, cartTotal) {
  // Logic tinh giam gia cu
  let discount = 0;
  if (user.isVIP === true) {
    discount = cartTotal * 0.15;
  } else if (cartTotal > 500000) {
    discount = 50000;
  }
  return cartTotal - discount;
}

const finalPrice = calculateDiscount({ isVIP: false }, 650000);
console.log("Gia cuoi:", finalPrice);`;

    const sampleNew = `function calculateDiscount(user, cartTotal, couponCode = null) {
  // Logic tinh giam gia moi duoc toi uu hoa
  let discount = 0;
  if (user.tier === 'PLATINUM' || user.isVIP) {
    discount = cartTotal * 0.20;
  } else if (cartTotal >= 1000000) {
    discount = cartTotal * 0.10;
  }

  if (couponCode === 'MEGA2026') {
    discount += 30000;
  }

  return Math.max(0, cartTotal - discount);
}

const finalPrice = calculateDiscount({ isVIP: true, tier: 'PLATINUM' }, 1200000, 'MEGA2026');
console.log("Gia cuoi sau khi giam:", finalPrice);`;

    const textOld = this.container.querySelector('#diff-text-old');
    const textNew = this.container.querySelector('#diff-text-new');
    textOld.value = sampleOld;
    textNew.value = sampleNew;

    this.updateLineNumbers(textOld, this.container.querySelector('#diff-line-nums-old'));
    this.updateLineNumbers(textNew, this.container.querySelector('#diff-line-nums-new'));
    this.computeDiff();
    showToast('Đã nạp văn bản mẫu', 'success');
  },

  computeDiff() {
    const strOld = this.container.querySelector('#diff-text-old').value;
    const strNew = this.container.querySelector('#diff-text-new').value;

    localStorage.setItem('devpulse_diff_old', strOld);
    localStorage.setItem('devpulse_diff_new', strNew);

    const lineDiff = Diff.diffLines(strOld, strNew, {
      ignoreWhitespace: this.state.ignoreWhitespace,
      ignoreCase: this.state.ignoreCase,
    });

    if (this.state.viewMode === 'split') {
      this.renderSplitDiff(lineDiff);
    } else {
      this.renderUnifiedDiff(lineDiff);
    }

    this.updateDiffStats(lineDiff);
  },

  renderSplitDiff(lineDiff) {
    const leftCol = this.container.querySelector('#diff-split-left');
    const rightCol = this.container.querySelector('#diff-split-right');

    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    let leftLineNum = 1;
    let rightLineNum = 1;

    let leftRowsHtml = '';
    let rightRowsHtml = '';

    this.state.diffBlocks = [];
    let diffRowIdCounter = 0;

    for (let i = 0; i < lineDiff.length; i++) {
      const part = lineDiff[i];
      const nextPart = lineDiff[i + 1];

      // Aligned substitution
      if (part.removed && nextPart && nextPart.added) {
        const delLines = part.value.replace(/\n$/, '').split('\n');
        const addLines = nextPart.value.replace(/\n$/, '').split('\n');
        const maxLen = Math.max(delLines.length, addLines.length);

        const blockId = `diff-block-${diffRowIdCounter++}`;
        this.state.diffBlocks.push(blockId);

        for (let j = 0; j < maxLen; j++) {
          const delText = delLines[j];
          const addText = addLines[j];

          let highlightedDel = '';
          let highlightedAdd = '';

          if (delText !== undefined && addText !== undefined) {
            const subDiff = this.highlightSubDifferences(delText, addText);
            highlightedDel = subDiff.oldHtml;
            highlightedAdd = subDiff.newHtml;
          } else {
            if (delText !== undefined) highlightedDel = escapeHtml(delText);
            if (addText !== undefined) highlightedAdd = escapeHtml(addText);
          }

          // Left row
          if (delText !== undefined) {
            leftRowsHtml += `
              <div class="flex min-h-[22px] diff-row-deleted" id="${j === 0 ? blockId : ''}">
                <div class="w-10 shrink-0 text-right pr-2 select-none text-rose-400 bg-rose-500/10 border-r border-base-content/10">${leftLineNum++}</div>
                <div class="flex-1 px-2 whitespace-pre-wrap break-all">${highlightedDel || ' '}</div>
              </div>`;
          } else {
            leftRowsHtml += `
              <div class="flex min-h-[22px] bg-base-content/[0.03]">
                <div class="w-10 shrink-0 select-none border-r border-base-content/10"> </div>
                <div class="flex-1 px-2 whitespace-pre-wrap"> </div>
              </div>`;
          }

          // Right row
          if (addText !== undefined) {
            rightRowsHtml += `
              <div class="flex min-h-[22px] diff-row-added">
                <div class="w-10 shrink-0 text-right pr-2 select-none text-emerald-400 bg-emerald-500/10 border-r border-base-content/10">${rightLineNum++}</div>
                <div class="flex-1 px-2 whitespace-pre-wrap break-all">${highlightedAdd || ' '}</div>
              </div>`;
          } else {
            rightRowsHtml += `
              <div class="flex min-h-[22px] bg-base-content/[0.03]">
                <div class="w-10 shrink-0 select-none border-r border-base-content/10"> </div>
                <div class="flex-1 px-2 whitespace-pre-wrap"> </div>
              </div>`;
          }
        }

        i++;
        continue;
      }

      // Pure deletion
      if (part.removed) {
        const delLines = part.value.replace(/\n$/, '').split('\n');
        const blockId = `diff-block-${diffRowIdCounter++}`;
        this.state.diffBlocks.push(blockId);

        delLines.forEach((line, idx) => {
          leftRowsHtml += `
            <div class="flex min-h-[22px] diff-row-deleted" id="${idx === 0 ? blockId : ''}">
              <div class="w-10 shrink-0 text-right pr-2 select-none text-rose-400 bg-rose-500/10 border-r border-base-content/10">${leftLineNum++}</div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all"><span class="diff-highlight-del">${escapeHtml(line) || ' '}</span></div>
            </div>`;
          rightRowsHtml += `
            <div class="flex min-h-[22px] bg-base-content/[0.03]">
              <div class="w-10 shrink-0 select-none border-r border-base-content/10"> </div>
              <div class="flex-1 px-2 whitespace-pre-wrap"> </div>
            </div>`;
        });
        continue;
      }

      // Pure addition
      if (part.added) {
        const addLines = part.value.replace(/\n$/, '').split('\n');
        const blockId = `diff-block-${diffRowIdCounter++}`;
        this.state.diffBlocks.push(blockId);

        addLines.forEach((line, idx) => {
          leftRowsHtml += `
            <div class="flex min-h-[22px] bg-base-content/[0.03]">
              <div class="w-10 shrink-0 select-none border-r border-base-content/10"> </div>
              <div class="flex-1 px-2 whitespace-pre-wrap"> </div>
            </div>`;
          rightRowsHtml += `
            <div class="flex min-h-[22px] diff-row-added" id="${idx === 0 ? blockId : ''}">
              <div class="w-10 shrink-0 text-right pr-2 select-none text-emerald-400 bg-emerald-500/10 border-r border-base-content/10">${rightLineNum++}</div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all"><span class="diff-highlight-add">${escapeHtml(line) || ' '}</span></div>
            </div>`;
        });
        continue;
      }

      // Unchanged
      const unchLines = part.value.replace(/\n$/, '').split('\n');
      unchLines.forEach(line => {
        leftRowsHtml += `
          <div class="flex min-h-[22px]">
            <div class="w-10 shrink-0 text-right pr-2 select-none text-base-content/30 border-r border-base-content/10">${leftLineNum++}</div>
            <div class="flex-1 px-2 whitespace-pre-wrap break-all text-base-content/90">${escapeHtml(line) || ' '}</div>
          </div>`;
        rightRowsHtml += `
          <div class="flex min-h-[22px]">
            <div class="w-10 shrink-0 text-right pr-2 select-none text-base-content/30 border-r border-base-content/10">${rightLineNum++}</div>
            <div class="flex-1 px-2 whitespace-pre-wrap break-all text-base-content/90">${escapeHtml(line) || ' '}</div>
          </div>`;
      });
    }

    leftCol.innerHTML = leftRowsHtml;
    rightCol.innerHTML = rightRowsHtml;

    this.state.currentDiffIndex = -1;
    this.updateNavigatorCounter();
  },

  renderUnifiedDiff(lineDiff) {
    const unifiedEl = this.container.querySelector('#diff-view-unified');
    unifiedEl.innerHTML = '';

    let leftLineNum = 1;
    let rightLineNum = 1;
    let rowsHtml = '';

    this.state.diffBlocks = [];
    let diffRowIdCounter = 0;

    for (let i = 0; i < lineDiff.length; i++) {
      const part = lineDiff[i];
      const nextPart = lineDiff[i + 1];

      // Aligned substitution
      if (part.removed && nextPart && nextPart.added) {
        const delLines = part.value.replace(/\n$/, '').split('\n');
        const addLines = nextPart.value.replace(/\n$/, '').split('\n');
        const maxLen = Math.max(delLines.length, addLines.length);

        const blockId = `diff-block-${diffRowIdCounter++}`;
        this.state.diffBlocks.push(blockId);

        for (let j = 0; j < maxLen; j++) {
          const delText = delLines[j];
          const addText = addLines[j];

          let highlightedDel = '';
          let highlightedAdd = '';

          if (delText !== undefined && addText !== undefined) {
            const subDiff = this.highlightSubDifferences(delText, addText);
            highlightedDel = subDiff.oldHtml;
            highlightedAdd = subDiff.newHtml;
          } else {
            if (delText !== undefined) highlightedDel = escapeHtml(delText);
            if (addText !== undefined) highlightedAdd = escapeHtml(addText);
          }

          if (delText !== undefined) {
            rowsHtml += `
              <div class="flex min-h-[22px] diff-row-deleted" id="${j === 0 ? blockId : ''}">
                <div class="w-10 shrink-0 text-right pr-2 select-none text-rose-400 bg-rose-500/10 border-r border-base-content/10">${leftLineNum++}</div>
                <div class="w-10 shrink-0 text-right pr-2 select-none border-r border-base-content/10"> </div>
                <div class="w-6 shrink-0 text-center select-none text-rose-500 font-bold">-</div>
                <div class="flex-1 px-2 whitespace-pre-wrap break-all">${highlightedDel || ' '}</div>
              </div>`;
          }

          if (addText !== undefined) {
            rowsHtml += `
              <div class="flex min-h-[22px] diff-row-added">
                <div class="w-10 shrink-0 text-right pr-2 select-none border-r border-base-content/10"> </div>
                <div class="w-10 shrink-0 text-right pr-2 select-none text-emerald-400 bg-emerald-500/10 border-r border-base-content/10">${rightLineNum++}</div>
                <div class="w-6 shrink-0 text-center select-none text-emerald-500 font-bold">+</div>
                <div class="flex-1 px-2 whitespace-pre-wrap break-all">${highlightedAdd || ' '}</div>
              </div>`;
          }
        }

        i++;
        continue;
      }

      if (part.removed) {
        const delLines = part.value.replace(/\n$/, '').split('\n');
        const blockId = `diff-block-${diffRowIdCounter++}`;
        this.state.diffBlocks.push(blockId);

        delLines.forEach((line, idx) => {
          rowsHtml += `
            <div class="flex min-h-[22px] diff-row-deleted" id="${idx === 0 ? blockId : ''}">
              <div class="w-10 shrink-0 text-right pr-2 select-none text-rose-400 bg-rose-500/10 border-r border-base-content/10">${leftLineNum++}</div>
              <div class="w-10 shrink-0 text-right pr-2 select-none border-r border-base-content/10"> </div>
              <div class="w-6 shrink-0 text-center select-none text-rose-500 font-bold">-</div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all"><span class="diff-highlight-del">${escapeHtml(line) || ' '}</span></div>
            </div>`;
        });
        continue;
      }

      if (part.added) {
        const addLines = part.value.replace(/\n$/, '').split('\n');
        const blockId = `diff-block-${diffRowIdCounter++}`;
        this.state.diffBlocks.push(blockId);

        addLines.forEach((line, idx) => {
          rowsHtml += `
            <div class="flex min-h-[22px] diff-row-added" id="${idx === 0 ? blockId : ''}">
              <div class="w-10 shrink-0 text-right pr-2 select-none border-r border-base-content/10"> </div>
              <div class="w-10 shrink-0 text-right pr-2 select-none text-emerald-400 bg-emerald-500/10 border-r border-base-content/10">${rightLineNum++}</div>
              <div class="w-6 shrink-0 text-center select-none text-emerald-500 font-bold">+</div>
              <div class="flex-1 px-2 whitespace-pre-wrap break-all"><span class="diff-highlight-add">${escapeHtml(line) || ' '}</span></div>
            </div>`;
        });
        continue;
      }

      // Unchanged
      const unchLines = part.value.replace(/\n$/, '').split('\n');
      unchLines.forEach(line => {
        rowsHtml += `
          <div class="flex min-h-[22px]">
            <div class="w-10 shrink-0 text-right pr-2 select-none text-base-content/30 border-r border-base-content/10">${leftLineNum++}</div>
            <div class="w-10 shrink-0 text-right pr-2 select-none text-base-content/30 border-r border-base-content/10">${rightLineNum++}</div>
            <div class="w-6 shrink-0 select-none"> </div>
            <div class="flex-1 px-2 whitespace-pre-wrap break-all text-base-content/90">${escapeHtml(line) || ' '}</div>
          </div>`;
      });
    }

    unifiedEl.innerHTML = rowsHtml;
    this.state.currentDiffIndex = -1;
    this.updateNavigatorCounter();
  },

  highlightSubDifferences(oldLine, newLine) {
    if (this.state.diffGranularity === 'line') {
      return {
        oldHtml: `<span class="diff-highlight-del">${escapeHtml(oldLine)}</span>`,
        newHtml: `<span class="diff-highlight-add">${escapeHtml(newLine)}</span>`,
      };
    }

    const diffFn = this.state.diffGranularity === 'char' 
      ? Diff.diffChars 
      : Diff.diffWordsWithSpace;

    const parts = diffFn(oldLine, newLine, {
      ignoreCase: this.state.ignoreCase
    });

    let oldHtml = '';
    let newHtml = '';

    for (const part of parts) {
      const text = escapeHtml(part.value);
      if (part.removed) {
        oldHtml += `<mark class="diff-highlight-del">${text}</mark>`;
      } else if (part.added) {
        newHtml += `<mark class="diff-highlight-add">${text}</mark>`;
      } else {
        oldHtml += text;
        newHtml += text;
      }
    }

    return { oldHtml, newHtml };
  },

  updateDiffStats(lineDiff) {
    let additions = 0;
    let deletions = 0;

    for (const part of lineDiff) {
      const count = part.count || part.value.replace(/\n$/, '').split('\n').length;
      if (part.added) additions += count;
      if (part.removed) deletions += count;
    }

    const badgeAdd = this.container.querySelector('#badge-additions');
    const badgeDel = this.container.querySelector('#badge-deletions');
    const badgeMod = this.container.querySelector('#badge-modifications');

    badgeAdd.textContent = `+${additions} thêm`;
    badgeDel.textContent = `-${deletions} xóa`;
    badgeMod.textContent = `${this.state.diffBlocks.length} vị trí khác biệt`;

    const statusText = this.container.querySelector('#diff-status-text');
    if (additions === 0 && deletions === 0) {
      statusText.innerHTML = `<span class="text-success font-semibold">✓ Hai văn bản hoàn toàn giống nhau!</span>`;
    } else {
      statusText.textContent = `Đã phát hiện ${this.state.diffBlocks.length} khối thay đổi (${additions} dòng thêm, ${deletions} dòng xóa).`;
    }
  },

  navigateDiff(direction) {
    const total = this.state.diffBlocks.length;
    if (total === 0) {
      showToast('Không có điểm khác biệt nào để duyệt', 'info');
      return;
    }

    const prevFocused = this.container.querySelectorAll('.diff-marker-focused');
    prevFocused.forEach(el => el.classList.remove('diff-marker-focused'));

    this.state.currentDiffIndex += direction;
    if (this.state.currentDiffIndex >= total) {
      this.state.currentDiffIndex = 0;
    } else if (this.state.currentDiffIndex < 0) {
      this.state.currentDiffIndex = total - 1;
    }

    const targetId = this.state.diffBlocks[this.state.currentDiffIndex];
    const targetEl = this.container.querySelector(`#${targetId}`);

    if (targetEl) {
      targetEl.classList.add('diff-marker-focused');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    this.updateNavigatorCounter();
  },

  updateNavigatorCounter() {
    const total = this.state.diffBlocks.length;
    const current = this.state.currentDiffIndex >= 0 ? this.state.currentDiffIndex + 1 : 0;
    const counter = this.container.querySelector('#diff-nav-counter');
    if (counter) {
      counter.textContent = `${current}/${total}`;
    }
  },

  copyUnifiedPatch() {
    const strOld = this.container.querySelector('#diff-text-old').value;
    const strNew = this.container.querySelector('#diff-text-new').value;

    const patch = Diff.createPatch('original.txt', strOld, strNew, 'Bản gốc', 'Bản sửa đổi');
    navigator.clipboard.writeText(patch);
    showToast('Đã sao chép patch định dạng Git Unified!', 'success');
  }
};
