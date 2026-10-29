import { Icons } from '../core/icons.js';
import { showToast, escapeHtml } from '../core/toast.js';

export const MockDataGeneratorTool = {
  id: 'mock-data-generator',
  title: 'Mock Data / Fake Data Generator',
  shortTitle: 'Mock Data Generator',
  category: 'Generators',
  icon: Icons.database,
  badge: 'Popular',
  description: 'Generate realistic mock data (Vietnamese & English names, emails, addresses, phones, orders) exportable to MySQL, PostgreSQL, SQLite, MongoDB, JSON, and CSV.',
  tags: ['mock', 'fake', 'data', 'generator', 'faker', 'mysql', 'postgres', 'postgresql', 'mssql', 'sqlserver', 'sql server', 'mongodb', 'sqlite', 'sql', 'csv', 'json', 'test data', 'database'],

  state: {
    count: 10,
    format: 'mysql', // 'mysql' | 'postgres' | 'sqlite' | 'mongodb' | 'mongo_jsonl' | 'json' | 'csv'
    tableName: 'users',
    fields: [
      { name: 'id', type: 'id' },
      { name: 'full_name', type: 'name_vn' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'phone_vn' },
      { name: 'city', type: 'city_vn' },
      { name: 'role', type: 'role' },
      { name: 'is_active', type: 'boolean' }
    ],
    generatedOutput: '',
    rawItems: [],
  },

  // Vietnamese Name Datasets
  dataSets: {
    ho: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'],
    demNam: ['Văn', 'Đình', 'Quốc', 'Minh', 'Đức', 'Hữu', 'Hoàng', 'Thanh', 'Tuấn', 'Thành', 'Bảo', 'Anh'],
    tenNam: ['An', 'Bình', 'Cường', 'Dũng', 'Đức', 'Hải', 'Hưng', 'Huy', 'Khoa', 'Long', 'Minh', 'Nam', 'Phong', 'Phúc', 'Quân', 'Sơn', 'Tú', 'Tuấn', 'Việt'],
    demNu: ['Thị', 'Thu', 'Thanh', 'Ngọc', 'Phương', 'Khánh', 'Như', 'Mai', 'Mỹ', 'Hồng', 'Diệu'],
    tenNu: ['Anh', 'Chi', 'Dung', 'Hà', 'Hằng', 'Hoa', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Ngọc', 'Nhi', 'Phương', 'Quỳnh', 'Thảo', 'Trang', 'Vy'],
    enFirst: ['James', 'Emma', 'Oliver', 'Sophia', 'William', 'Isabella', 'Benjamin', 'Mia', 'Lucas', 'Charlotte', 'Henry', 'Amelia', 'Alexander', 'Harper', 'Michael'],
    enLast: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'],
    domains: ['gmail.com', 'yahoo.com', 'outlook.com', 'company.vn', 'devpulse.io', 'techcorp.com'],
    cities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Bình Dương', 'Vũng Tàu', 'Quảng Ninh'],
    streets: ['Hoàng Hoa Thám', 'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Phan Chu Trinh', 'Hai Bà Trưng', 'Cầu Giấy', 'Võ Văn Kiệt', 'Điện Biên Phủ'],
    roles: ['admin', 'developer', 'designer', 'editor', 'manager', 'customer', 'analyst', 'qa_engineer'],
    companies: ['FPT Software', 'VNG Corporation', 'Viettel Solutions', 'VinAI Lab', 'Tiki Corp', 'Shopee VN', 'Momo Tech', 'VNPT Group', 'One Mount'],
    orderStatus: ['pending', 'processing', 'completed', 'shipped', 'cancelled', 'refunded'],
    products: ['MacBook Pro M3', 'iPhone 16 Pro Max', 'Bàn phím cơ Keychron', 'Màn hình Dell Ultrasharp', 'Chuột Logitech MX Master 3', 'Tai nghe Sony WH-1000XM5', 'Ghế công thái học Ergonomic', 'iPad Pro M4']
  },

  init(container) {
    this.container = container;
    this.render();
    this.bindEvents();
    this.generateData();
  },

  destroy() {},

  render() {
    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full overflow-hidden">
        
        <!-- Left Column: Schema Configuration & Fields -->
        <div class="lg:col-span-5 card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
          
          <!-- Header with Presets -->
          <div class="px-3 py-2 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-1.5 font-semibold text-xs text-base-content">
              <span class="text-primary">${Icons.database}</span>
              <span>Cấu hình Schema & Cột</span>
            </div>

            <!-- Templates Dropdown -->
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-xs btn-outline border-base-content/20 gap-1 font-medium">
                ${Icons.sparkles} <span>Mẫu Schema</span>
              </div>
              <ul tabindex="0" class="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-box w-60 text-xs border border-base-content/15 space-y-1 mt-1">
                <li class="menu-title text-[10px] uppercase font-bold text-base-content/50">Chọn mẫu nhanh</li>
                <li><button class="btn-schema-preset" data-preset="users">👥 Danh sách Người dùng</button></li>
                <li><button class="btn-schema-preset" data-preset="orders">📦 Đơn hàng E-Commerce</button></li>
                <li><button class="btn-schema-preset" data-preset="posts">📝 Bài viết Blog / Tin tức</button></li>
              </ul>
            </div>
          </div>

          <!-- Quantity & Output Format Selector -->
          <div class="p-3 bg-base-200/30 border-b border-base-content/5 space-y-2.5 shrink-0">
            <!-- Quantity row -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold text-base-content">Số lượng dòng (Records)</span>
              <div class="join" id="mock-qty-group">
                <button class="join-item btn btn-xs ${this.state.count === 5 ? 'btn-active' : ''}" data-count="5">5</button>
                <button class="join-item btn btn-xs ${this.state.count === 10 ? 'btn-active' : ''}" data-count="10">10</button>
                <button class="join-item btn btn-xs ${this.state.count === 25 ? 'btn-active' : ''}" data-count="25">25</button>
                <button class="join-item btn btn-xs ${this.state.count === 50 ? 'btn-active' : ''}" data-count="50">50</button>
                <button class="join-item btn btn-xs ${this.state.count === 100 ? 'btn-active' : ''}" data-count="100">100</button>
              </div>
            </div>

            <!-- Database / Format Selector Dropdown -->
            <div class="flex items-center justify-between gap-2 pt-1">
              <span class="text-xs font-semibold text-base-content flex items-center gap-1">
                <span>Định dạng CSDL / Xuất:</span>
              </span>
              <select id="select-mock-format" class="select select-bordered select-xs w-56 text-xs font-semibold bg-base-100">
                <optgroup label="Cơ sở dữ liệu Quan hệ (SQL)">
                  <option value="mysql" ${this.state.format === 'mysql' ? 'selected' : ''}>🐬 MySQL (INSERT INTO \`table\`)</option>
                  <option value="postgres" ${this.state.format === 'postgres' ? 'selected' : ''}>🐘 PostgreSQL (INSERT INTO "table")</option>
                  <option value="mssql" ${this.state.format === 'mssql' ? 'selected' : ''}>🏢 Microsoft SQL Server (T-SQL)</option>
                  <option value="sqlite" ${this.state.format === 'sqlite' ? 'selected' : ''}>🪶 SQLite (INSERT INTO "table")</option>
                </optgroup>
                <optgroup label="NoSQL / MongoDB">
                  <option value="mongodb" ${this.state.format === 'mongodb' ? 'selected' : ''}>🍃 MongoDB (db.collection.insertMany)</option>
                  <option value="mongo_jsonl" ${this.state.format === 'mongo_jsonl' ? 'selected' : ''}>🍃 MongoDB (mongoimport JSON Lines)</option>
                </optgroup>
                <optgroup label="Định dạng Dữ liệu & Bảng tính">
                  <option value="json" ${this.state.format === 'json' ? 'selected' : ''}>{} JSON Array ([{...}])</option>
                  <option value="csv" ${this.state.format === 'csv' ? 'selected' : ''}>📊 CSV (Excel / Spreadsheets)</option>
                </optgroup>
              </select>
            </div>

            <!-- Table / Collection Name Config -->
            <div id="table-config-row" class="flex items-center gap-2 pt-1">
              <span id="table-config-label" class="text-xs text-base-content/70 shrink-0 font-medium">Tên Bảng (Table):</span>
              <input type="text" id="mock-table-name" value="${escapeHtml(this.state.tableName)}" class="input input-bordered input-xs flex-1 font-mono text-xs bg-base-100" placeholder="users..." />
            </div>
          </div>

          <!-- Fields List Builder (Scrollable) -->
          <div class="flex-1 overflow-auto p-3 space-y-2" id="fields-list-container">
            <!-- Dynamically populated rows -->
          </div>

          <!-- Add Field & Regenerate Action Bar -->
          <div class="p-3 bg-base-200/50 border-t border-base-content/10 flex items-center justify-between gap-2 shrink-0">
            <button class="btn btn-outline border-base-content/20 btn-xs text-xs gap-1 font-normal" id="btn-add-field">
              + Thêm cột mới
            </button>
            <button class="btn btn-primary btn-xs text-xs gap-1.5 font-medium shadow-sm" id="btn-generate-mock">
              ${Icons.refresh} <span>Tạo dữ liệu mới</span>
            </button>
          </div>
        </div>

        <!-- Right Column: Result Output & Actions -->
        <div class="lg:col-span-7 card bg-base-100 border border-base-content/10 shadow-sm flex flex-col h-full overflow-hidden">
          <div class="px-3 py-2 bg-base-200/50 border-b border-base-content/10 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-xs text-base-content">Kết quả Dữ liệu giả lập</span>
              <span id="output-meta-badge" class="badge badge-sm badge-ghost font-mono text-[10px]">10 records</span>
            </div>
            <div class="flex items-center gap-1.5">
              <button class="btn btn-ghost btn-xs gap-1" id="btn-copy-mock" title="Sao chép toàn bộ">
                ${Icons.copy} <span class="text-xs">Copy</span>
              </button>
              <button class="btn btn-ghost btn-xs gap-1" id="btn-download-mock" title="Tải về máy">
                ${Icons.download} <span class="text-xs">Tải về</span>
              </button>
            </div>
          </div>

          <!-- Code Viewer Area -->
          <div class="flex-1 p-3 font-code text-xs bg-base-300/30 overflow-auto select-text leading-5">
            <pre id="mock-output-pre" class="whitespace-pre text-base-content"></pre>
          </div>

          <!-- Footer Stats -->
          <div class="px-3 py-1.5 bg-base-200/50 border-t border-base-content/10 flex items-center justify-between text-[11px] text-base-content/60 shrink-0">
            <span id="mock-size-stat">0 B</span>
            <span id="mock-engine-stat" class="font-mono text-primary text-[10px]">MySQL Engine</span>
          </div>
        </div>
      </div>
    `;

    this.renderFieldRows();
  },

  renderFieldRows() {
    const container = this.container.querySelector('#fields-list-container');
    container.innerHTML = '';

    const typeOptions = [
      { group: 'Định danh', items: [
        { val: 'id', label: 'ID Tự tăng (1, 2, 3...)' },
        { val: 'uuid', label: 'UUID v4 ngẫu nhiên' },
        { val: 'code', label: 'Mã số ngẫu nhiên (6 số)' }
      ]},
      { group: 'Thông tin cá nhân (VN)', items: [
        { val: 'name_vn', label: 'Họ và tên Việt Nam' },
        { val: 'phone_vn', label: 'Số điện thoại VN (09x, 03x)' },
        { val: 'email', label: 'Email thực tế (theo tên)' },
        { val: 'city_vn', label: 'Tỉnh / Thành phố VN' },
        { val: 'address_vn', label: 'Địa chỉ nhà VN' }
      ]},
      { group: 'Thông tin Quốc tế (EN)', items: [
        { val: 'name_en', label: 'Full Name (English)' },
        { val: 'avatar', label: 'Avatar URL (Hình ảnh)' }
      ]},
      { group: 'Kinh doanh & Hệ thống', items: [
        { val: 'company', label: 'Tên công ty / Doanh nghiệp' },
        { val: 'role', label: 'Vai trò (admin, developer...)' },
        { val: 'status', label: 'Trạng thái đơn hàng' },
        { val: 'price_vnd', label: 'Giá tiền VNĐ (50k - 5tr)' },
        { val: 'price_usd', label: 'Giá tiền USD ($10 - $999)' },
        { val: 'product', label: 'Tên sản phẩm công nghệ' },
        { val: 'boolean', label: 'Đúng / Sai (true / false)' },
        { val: 'date', label: 'Ngày tháng (ISO YYYY-MM-DD)' }
      ]}
    ];

    this.state.fields.forEach((field, index) => {
      const row = document.createElement('div');
      row.className = 'p-2 rounded-lg bg-base-200/50 border border-base-content/10 flex items-center gap-2 text-xs';

      let optionsHtml = '';
      typeOptions.forEach(grp => {
        optionsHtml += `<optgroup label="${escapeHtml(grp.group)}">`;
        grp.items.forEach(item => {
          optionsHtml += `<option value="${item.val}" ${field.type === item.val ? 'selected' : ''}>${escapeHtml(item.label)}</option>`;
        });
        optionsHtml += `</optgroup>`;
      });

      row.innerHTML = `
        <span class="text-base-content/30 select-none text-[11px] w-4 text-center">${index + 1}</span>
        <input type="text" class="input input-bordered input-xs flex-1 font-mono text-xs field-name-input" value="${escapeHtml(field.name)}" placeholder="Tên cột..." />
        <select class="select select-bordered select-xs w-48 text-xs field-type-select">
          ${optionsHtml}
        </select>
        <button class="btn btn-ghost btn-xs btn-square text-error btn-remove-field" title="Xóa cột">
          ${Icons.trash}
        </button>
      `;

      row.querySelector('.field-name-input').addEventListener('input', (e) => {
        field.name = e.target.value.trim() || `field_${index + 1}`;
        this.generateData();
      });

      row.querySelector('.field-type-select').addEventListener('change', (e) => {
        field.type = e.target.value;
        this.generateData();
      });

      row.querySelector('.btn-remove-field').addEventListener('click', () => {
        if (this.state.fields.length <= 1) {
          showToast('Cần ít nhất 1 cột trong schema', 'warning');
          return;
        }
        this.state.fields.splice(index, 1);
        this.renderFieldRows();
        this.generateData();
      });

      container.appendChild(row);
    });
  },

  bindEvents() {
    // Quantity group
    this.container.querySelectorAll('#mock-qty-group button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('#mock-qty-group button').forEach(b => b.classList.remove('btn-active'));
        btn.classList.add('btn-active');
        this.state.count = parseInt(btn.dataset.count, 10);
        this.generateData();
      });
    });

    // Format Select
    const formatSelect = this.container.querySelector('#select-mock-format');
    const tableConfigRow = this.container.querySelector('#table-config-row');
    const tableConfigLabel = this.container.querySelector('#table-config-label');

    const updateTableConfigVisibility = () => {
      const fmt = this.state.format;
      if (['mysql', 'postgres', 'sqlite', 'mssql'].includes(fmt)) {
        tableConfigRow.classList.remove('hidden');
        tableConfigLabel.textContent = 'Tên Bảng (Table):';
      } else if (['mongodb', 'mongo_jsonl'].includes(fmt)) {
        tableConfigRow.classList.remove('hidden');
        tableConfigLabel.textContent = 'Tên Collection:';
      } else {
        tableConfigRow.classList.add('hidden');
      }
    };

    formatSelect.addEventListener('change', () => {
      this.state.format = formatSelect.value;
      updateTableConfigVisibility();
      this.formatAndDisplay();
    });
    updateTableConfigVisibility();

    // Table / Collection Name input
    const tableNameInput = this.container.querySelector('#mock-table-name');
    tableNameInput.addEventListener('input', () => {
      this.state.tableName = tableNameInput.value.trim() || 'users';
      this.formatAndDisplay();
    });

    // Add field button
    this.container.querySelector('#btn-add-field').addEventListener('click', () => {
      this.state.fields.push({
        name: `column_${this.state.fields.length + 1}`,
        type: 'name_vn'
      });
      this.renderFieldRows();
      this.generateData();
    });

    // Regenerate button
    this.container.querySelector('#btn-generate-mock').addEventListener('click', () => {
      this.generateData();
      showToast('Đã sinh dữ liệu mới', 'success');
    });

    // Copy button
    this.container.querySelector('#btn-copy-mock').addEventListener('click', () => {
      if (!this.state.generatedOutput) return;
      navigator.clipboard.writeText(this.state.generatedOutput);
      showToast('Đã sao chép dữ liệu vào clipboard!', 'success');
    });

    // Download button
    this.container.querySelector('#btn-download-mock').addEventListener('click', () => {
      this.downloadData();
    });

    // Schema Presets
    this.container.querySelectorAll('.btn-schema-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadSchemaPreset(btn.dataset.preset);
      });
    });
  },

  loadSchemaPreset(preset) {
    if (preset === 'users') {
      this.state.tableName = 'users';
      this.state.fields = [
        { name: 'id', type: 'id' },
        { name: 'full_name', type: 'name_vn' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone_vn' },
        { name: 'city', type: 'city_vn' },
        { name: 'role', type: 'role' },
        { name: 'is_active', type: 'boolean' }
      ];
    } else if (preset === 'orders') {
      this.state.tableName = 'orders';
      this.state.fields = [
        { name: 'order_id', type: 'uuid' },
        { name: 'customer_name', type: 'name_vn' },
        { name: 'product', type: 'product' },
        { name: 'amount', type: 'price_vnd' },
        { name: 'status', type: 'status' },
        { name: 'order_date', type: 'date' }
      ];
    } else if (preset === 'posts') {
      this.state.tableName = 'posts';
      this.state.fields = [
        { name: 'id', type: 'id' },
        { name: 'title', type: 'product' },
        { name: 'author', type: 'name_vn' },
        { name: 'views', type: 'code' },
        { name: 'published', type: 'boolean' },
        { name: 'created_at', type: 'date' }
      ];
    }

    this.container.querySelector('#mock-table-name').value = this.state.tableName;
    this.renderFieldRows();
    this.generateData();
    showToast(`Đã nạp mẫu Schema: ${preset}`, 'success');
  },

  generateData() {
    const items = [];
    for (let i = 1; i <= this.state.count; i++) {
      const row = {};
      const generatedPerson = this.generateRandomPerson();

      for (const field of this.state.fields) {
        row[field.name] = this.generateFieldValue(field.type, i, generatedPerson);
      }
      items.push(row);
    }

    this.state.rawItems = items;
    this.formatAndDisplay();
  },

  generateRandomPerson() {
    const isMale = Math.random() > 0.5;
    const ho = this.pickRandom(this.dataSets.ho);
    const dem = isMale ? this.pickRandom(this.dataSets.demNam) : this.pickRandom(this.dataSets.demNu);
    const ten = isMale ? this.pickRandom(this.dataSets.tenNam) : this.pickRandom(this.dataSets.tenNu);
    const fullNameVn = `${ho} ${dem} ${ten}`;

    const cleanUsername = `${ten.toLowerCase()}.${this.removeVietnameseTones(ho).toLowerCase()}${Math.floor(Math.random() * 899 + 100)}`;
    const email = `${cleanUsername}@${this.pickRandom(this.dataSets.domains)}`;

    return { fullNameVn, email };
  },

  generateFieldValue(type, index, person) {
    switch (type) {
      case 'id':
        return index;
      case 'uuid':
        return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `018e69d7-84a1-79b8-${Math.random().toString(16).slice(2, 6)}-${Date.now().toString(16).slice(-12)}`;
      case 'code':
        return Math.floor(100000 + Math.random() * 900000);
      case 'name_vn':
        return person.fullNameVn;
      case 'name_en':
        return `${this.pickRandom(this.dataSets.enFirst)} ${this.pickRandom(this.dataSets.enLast)}`;
      case 'email':
        return person.email;
      case 'phone_vn':
        return `0${this.pickRandom(['3', '5', '7', '8', '9'])}${Math.floor(10000000 + Math.random() * 90000000)}`;
      case 'city_vn':
        return this.pickRandom(this.dataSets.cities);
      case 'address_vn':
        return `${Math.floor(Math.random() * 200 + 1)} ${this.pickRandom(this.dataSets.streets)}, ${this.pickRandom(this.dataSets.cities)}`;
      case 'avatar':
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.fullNameVn)}`;
      case 'company':
        return this.pickRandom(this.dataSets.companies);
      case 'role':
        return this.pickRandom(this.dataSets.roles);
      case 'status':
        return this.pickRandom(this.dataSets.orderStatus);
      case 'price_vnd':
        return Math.floor(Math.random() * 99 + 1) * 50000;
      case 'price_usd':
        return parseFloat((Math.random() * 900 + 10).toFixed(2));
      case 'product':
        return this.pickRandom(this.dataSets.products);
      case 'boolean':
        return Math.random() > 0.3;
      case 'date': {
        const d = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
        return d.toISOString().split('T')[0];
      }
      default:
        return 'Sample Value';
    }
  },

  formatAndDisplay() {
    const outputPre = this.container.querySelector('#mock-output-pre');
    const metaBadge = this.container.querySelector('#output-meta-badge');
    const sizeStat = this.container.querySelector('#mock-size-stat');
    const engineStat = this.container.querySelector('#mock-engine-stat');

    let result = '';
    const fmt = this.state.format;

    if (fmt === 'mysql') {
      result = this.generateMySqlInsert();
      engineStat.textContent = '🐬 MySQL Engine';
      metaBadge.textContent = `${this.state.rawItems.length} records (MySQL)`;
    } else if (fmt === 'postgres') {
      result = this.generatePostgreSqlInsert();
      engineStat.textContent = '🐘 PostgreSQL Engine';
      metaBadge.textContent = `${this.state.rawItems.length} records (PostgreSQL)`;
    } else if (fmt === 'mssql') {
      result = this.generateMsSqlInsert();
      engineStat.textContent = '🏢 MS SQL Server (T-SQL)';
      metaBadge.textContent = `${this.state.rawItems.length} records (SQL Server)`;
    } else if (fmt === 'sqlite') {
      result = this.generateSqliteInsert();
      engineStat.textContent = '🪶 SQLite Engine';
      metaBadge.textContent = `${this.state.rawItems.length} records (SQLite)`;
    } else if (fmt === 'mongodb') {
      result = this.generateMongoDbScript();
      engineStat.textContent = '🍃 MongoDB insertMany()';
      metaBadge.textContent = `${this.state.rawItems.length} documents (MongoDB)`;
    } else if (fmt === 'mongo_jsonl') {
      result = this.generateMongoJsonl();
      engineStat.textContent = '🍃 mongoimport JSONL';
      metaBadge.textContent = `${this.state.rawItems.length} lines (JSONL)`;
    } else if (fmt === 'json') {
      result = JSON.stringify(this.state.rawItems, null, 2);
      engineStat.textContent = '{} Standard JSON';
      metaBadge.textContent = `${this.state.rawItems.length} objects (JSON)`;
    } else if (fmt === 'csv') {
      result = this.generateCsv();
      engineStat.textContent = '📊 CSV / Spreadsheets';
      metaBadge.textContent = `${this.state.rawItems.length} rows (CSV)`;
    }

    this.state.generatedOutput = result;
    outputPre.textContent = result;

    const bytes = new Blob([result]).size;
    sizeStat.textContent = bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
  },

  // MySQL: uses backticks `table` (`col1`, `col2`), boolean as 1/0
  generateMySqlInsert() {
    if (this.state.rawItems.length === 0) return '';
    const columns = this.state.fields.map(f => f.name);
    const table = this.state.tableName || 'users';

    let sql = `-- MySQL INSERT script generated by DevPulse\n`;
    sql += `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`)\nVALUES\n`;

    const valueRows = this.state.rawItems.map(item => {
      const vals = columns.map(col => {
        const val = item[col];
        if (typeof val === 'number') return val;
        if (typeof val === 'boolean') return val ? 1 : 0;
        if (val === null || val === undefined) return 'NULL';
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      return `  (${vals.join(', ')})`;
    });

    sql += valueRows.join(',\n') + ';';
    return sql;
  },

  // PostgreSQL: uses double quotes "table" ("col1", "col2"), native boolean true/false
  generatePostgreSqlInsert() {
    if (this.state.rawItems.length === 0) return '';
    const columns = this.state.fields.map(f => f.name);
    const table = this.state.tableName || 'users';

    let sql = `-- PostgreSQL INSERT script generated by DevPulse\n`;
    sql += `INSERT INTO "${table}" ("${columns.join('", "')}")\nVALUES\n`;

    const valueRows = this.state.rawItems.map(item => {
      const vals = columns.map(col => {
        const val = item[col];
        if (typeof val === 'number') return val;
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (val === null || val === undefined) return 'NULL';
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      return `  (${vals.join(', ')})`;
    });

    sql += valueRows.join(',\n') + ';';
    return sql;
  },

  // Microsoft SQL Server (T-SQL): uses square brackets [table] ([col1], [col2]), Unicode N'...' prefix, boolean as 1/0
  generateMsSqlInsert() {
    if (this.state.rawItems.length === 0) return '';
    const columns = this.state.fields.map(f => f.name);
    const table = this.state.tableName || 'users';

    let sql = `-- Microsoft SQL Server (T-SQL) INSERT script generated by DevPulse\n`;
    sql += `-- Gợi ý: Nếu bảng dùng IDENTITY cho cột ID, hãy chạy: SET IDENTITY_INSERT [${table}] ON;\n`;
    sql += `INSERT INTO [${table}] ([${columns.join('], [')}])\nVALUES\n`;

    const valueRows = this.state.rawItems.map(item => {
      const vals = columns.map(col => {
        const val = item[col];
        if (typeof val === 'number') return val;
        if (typeof val === 'boolean') return val ? 1 : 0;
        if (val === null || val === undefined) return 'NULL';
        return `N'${String(val).replace(/'/g, "''")}'`;
      });
      return `  (${vals.join(', ')})`;
    });

    sql += valueRows.join(',\n') + ';';
    return sql;
  },

  // SQLite: standard SQL with double quotes "table" ("col1", "col2"), boolean as 1/0
  generateSqliteInsert() {
    if (this.state.rawItems.length === 0) return '';
    const columns = this.state.fields.map(f => f.name);
    const table = this.state.tableName || 'users';

    let sql = `-- SQLite INSERT script generated by DevPulse\n`;
    sql += `INSERT INTO "${table}" ("${columns.join('", "')}")\nVALUES\n`;

    const valueRows = this.state.rawItems.map(item => {
      const vals = columns.map(col => {
        const val = item[col];
        if (typeof val === 'number') return val;
        if (typeof val === 'boolean') return val ? 1 : 0;
        if (val === null || val === undefined) return 'NULL';
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      return `  (${vals.join(', ')})`;
    });

    sql += valueRows.join(',\n') + ';';
    return sql;
  },

  // MongoDB: db.collection.insertMany([...])
  generateMongoDbScript() {
    if (this.state.rawItems.length === 0) return '';
    const coll = this.state.tableName || 'users';
    const jsonStr = JSON.stringify(this.state.rawItems, null, 2);

    let script = `// MongoDB insertMany() script generated by DevPulse\n`;
    script += `// Paste into mongosh or MongoDB Compass\n`;
    script += `db.${coll}.insertMany(${jsonStr});`;
    return script;
  },

  // MongoDB mongoimport JSON Lines (JSONL)
  generateMongoJsonl() {
    if (this.state.rawItems.length === 0) return '';
    return this.state.rawItems.map(item => JSON.stringify(item)).join('\n');
  },

  generateCsv() {
    if (this.state.rawItems.length === 0) return '';
    const columns = this.state.fields.map(f => f.name);
    let csv = columns.join(',') + '\n';

    this.state.rawItems.forEach(item => {
      const row = columns.map(col => {
        let val = item[col];
        if (val === null || val === undefined) return '';
        val = String(val);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csv += row.join(',') + '\n';
    });

    return csv;
  },

  downloadData() {
    if (!this.state.generatedOutput) return;
    const fmt = this.state.format;
    let ext = 'json';
    let mime = 'application/json';

    if (['mysql', 'postgres', 'sqlite', 'mssql'].includes(fmt)) {
      ext = `${fmt}.sql`;
      mime = 'application/sql';
    } else if (fmt === 'mongodb') {
      ext = 'mongo.js';
      mime = 'application/javascript';
    } else if (fmt === 'mongo_jsonl') {
      ext = 'jsonl';
      mime = 'application/x-ndjson';
    } else if (fmt === 'csv') {
      ext = 'csv';
      mime = 'text/csv';
    }

    const blob = new Blob([this.state.generatedOutput], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock_${this.state.tableName}_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã tải về file mock.${ext}`, 'success');
  },

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  removeVietnameseTones(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }
};
