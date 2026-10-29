# ⚡ DevPulse - Bộ Công Cụ Lập Trình Viên Đa Năng (Developer Multi-Tools Suite)

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

### 3. 🛡️ Base64 & URL Codec (Công cụ bổ sung mẫu) (`#base64-codec`)
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

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development):
```bash
npm run dev
```
Truy cập trình duyệt: `http://localhost:5173/`

### 3. Đóng gói cho Production (Build):
```bash
npm run build
```
Thư mục xuất bản tối ưu sẽ nằm trong `dist/`.
