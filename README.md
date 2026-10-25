# Dự án Thiệp Cưới Online Cao Cấp - Đức Thắng & Kiều Trang

Chào mừng bạn đến với dự án trang web **Thiệp Cưới Online (Wedding Invitation)**! Dự án này được thiết kế theo phong cách hiện đại, tinh tế và đầy đủ tính năng tương tác chất lượng cao để cô dâu & chú rể gửi lời mời đến người thân, bạn bè.

## 📌 Các Tính Năng Nổi Bật
1. **Thiết kế sang trọng**: Tông màu chủ đạo Vàng kim & Hồng đào nhã nhặn, font chữ bay bổng nghệ thuật.
2. **Bì thư tương tác (Envelope Cover)**: Tạo cảm giác hồi hộp, trang trọng khi mở thiệp.
3. **Phát nhạc nền tự động (Background Music)**: Nhạc piano lãng mạn du dương có nút tắt/bật nổi.
4. **Bộ đếm ngược thời gian thực (Countdown Timer)**: Đếm ngược từng giây đến ngày tổ chức hôn lễ.
5. **Album ảnh cưới tương tác (Photo Gallery Lightbox)**: Click phóng to ảnh, chuyển slide mượt mà.
6. **Xác nhận tham dự (RSVP Form)**: Khách mời báo tin có đi được hay không, số người đi cùng và gửi lời chúc.
7. **Sổ lưu bút lời chúc (Guestbook)**: Khách gửi lời chúc trực tiếp lên trang web và hiển thị ngay lập tức.
8. **Mừng cưới online (Wishing Well QR)**: Hiển thị mã QR tài khoản ngân hàng của cô dâu & chú rể kèm số tài khoản chi tiết.
9. **Trang Quản trị RSVP (`admin.html`)**: Giúp cô dâu & chú rể xem danh sách khách đã xác nhận tham dự, số người đi cùng, xuất dữ liệu ra file Excel/CSV cực kỳ nhanh chóng.

---

## 💻 Hướng Dẫn Sử Dụng & Chỉnh Sửa Trên Visual Studio Code

### Bước 1: Mở dự án trong VS Code
1. Mở phần mềm **Visual Studio Code** đã được cài đặt trên máy tính của bạn.
2. Trên thanh menu, chọn **File** -> **Open Folder...** (hoặc dùng phím tắt `Ctrl + K` tiếp đó `Ctrl + O`).
3. Tìm đến ổ đĩa **D:**, chọn thư mục **`thiep-cuoi`** và bấm **Select Folder**.

### Bước 2: Chạy thử trang web cục bộ (Xem trực tiếp)
Để xem các thay đổi ngay khi bạn sửa code mà không cần tải lại trang thủ công, hãy sử dụng extension **Live Server**:
1. Trong VS Code, nhấn tổ hợp phím `Ctrl + Shift + X` (hoặc click biểu tượng các khối vuông ở thanh bên trái) để mở kho Extension.
2. Gõ tìm kiếm **"Live Server"** (tác giả *Ritwick Dey*).
3. Bấm **Install** để cài đặt.
4. Sau khi cài xong, mở file `index.html`. Nhìn xuống góc dưới cùng bên phải màn hình VS Code sẽ thấy nút **`Go Live`** (hoặc click chuột phải vào file `index.html` chọn **`Open with Live Server`**).
5. Trình duyệt web sẽ tự động mở lên với địa chỉ `http://127.0.0.1:5500/index.html` và hiển thị thiệp cưới của bạn.

---

## 🛠️ Cách Tùy Chỉnh Thông Tin Của Bạn

Bạn có thể chỉnh sửa mọi thông tin một cách đơn giản bằng cách thay thế các đoạn văn bản trong file code:

### 1. Thay đổi tên, ngày cưới và địa điểm
Mở file **`index.html`**:
- **Tên cô dâu & chú rể**: Tìm các từ khóa `Đức Thắng` và `Kiều Trang` rồi sửa thành tên của bạn.
- **Ngày cưới**: Tìm ngày `25 . 10 . 2026` và sửa lại đúng ngày tổ chức cưới của bạn.
- **Địa điểm & Bản đồ**: Tìm địa chỉ `Số 12, Ngõ 45, Đường Kim Mã...` và `JW Marriott` để cập nhật địa chỉ tư gia của bạn. Thay thế đường link trong thuộc tính `href` của nút **Xem Bản Đồ** (`https://maps.google.com...`) bằng link Google Maps vị trí thực tế của bạn.

