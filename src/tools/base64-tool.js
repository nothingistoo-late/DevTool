import { Icons } from '../core/icons.js';
import { showToast } from '../core/toast.js';

export const Base64Tool = {
  id: 'base64-codec',
  title: 'Base64 & URL Encoder / Decoder',
  shortTitle: 'Base64 & URL Codec',
  category: 'Encoders & Decoders',
  icon: Icons.shield,
  badge: 'Utility',
  description: 'Encode and decode strings and URLs to and from Base64, URI components, and Hex format.',
  tags: ['base64', 'encode', 'decode', 'url', 'uri', 'hex', 'crypto', 'string'],

  state: {
    mode: 'base64',
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
        <!-- Top Controls -->
        <div class="bg-base-100 border border-base-content/10 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shrink-0 shadow-sm">
          <div class="join" id="codec-mode-group">
            <button class="join-item btn btn-xs sm:btn-sm btn-primary font-medium" data-codec="base64">Base64</button>
            <button class="join-item btn btn-xs sm:btn-sm btn-ghost font-medium" data-codec="url">URL Encode</button>
            <button class="join-item btn btn-xs sm:btn-sm btn-ghost font-medium" data-codec="hex">Hexadecimal</button>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-xs sm:btn-sm gap-1" id="btn-codec-swap">
              ${Icons.swap} <span class="hidden sm:inline text-xs">Đổi chiều</span>
            </button>
            <button class="btn btn-ghost btn-xs sm:btn-sm btn-square text-error" id="btn-codec-clear">
              ${Icons.trash}
            </button>
          </div>
        </div>

        <!-- 2 Panels -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 overflow-hidden">
          <!-- Input -->
          <div class="card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
            <div class="px-3 py-2 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
              <span class="font-semibold text-xs text-base-content">Input (Plain Text)</span>
              <button class="btn btn-primary btn-xs text-xs" id="btn-do-encode">Mã hóa →</button>
            </div>
            <div class="flex-1 p-3 bg-base-300/30">
              <textarea id="codec-input" class="w-full h-full p-2 bg-transparent outline-none resize-none font-code text-xs leading-5 text-base-content" placeholder="Nhập văn bản cần mã hóa/giải mã..." spellcheck="false"></textarea>
            </div>
            <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 text-[11px] text-base-content/60 shrink-0">
              <span id="codec-input-len">Length: 0 chars</span>
            </div>
          </div>

          <!-- Output -->
          <div class="card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
            <div class="px-3 py-2 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
              <span class="font-semibold text-xs text-base-content">Output (Encoded / Decoded)</span>
              <div class="flex items-center gap-1">
                <button class="btn btn-ghost btn-xs text-xs" id="btn-do-decode">← Giải mã</button>
                <button class="btn btn-ghost btn-xs gap-1" id="btn-codec-copy">
                  ${Icons.copy} <span class="hidden sm:inline text-xs">Copy</span>
                </button>
              </div>
            </div>
            <div class="flex-1 p-3 bg-base-300/30">
              <textarea id="codec-output" class="w-full h-full p-2 bg-transparent outline-none resize-none font-code text-xs leading-5 text-base-content" placeholder="Kết quả sẽ hiển thị ở đây..." spellcheck="false"></textarea>
            </div>
            <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 text-[11px] text-base-content/60 shrink-0">
              <span id="codec-output-len">Length: 0 chars</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    const input = this.container.querySelector('#codec-input');
    const output = this.container.querySelector('#codec-output');
    const inputLen = this.container.querySelector('#codec-input-len');
    const outputLen = this.container.querySelector('#codec-output-len');

    const updateLens = () => {
      inputLen.textContent = `Length: ${input.value.length} chars`;
      outputLen.textContent = `Length: ${output.value.length} chars`;
    };

    input.addEventListener('input', () => {
      updateLens();
      this.encodeAuto();
    });

    const modeBtns = this.container.querySelectorAll('#codec-mode-group button');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => {
          b.className = 'join-item btn btn-xs sm:btn-sm btn-ghost font-medium';
        });
        btn.className = 'join-item btn btn-xs sm:btn-sm btn-primary font-medium';
        this.state.mode = btn.dataset.codec;
        this.encodeAuto();
      });
    });

    this.container.querySelector('#btn-do-encode').addEventListener('click', () => {
      this.encodeAuto();
      showToast('Đã mã hóa', 'success');
    });

    this.container.querySelector('#btn-do-decode').addEventListener('click', () => {
      this.decodeOutput();
    });

    this.container.querySelector('#btn-codec-copy').addEventListener('click', () => {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value);
      showToast('Đã sao chép kết quả!', 'success');
    });

    this.container.querySelector('#btn-codec-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      updateLens();
      showToast('Đã xóa', 'info');
    });

    this.container.querySelector('#btn-codec-swap').addEventListener('click', () => {
      const temp = input.value;
      input.value = output.value;
      output.value = temp;
      updateLens();
    });
  },

  encodeAuto() {
    const text = this.container.querySelector('#codec-input').value;
    const output = this.container.querySelector('#codec-output');
    const outputLen = this.container.querySelector('#codec-output-len');

    if (!text) {
      output.value = '';
      outputLen.textContent = 'Length: 0 chars';
      return;
    }

    try {
      if (this.state.mode === 'base64') {
        output.value = btoa(unescape(encodeURIComponent(text)));
      } else if (this.state.mode === 'url') {
        output.value = encodeURIComponent(text);
      } else if (this.state.mode === 'hex') {
        output.value = Array.from(new TextEncoder().encode(text))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');
      }
      outputLen.textContent = `Length: ${output.value.length} chars`;
    } catch (err) {
      output.value = `Error: ${err.message}`;
    }
  },

  decodeOutput() {
    const output = this.container.querySelector('#codec-output');
    const input = this.container.querySelector('#codec-input');
    const val = output.value.trim();

    if (!val) return;

    try {
      if (this.state.mode === 'base64') {
        input.value = decodeURIComponent(escape(atob(val)));
      } else if (this.state.mode === 'url') {
        input.value = decodeURIComponent(val);
      } else if (this.state.mode === 'hex') {
        const clean = val.replace(/\s+/g, '');
        const bytes = new Uint8Array(clean.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        input.value = new TextDecoder().decode(bytes);
      }
      showToast('Đã giải mã thành công', 'success');
    } catch (err) {
      showToast(`Lỗi giải mã: ${err.message}`, 'danger');
    }
  }
};
