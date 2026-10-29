import './style.css';
import { ToolRegistry } from './core/registry.js';
import { Icons } from './core/icons.js';
import { showToast, escapeHtml } from './core/toast.js';

class DevPulseApp {
  constructor() {
    this.appEl = document.getElementById('app');
    this.currentTool = null;
    this.theme = localStorage.getItem('devpulse_theme') || 'dark';

    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.renderLayout();
    this.bindGlobalEvents();

    const initialToolId = window.location.hash.replace('#', '') || 'json-formatter';
    this.switchTool(initialToolId);
  }

  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('devpulse_theme', theme);

    const themeToggle = document.getElementById('theme-toggle-checkbox');
    if (themeToggle) {
      themeToggle.checked = theme === 'dark' || theme === 'dim' || theme === 'dracula';
    }
  }

  renderLayout() {
    this.appEl.innerHTML = `
      <div class="drawer lg:drawer-open h-screen w-screen overflow-hidden bg-base-300">
        <!-- Drawer Toggle input for responsive mobile sidebar -->
        <input id="app-drawer-toggle" type="checkbox" class="drawer-toggle" />

        <!-- Drawer Content (Main Page) -->
        <div class="drawer-content flex flex-col h-screen overflow-hidden">
          
          <!-- Top Navbar -->
          <header class="navbar bg-base-100 border-b border-base-content/10 px-3 md:px-5 gap-2 shrink-0 z-30 min-h-[56px] h-14">
            <!-- Mobile Drawer Hamburger Toggle -->
            <div class="flex-none lg:hidden">
              <label for="app-drawer-toggle" aria-label="open sidebar" class="btn btn-square btn-ghost btn-sm">
                ${Icons.sidebar}
              </label>
            </div>

            <!-- Logo (Visible on mobile navbar, on desktop it's in sidebar) -->
            <div class="flex-1 lg:flex-none flex items-center gap-2">
              <a href="#json-formatter" class="flex items-center gap-2 font-bold text-base md:text-lg tracking-tight">
                <span class="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
                  ${Icons.logo}
                </span>
                <span class="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">DevPulse</span>
                <span class="badge badge-sm badge-outline text-[10px] font-mono uppercase tracking-wider hidden sm:inline-flex">Toolbox</span>
              </a>
            </div>

            <!-- Global Search Command Palette Button (Responsive: icon on mobile, full bar on desktop) -->
            <div class="flex-1 max-w-md mx-2 md:mx-6 hidden sm:block">
              <button id="btn-open-palette" class="btn btn-sm btn-outline border-base-content/20 hover:border-primary hover:bg-base-200 w-full justify-between font-normal text-xs text-base-content/70">
                <span class="flex items-center gap-2 truncate">
                  ${Icons.search}
                  <span class="truncate">Tìm kiếm công cụ...</span>
                </span>
                <kbd class="kbd kbd-xs bg-base-300 border-base-content/20 font-mono">Ctrl K</kbd>
              </button>
            </div>

            <!-- Mobile Search Icon Button -->
            <button id="btn-open-palette-mobile" class="btn btn-ghost btn-circle btn-sm sm:hidden ml-auto" title="Tìm kiếm">
              ${Icons.search}
            </button>

            <!-- Navbar Actions -->
            <div class="flex-none flex items-center gap-1 sm:gap-2">
              <!-- Theme Controller Dropdown -->
              <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-circle" title="Chọn giao diện">
                  <span class="hidden dark:inline">${Icons.moon}</span>
                  <span class="inline dark:hidden">${Icons.sun}</span>
                </div>
                <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-2xl bg-base-100 rounded-box w-40 text-xs border border-base-content/10 mt-2">
                  <li class="menu-title text-[10px] uppercase font-bold text-base-content/50">Giao diện</li>
                  <li><button data-set-theme="dark" class="flex justify-between items-center ${this.theme === 'dark' ? 'active' : ''}">Dark <span>🌙</span></button></li>
                  <li><button data-set-theme="dim" class="flex justify-between items-center ${this.theme === 'dim' ? 'active' : ''}">Dim <span>🌑</span></button></li>
                  <li><button data-set-theme="dracula" class="flex justify-between items-center ${this.theme === 'dracula' ? 'active' : ''}">Dracula <span>🧛</span></button></li>
                  <li><button data-set-theme="light" class="flex justify-between items-center ${this.theme === 'light' ? 'active' : ''}">Light <span>☀️</span></button></li>
                </ul>
              </div>

              <!-- Github link -->
              <a href="https://github.com/nothingistoo-late/DevTool" target="_blank" rel="noreferrer" class="btn btn-ghost btn-sm btn-circle" title="Mã nguồn">
                ${Icons.code}
              </a>
            </div>
          </header>

          <!-- Main Tool Workspace Container -->
          <main class="flex-1 flex flex-col min-h-0 overflow-hidden bg-base-200">
            <!-- Tool Header Info Bar -->
            <div class="bg-base-100 border-b border-base-content/10 px-4 md:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <div id="current-tool-icon" class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  ${Icons.json}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h1 id="current-tool-title" class="font-bold text-sm md:text-base text-base-content truncate">Đang tải...</h1>
                    <span id="current-tool-badge" class="badge badge-sm badge-primary text-[10px] font-semibold">Tool</span>
                  </div>
                  <p id="current-tool-desc" class="text-xs text-base-content/60 truncate mt-0.5 max-w-xl">Mô tả công cụ</p>
                </div>
              </div>
            </div>

            <!-- Active Tool Content Mount -->
            <div id="tool-container" class="flex-1 flex flex-col min-h-0 p-3 md:p-5 overflow-hidden">
              <!-- Tool views render here -->
            </div>
          </main>
        </div>

        <!-- Drawer Sidebar -->
        <div class="drawer-side z-40">
          <label for="app-drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
          <aside class="w-72 bg-base-100 h-full flex flex-col border-r border-base-content/10 shadow-lg lg:shadow-none">
            <!-- Sidebar Header Brand -->
            <div class="p-4 border-b border-base-content/10 hidden lg:flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
                ${Icons.logo}
              </span>
              <span class="font-bold text-base tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">DevPulse</span>
              <span class="badge badge-xs badge-primary font-mono text-[9px] ml-auto">v1.0</span>
            </div>

            <!-- Sidebar Search Input -->
            <div class="p-3 border-b border-base-content/5">
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/40">
                  ${Icons.search}
                </span>
                <input id="sidebar-filter-input" type="text" placeholder="Lọc danh sách tool..." class="input input-sm input-bordered w-full pl-9 text-xs focus:input-primary bg-base-200/50" />
              </div>
            </div>

            <!-- Sidebar Tools List -->
            <div id="sidebar-tools-container" class="flex-1 overflow-y-auto p-2 space-y-4">
              <!-- Injected dynamically -->
            </div>

            <!-- Sidebar Footer -->
            <div class="p-3 border-t border-base-content/10 bg-base-200/30 flex items-center justify-between text-[11px] text-base-content/50">
              <span>Đa công cụ cho Dev</span>
              <span class="flex items-center gap-1 font-mono text-emerald-500 font-semibold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
          </aside>
        </div>
      </div>

      <!-- Command Palette Modal (DaisyUI Modal) -->
      <dialog id="palette-modal" class="modal modal-top pt-16 sm:pt-24 backdrop-blur-sm">
        <div class="modal-box max-w-xl p-0 bg-base-100 border border-base-content/15 shadow-2xl">
          <div class="p-3 border-b border-base-content/10 flex items-center gap-2">
            <span class="text-base-content/50 pl-2">${Icons.search}</span>
            <input id="palette-input" type="text" placeholder="Tìm kiếm công cụ (vd: json, diff, compare, base64...)" class="input input-ghost w-full focus:outline-none focus:bg-transparent text-sm placeholder:text-base-content/40" autocomplete="off" />
            <kbd class="kbd kbd-sm bg-base-200 font-mono text-[10px]">ESC</kbd>
          </div>
          <div id="palette-results" class="max-h-80 overflow-y-auto p-2 space-y-1"></div>
          <div class="p-2.5 bg-base-200/60 border-t border-base-content/10 flex items-center justify-between text-[11px] text-base-content/50">
            <span>Dùng phím ↑ ↓ để chọn, Enter để mở</span>
            <span>ESC để đóng</span>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    `;

    this.renderSidebarTools();
  }

  renderSidebarTools(filterQuery = '') {
    const container = document.getElementById('sidebar-tools-container');
    if (!container) return;

    const filteredTools = ToolRegistry.search(filterQuery);
    if (filteredTools.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-xs text-base-content/50">
          Không tìm thấy công cụ nào phù hợp với "${escapeHtml(filterQuery)}"
        </div>
      `;
      return;
    }

    const categoriesMap = new Map();
    for (const tool of filteredTools) {
      const cat = tool.category || 'General';
      if (!categoriesMap.has(cat)) {
        categoriesMap.set(cat, []);
      }
      categoriesMap.get(cat).push(tool);
    }

    let html = '';
    for (const [categoryName, tools] of categoriesMap.entries()) {
      html += `
        <div>
          <div class="text-[10px] font-bold uppercase tracking-wider text-base-content/40 px-3 py-1">
            ${escapeHtml(categoryName)}
          </div>
          <ul class="menu menu-sm p-0 space-y-0.5">
      `;
      for (const tool of tools) {
        const isActive = this.currentTool && this.currentTool.id === tool.id;
        html += `
          <li>
            <a class="tool-item-link flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs ${isActive ? 'active font-medium bg-primary text-primary-content shadow-sm' : 'hover:bg-base-200'}" data-tool-id="${tool.id}" href="#${tool.id}">
              <span class="w-5 h-5 flex items-center justify-center shrink-0">${tool.icon}</span>
              <span class="truncate flex-1">${escapeHtml(tool.shortTitle || tool.title)}</span>
              ${tool.badge ? `<span class="badge badge-xs ${isActive ? 'badge-neutral text-primary-content' : 'badge-ghost text-[9px]'}">${escapeHtml(tool.badge)}</span>` : ''}
            </a>
          </li>
        `;
      }
      html += `
          </ul>
        </div>
      `;
    }

    container.innerHTML = html;

    // Click events
    container.querySelectorAll('.tool-item-link').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const toolId = item.dataset.toolId;
        this.switchTool(toolId);

        // Close mobile drawer if open
        const drawerToggle = document.getElementById('app-drawer-toggle');
        if (drawerToggle && window.innerWidth < 1024) {
          drawerToggle.checked = false;
        }
      });
    });
  }

  switchTool(toolId) {
    const targetTool = ToolRegistry.getById(toolId) || ToolRegistry.getAll()[0];
    if (!targetTool) return;

    if (this.currentTool && this.currentTool.destroy) {
      try {
        this.currentTool.destroy();
      } catch (e) {
        console.error('Error destroying tool:', e);
      }
    }

    this.currentTool = targetTool;
    window.location.hash = targetTool.id;

    // Update Header
    document.getElementById('current-tool-title').textContent = targetTool.title;
    document.getElementById('current-tool-desc').textContent = targetTool.description;
    document.getElementById('current-tool-icon').innerHTML = targetTool.icon;
    const badgeEl = document.getElementById('current-tool-badge');
    badgeEl.textContent = targetTool.badge || targetTool.category;

    // Update Active in Sidebar
    document.querySelectorAll('.tool-item-link').forEach(item => {
      const match = item.dataset.toolId === targetTool.id;
      if (match) {
        item.className = 'tool-item-link flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs active font-medium bg-primary text-primary-content shadow-sm';
      } else {
        item.className = 'tool-item-link flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs hover:bg-base-200 text-base-content/80';
      }
    });

    // Mount Tool
    const toolContainer = document.getElementById('tool-container');
    toolContainer.innerHTML = '';
    targetTool.init(toolContainer);
  }

  bindGlobalEvents() {
    // Theme buttons in dropdown
    document.querySelectorAll('[data-set-theme]').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.setTheme;
        this.applyTheme(theme);
        showToast(`Đã chuyển sang theme ${theme}`, 'info', 1500);
      });
    });

    // Sidebar search filter
    const sidebarFilter = document.getElementById('sidebar-filter-input');
    if (sidebarFilter) {
      sidebarFilter.addEventListener('input', (e) => {
        this.renderSidebarTools(e.target.value);
      });
    }

    // Hash change
    window.addEventListener('hashchange', () => {
      const hashToolId = window.location.hash.replace('#', '');
      if (hashToolId && (!this.currentTool || this.currentTool.id !== hashToolId)) {
        this.switchTool(hashToolId);
      }
    });

    // Palette modal
    const modal = document.getElementById('palette-modal');
    const paletteInput = document.getElementById('palette-input');

    const openPalette = () => {
      modal.showModal();
      paletteInput.value = '';
      this.renderPaletteResults('');
      setTimeout(() => paletteInput.focus(), 50);
    };

    const btnOpenPalette = document.getElementById('btn-open-palette');
    const btnOpenMobile = document.getElementById('btn-open-palette-mobile');
    if (btnOpenPalette) btnOpenPalette.addEventListener('click', openPalette);
    if (btnOpenMobile) btnOpenMobile.addEventListener('click', openPalette);

    if (paletteInput) {
      paletteInput.addEventListener('input', (e) => {
        this.renderPaletteResults(e.target.value);
      });
    }

    // Keyboard Shortcuts (Ctrl + K)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (modal.open) {
          modal.close();
        } else {
          openPalette();
        }
      }
    });
  }

  renderPaletteResults(query) {
    const listEl = document.getElementById('palette-results');
    const tools = ToolRegistry.search(query);

    if (tools.length === 0) {
      listEl.innerHTML = `<div class="p-6 text-center text-xs text-base-content/40">Không tìm thấy công cụ</div>`;
      return;
    }

    listEl.innerHTML = tools.map((tool, idx) => `
      <div class="palette-item p-2.5 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-base-200 transition-colors ${idx === 0 ? 'bg-base-200' : ''}" data-tool-id="${tool.id}">
        <span class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">${tool.icon}</span>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-xs text-base-content truncate">${escapeHtml(tool.title)}</div>
          <div class="text-[11px] text-base-content/50 truncate">${escapeHtml(tool.description)}</div>
        </div>
        <span class="badge badge-sm badge-ghost text-[10px] shrink-0">${escapeHtml(tool.category)}</span>
      </div>
    `).join('');

    const modal = document.getElementById('palette-modal');
    listEl.querySelectorAll('.palette-item').forEach(item => {
      item.addEventListener('click', () => {
        const toolId = item.dataset.toolId;
        this.switchTool(toolId);
        modal.close();
      });
    });
  }
}

// Boot application
new DevPulseApp();