### 2. Thiết lập đồng hồ đếm ngược
Mở file **`script.js`**:
Mặc định đồng hồ đếm ngược được lập trình tự động là 60 ngày sau kể từ ngày mở web để bạn chạy thử nghiệm. Để sửa thành ngày cưới thật của bạn, hãy tìm đến phần `1. DYNAMIC WEDDING DATE & COUNTDOWN` và làm theo hướng dẫn:
- Bỏ chú thích và chỉnh lại ngày của bạn ở dòng:
  ```javascript
  const COUNTDOWN_TARGET = new Date("2026-10-25T09:00:00").getTime();
  ```
- Xóa hoặc chú thích 3 dòng code tính ngày động ngay phía dưới nó.

### 3. Thay đổi hình ảnh & nhạc nền
- **Ảnh đại diện & Ảnh cưới**:
  - Bạn có thể copy ảnh cưới của bạn vào thư mục `assets/images/`.
  - Mở file `index.html` và tìm các thẻ `<img src="https://images.unsplash.com..." ...>` rồi sửa đường dẫn `src` thành đường dẫn ảnh nội bộ của bạn (Ví dụ: `assets/images/groom.jpg`, `assets/images/bride.jpg`, `assets/images/anh-cuoi-1.jpg`).
- **Nhạc nền**:
  - Tải file nhạc `.mp3` bạn yêu thích vào thư mục `assets/music/` (ví dụ đặt tên là `nhac-nen.mp3`).
  - Mở file `index.html`, tại thẻ `<audio id="bg-music">`, sửa đường dẫn `src` ở thẻ `<source>` thành `assets/music/nhac-nen.mp3`.

### 4. Cấu hình mã QR Tài khoản Ngân hàng
Mở file **`index.html`**:
Tìm đến khu vực mừng cưới ở cuối trang, thay đổi Số tài khoản, Tên tài khoản ngân hàng của bạn.
- Đoạn mã QR ngân hàng sử dụng API tạo QR miễn phí. Bạn chỉ cần sửa thông tin trong link QR để nó tự động tạo QR đúng tài khoản của bạn:
  - Sửa `STK:190367899999-Techcombank-NguyenQuocBao` thành thông tin của chú rể.
  - Sửa `STK:999988887777-Vietcombank-TranKhanhLinh` thành thông tin của cô dâu.
  *(Hoặc bạn có thể tự xuất ảnh QR của ngân hàng mình, lưu vào thư mục `assets/images/` rồi trỏ đường dẫn ảnh tới đó).*

### 5. Quản lý danh sách khách xác nhận tham dự (RSVP)
- Để xem danh sách khách mời đã điền form RSVP trên thiệp mời, bạn chỉ cần mở file **`admin.html`** trên trình duyệt (hoặc chạy qua Live Server).
- Giao diện Admin cho phép bạn lọc danh sách khách, tìm kiếm và đặc biệt là nút **Xuất File CSV** để tải file danh sách khách mời về máy tính, mở bằng Excel vô cùng tiện lợi.

---

## 🚀 Hướng Dẫn Đưa Trang Web Lên Mạng Miễn Phí (Hosting)

Khi đã chỉnh sửa ưng ý, bạn có thể tải trang web này lên mạng hoàn toàn miễn phí để lấy đường link gửi cho mọi người:

### Cách 1: Sử dụng GitHub Pages (Khuyên dùng)
1. Tạo một tài khoản trên [GitHub.com](https://github.com).
2. Tạo một Repository mới với chế độ Public (ví dụ tên là `wedding-invitation`).
3. Tải toàn bộ các file trong thư mục `D:\thiep-cuoi` lên Repository đó.
4. Vào mục **Settings** (Cài đặt) của Repository -> chọn mục **Pages** ở cột bên trái.
5. Tại phần **Build and deployment**, chọn Branch là `main` (hoặc `master`) rồi bấm **Save**.
6. Chờ khoảng 1-2 phút, GitHub sẽ cung cấp cho bạn một đường link trang web trực tuyến (dạng `https://username.github.io/wedding-invitation/`).

### Cách 2: Sử dụng Netlify (Cực kỳ nhanh chóng)
1. Truy cập vào trang web [Netlify.com](https://www.netlify.com) và đăng ký tài khoản miễn phí.
2. Chọn mục **Sites** -> Kéo xuống phần **"Drag and drop your site folder here"**.
3. Kéo toàn bộ thư mục `thiep-cuoi` từ máy tính của bạn và thả vào ô đó.
4. Netlify sẽ tự động triển khai và cung cấp cho bạn một đường link trang web ngẫu nhiên có thể truy cập ngay lập tức. Bạn có thể vào Cài đặt để đổi tên miền ngẫu nhiên đó thành tên dễ nhớ hơn (ví dụ: `baolinh-wedding.netlify.app`).

Chúc hai bạn có một đám cưới trọn vẹn niềm vui và trăm năm hạnh phúc! 🌸💍
