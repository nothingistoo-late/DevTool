# ⚡ DevPulse - Bộ Công Cụ Lập Trình Viên Đa Năng (Developer Multi-Tools Suite)

> 🌐 **Truy cập trực tiếp online tại:** [https://devtool-indol.vercel.app](https://devtool-indol.vercel.app)

**DevPulse** là một ứng dụng web hiện đại, tốc độ cao dành cho lập trình viên. Dự án được thiết kế theo kiến trúc **Module cắm rút (Plugin Architecture)**, giúp bạn cực kỳ dễ dàng mở rộng và bổ sung hàng loạt công cụ dev trong tương lai.

---

## 🚀 Các Công Cụ Đã Được Tích Hợp

### 1. 🗂️ JSON Formatter & Validator (`#json-formatter`)
- **Định dạng & Làm đẹp (Beautify)**: Tùy chọn thụt lề 2 spaces, 4 spaces hoặc Tab.
- **Nén mã (Minify)**: Thu gọn JSON thành 1 dòng siêu gọn.
- **Highlight cú pháp (Syntax Highlighting)**: Màu sắc riêng biệt cho `keys`, `strings`, `numbers`, `booleans`, `null` với số dòng (line numbers).
- **Cây dữ liệu trực quan (Interactive Tree View)**:
  - Cho phép đóng/mở từng node, mở rộng/thu gọn tất cả.
  - Hiển thị số lượng phần tử của Object `{n}` và Array `[n]`.
  - **Copy Path tiện lợi**: Click để copy ngay đường dẫn thuộc tính (ví dụ: `author.roles[0]`).
- **Linter & Kiểm tra lỗi thời gian thực**: Chỉ rõ vị trí dòng, cột bị lỗi cú pháp kèm thông báo chi tiết.
- **Tự động sửa lỗi (Auto-Fix Malformed JSON)**: Tự động sửa nháy đơn thành nháy kép, bỏ dấu phẩy thừa (trailing commas), tự bọc ngoặc kép cho keys chưa có quotes.
- **Sắp xếp Keys (Sort Keys)**: Sắp xếp theo A-Z hoặc Z-A theo dạng đệ quy.
- **Thống kê chi tiết**: Kích thước (B/KB), tỷ lệ nén %, tổng số keys, độ sâu lồng nhau (max depth), tổng số dòng.
- **Nhập/Xuất**: Upload file JSON từ máy tính, Copy clipboard một chạm, Download file formatted `.json`.

---

### 2. 🔍 Text Diff & Comparison - So Sánh Văn Bản & Highlight Chi Tiết (`#text-diff`)
- **Highlight chính xác từng từ & từng ký tự (Word-level & Character-level Highlight)**:
  - Điểm khác biệt được đánh dấu trực quan: màu xanh lá mềm cho phần **thêm mới**, màu đỏ hồng cho phần **xóa bỏ**.
  - Phần chữ/từ bị thay đổi bên trong dòng sẽ được highlight nổi bật (Pill highlight), giúp nhìn thấy ngay lập tức chỗ khác nhau kể cả với thay đổi nhỏ nhất.
- **2 chế độ xem linh hoạt**:
  - **Side-by-Side (Split View)**: Xem song song 2 cột với thanh cuộn đồng bộ (Synchronized scrolling).
  - **Unified (Inline View)**: Xem gộp theo phong cách Git patch với số dòng cũ và mới.
- **Cấp độ so sánh (Granularity)**:
  - `Word Level`: Highlight từng từ thay đổi.
  - `Char Level`: Highlight chi tiết đến từng ký tự/chữ cái.
  - `Line Only`: So sánh theo từng khối dòng.
- **Tùy chọn lọc thông minh**:
  - Bỏ qua khoảng trắng thừa (Ignore whitespace).
  - Không phân biệt chữ hoa/thường (Ignore case).
- **Điều hướng thay đổi (Diff Navigator)**:
  - Nút **Prev (↑)** / **Next (↓)** để tự động cuộn màn hình đến đúng vị trí khối khác biệt tiếp theo và tạo viền sáng focus.
- **Tính năng mở rộng**:
  - Đổi chiều nhanh (Swap sides `⇄`) giữa bản gốc và bản sửa đổi.
  - Sao chép Git Unified Patch chuẩn (`Copy Patch`).
  - Nạp các đoạn code mẫu, upload file từ máy tính.

---

### 3. 🎭 Mock Data / Fake Data Generator (`#mock-data-generator`)
- **Sinh dữ liệu thử nghiệm siêu thực tế**:
  - Tên tiếng Việt có dấu đầy đủ (*Nguyễn Văn An, Trần Thị Mai...*) hoặc tên tiếng Anh (*James Smith...*).
  - Email theo tên (*an.nguyen@gmail.com*), SĐT Việt Nam (09x, 03x), Tỉnh/Thành phố VN, Địa chỉ nhà.
  - Chức vụ, công ty (*FPT, VNG, Viettel...*), đơn hàng, giá tiền VNĐ/USD, UUID, Avatar URL.
- **Trình tạo Schema tùy biến**:
  - Tự do thêm, bớt, đổi tên các cột theo ý muốn.
  - Có sẵn các Schema mẫu: *Danh sách Người dùng (Users)*, *Đơn hàng E-Commerce (Orders)*, *Bài viết Blog (Posts)*.
- **Xuất đa định dạng CSDL (Multi-Database Export)**:
  - 🐬 **MySQL**: `INSERT INTO \`table\` (\`col\`) VALUES (...);` (chuẩn cú pháp backticks, boolean 1/0).
  - 🐘 **PostgreSQL**: `INSERT INTO "table" ("col") VALUES (...);` (chuẩn double quotes, boolean `true`/`false`).
  - 🏢 **Microsoft SQL Server (T-SQL)**: `INSERT INTO [table] ([col]) VALUES (...);` (dấu ngoặc vuông `[...]`, prefix `N'...'` bảo toàn Unicode tiếng Việt, boolean `1`/`0`).
  - 🪶 **SQLite**: `INSERT INTO "table" VALUES (...);`.
  - 🍃 **MongoDB insertMany()**: `db.collection.insertMany([...]);` (dán thẳng vào Mongo Compass / mongosh).
  - 🍃 **MongoDB JSONL**: Định dạng JSON Lines chuẩn cho lệnh `mongoimport`.
  - **JSON Array**: `[{...}]`.
  - **CSV**: Tương thích hoàn toàn với Excel / Google Sheets.
  - Cho phép tùy biến tên bảng SQL hoặc tên Collection MongoDB!

---

### 4. 🌐 Mini REST API & Webhook Client (`#rest-client`)
- **Postman thu nhỏ ngay trong trình duyệt**:
  - Hỗ trợ đầy đủ các phương thức HTTP: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`.
  - Tích hợp sẵn các API công cộng mẫu để test nhanh (*JSONPlaceholder, httpbin, GitHub Zen*).
- **Bộ cấu hình Request linh hoạt**:
  - Bảng tham số **Params** tự động đồng bộ 2 chiều với query string của URL.
  - Bảng tùy chỉnh **Headers** (`Content-Type`, `Authorization: Bearer`...).
  - Trình soạn thảo **JSON Body** có tính năng Beautify format tự động.
- **Xem phản hồi chi tiết (Response Inspector)**:
  - Trực quan hóa mã trạng thái HTTP: `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`.
  - Đo thời gian phản hồi chính xác tính theo mili-giây (**Latency ms**) và dung lượng payload.
  - Xem Response Body có định dạng JSON và xem toàn bộ Response Headers trả về.

---

### 5. 🔍 Regex Tester & Cheatsheet (`#regex-tester`)
- **Kiểm thử Regex thời gian thực**:
  - Hỗ trợ đầy đủ cờ flags: `g` (global), `i` (case-insensitive), `m` (multiline), `s` (dotAll).
  - Tự động bắt lỗi cú pháp regex kèm thông báo rõ ràng.
- **Phân tích chi tiết Matches & Capture Groups**:
  - Liệt kê toàn bộ các match tìm thấy kèm vị trí chỉ mục (index range).
  - Phân tách từng Capture Group `$1`, `$2`... trực quan.
- **Tính năng thay thế chuỗi (Replace)**:
  - Xem trước kết quả thay thế theo thời gian thực (hỗ trợ `$1`, `$2`).
- **Thư viện Regex mẫu (1-click load)**:
  - Email, URL, SĐT Việt Nam, IPv4, UUID, Ngày tháng (YYYY-MM-DD), Mã màu Hex...
- **Bảng tra cứu Cheatsheet**:
  - Tổng hợp nhanh các ký tự đặc biệt, lượng từ (quantifiers), nhóm và lookaround.

---

### 4. 🛡️ JWT Token Debugger & Verifier (`#jwt-debugger`)
- **Giải mã 3 phần có màu sắc trực quan**:
  - Header (đỏ hồng), Payload (tím), Signature (xanh dương).
- **Phân tích hạn sử dụng thông minh**:
  - Tự động tính toán thời gian hết hạn (`exp`) và hiển thị đếm ngược: *"Còn hạn trong X phút"* hoặc *"Đã hết hạn Y giờ trước"*.
  - Hiển thị ngày giờ phát hành (`iat`), đối tượng (`sub`), nhà phát hành (`iss`).
- **Xác minh chữ ký Client-side (HMAC-SHA256)**:
  - Nhập Secret Key để xác minh xem token có bị làm giả hay không thông qua Web Crypto API.
  - Bảo mật tuyệt đối: Token không bao giờ bị gửi lên server.

---

### 5. 🔑 GUID / UUID Generator & Inspector (`#guid-generator`)
- **Tạo hàng loạt GUID/UUID đa phiên bản**:
  - `UUID v4`: Ngẫu nhiên mã hóa an toàn (`crypto.randomUUID()`).
  - `UUID v7`: Sắp xếp theo mốc thời gian (RFC 9562), cực kỳ tối ưu cho Primary Key cơ sở dữ liệu.
  - `UUID v1`: Timestamp + Node ID.
  - `Nil UUID`: `00000000-0000-0000-0000-000000000000`.
- **Tùy chọn định dạng phong phú**:
  - Chữ hoa / chữ thường, có/không gạch ngang, ngoặc nhọn `{...}`, ngoặc tròn `(...)`, nháy kép/đơn.
  - Xuất code: Danh sách, Mảng JSON, C# `Guid.Parse("...")`, SQL `IN ('...', '...')`.
- **Inspector & Validator**:
  - Kiểm tra tính hợp lệ và trích xuất ngược lại ngày giờ khởi tạo chính xác từ UUID v7 và v1.

---

### 6. 🔤 Base64 & URL Codec (`#base64-codec`)
- Mã hóa & giải mã Base64 (hỗ trợ Unicode tiếng Việt đầy đủ).
- URL Encode / Decode (`encodeURIComponent`).
- Hexadecimal conversion.

---

## 🛠️ Kiến Trúc Module: Hướng Dẫn Thêm Tool Mới Cực Dễ

Dự án được cấu trúc để bạn có thể thêm bất kỳ tool nào mới chỉ trong 2 bước:

### Cấu trúc thư mục:
```text
DevTool/
├── src/
│   ├── core/
│   │   ├── icons.js        # Kho biểu tượng SVG sắc nét
│   │   ├── registry.js     # Đăng ký & quản lý danh mục công cụ
│   │   └── toast.js        # Thông báo Toast nổi bật
│   ├── tools/
│   │   ├── json-formatter.js   # Công cụ JSON
│   │   ├── text-diff.js        # Công cụ Text Diff
│   │   ├── base64-tool.js      # Công cụ Base64
│   │   └── my-new-tool.js      # Tool mới của bạn!
│   ├── style.css           # Design system (Dark/Light mode, biến CSS)
│   └── main.js             # Bộ điều hướng, Command Palette (Ctrl+K)
├── package.json
└── index.html
```

### Cách tạo thêm 1 Tool mới (ví dụ: Regex Tester hoặc JWT Decoder):

1. Tạo file `src/tools/jwt-debugger.js`:
```javascript
import { Icons } from '../core/icons.js';
import { showToast } from '../core/toast.js';

export const JwtDebuggerTool = {
  id: 'jwt-debugger',
  title: 'JWT Token Debugger',
  shortTitle: 'JWT Debugger',
  category: 'Security & Auth',
  icon: Icons.shield,
  badge: 'New',
  description: 'Decode and inspect JSON Web Tokens headers and payload.',
  tags: ['jwt', 'token', 'auth', 'decode', 'security'],

  init(container) {
    container.innerHTML = `
      <div class="json-panel" style="padding:20px;">
        <h3>Dán JWT token vào đây:</h3>
        <textarea class="editor-textarea" style="height:120px;margin-top:10px;"></textarea>
      </div>
    `;
  },

  destroy() {
    // Dọn dẹp listener nếu cần
  }
};
```

2. Đăng ký vào `src/core/registry.js`:
```javascript
import { JwtDebuggerTool } from '../tools/jwt-debugger.js';

export const ToolRegistry = {
  tools: [
    JsonFormatterTool,
    TextDiffTool,
    Base64Tool,
    JwtDebuggerTool // <-- Thêm vào đây!
  ],
  // ...
};
```
👉 Tool mới sẽ **tự động xuất hiện** trên thanh Sidebar, Command Palette (`Ctrl + K`), URL routing (`#jwt-debugger`) và công cụ tìm kiếm mà không cần sửa giao diện chính!

---

## ⌨️ Phím Tắt Tiện Lợi (Keyboard Shortcuts)
- **`Ctrl + K`** hoặc **`Cmd + K`**: Mở Command Palette để tìm kiếm và chuyển đổi nhanh giữa các tool.
- **`Ctrl + Enter`**: Định dạng nhanh JSON trong JSON Formatter.
- **`ESC`**: Đóng nhanh hộp thoại tìm kiếm.

---

## 💻 Cách Khởi Chạy Dự Án

### 🌐 1. Truy cập trực tiếp (Không cần cài đặt):
Bạn có thể sử dụng ngay bộ công cụ online hoàn toàn miễn phí tại:
👉 **[https://devtool-indol.vercel.app](https://devtool-indol.vercel.app)**

### 2. Cài đặt & Chạy trên máy cá nhân (Local):
```bash
npm install
npm run dev
```
Truy cập trình duyệt: `http://localhost:5173/`

### 3. Đóng gói cho Production (Build):
```bash
npm run build
```
Thư mục xuất bản tối ưu sẽ nằm trong `dist/`.
