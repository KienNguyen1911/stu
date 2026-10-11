# ADR-001: Kiến trúc Flow Studio mới

## Trạng thái

Đã chấp thuận (Accepted) — Ngày: 10/10/2026

## Bối cảnh

Phiên bản thử nghiệm trước gặp các vấn đề nghiêm trọng về kiến trúc:

1. Khái niệm nghiệp vụ bị chồng chéo: dùng UUID local nhầm với Google Identity, trộn lẫn project local và Flow project remote.
2. Metadata rải rác ở nhiều file JSON và Map trong bộ nhớ; hai hệ thống theo dõi upload (mapping store và upload ledger) mâu thuẫn nhau.
3. Không có hàng rào giao dịch ACID: mất điện hoặc restart dễ dẫn đến trạng thái nửa vời (job đã submit nhưng chưa lưu kết quả, hoặc tự ý retry gửi Generate mới gây tốn credit).
4. `AccountPool` quá tải với quá nhiều trách nhiệm.

## Quyết định kiến trúc

### 1. Bốn mô hình người dùng cốt lõi

- **Project (Dự án)**: Dự án công việc local, chứa ảnh nguồn, job và các liên kết account.
- **Account (Tài khoản)**: Đại diện cho một Chrome profile local riêng biệt. Không chứa cookie hay token trong database.
- **Asset (Ảnh)**: Blob lưu theo SHA-256 hash, metadata chỉ có 1 nguồn trong database. Không duplicate byte giữa các dự án.
- **Job & Attempt**:
  - `Job`: Ý định tạo ảnh bất biến (Prompt, model, parameters, danh sách ảnh nguồn).
  - `JobAttempt`: Một lần thực thi cụ thể gắn với một `project_binding` và `session_epoch`.

### 2. Nền tảng dữ liệu

- Sử dụng **SQLite (`node:sqlite`)** với `FOREIGN KEY = ON` và giao dịch ACID cho mọi thay đổi trạng thái và quan hệ metadata.
- Thư mục dữ liệu độc lập (`data_root`):
  ```text
  <data_root>/
    application.sqlite
    blobs/<hash_prefix>/<content_hash>
    profiles/<account_id>/
    temp/
    diagnostics/
    backups/
  ```

### 3. Nguyên tắc an toàn bất biến (Safety Invariants)

- **Account Lock độc quyền (`AccountCoordinator`)**: Tại mỗi thời điểm, một tài khoản chỉ được phép thực hiện tối đa 1 thao tác điều khiển browser.
- **Không tự động retry Generate**: Khi sự cố mạng hoặc restart xảy ra sau `submit_intent`, job chuyển sang `needs_attention` hoặc đối chiếu, tuyệt đối không gửi lại Generate.
- **Lỗi tải ảnh chỉ retry download**: Nếu Generate thành công nhưng download ảnh local thất bại, hệ thống chỉ retry download, không tạo ảnh mới.
- **Bảo vệ danh tính & phiên**: `session_epoch` thay đổi sẽ vô hiệu hóa cache/reuse cho đến khi được xác minh lại.

## Ma trận khả năng (Capability Matrix)

| Khả năng                         | Trạng thái        | Ghi chú kỹ thuật                                                 |
| :------------------------------- | :---------------- | :--------------------------------------------------------------- |
| Đăng nhập tài khoản thủ công     | Hỗ trợ            | Mở Chrome profile thật, người dùng đăng nhập và vượt CAPTCHA     |
| Quản lý dự án local & binding    | Hỗ trợ            | Mỗi project liên kết với 1 remote Flow project trên từng account |
| Text-to-Image (T2I)              | Hỗ trợ            | Gửi prompt, model Imagen, aspect ratio                           |
| Image-to-Image (I2I / Reference) | Hỗ trợ            | Upload ảnh lấy `remote_media_id`, gắn vào attempt                |
| Tải ảnh về máy & lưu Blob        | Hỗ trợ            | Tải trực tiếp bytes về blob store hash SHA-256                   |
| Cache reuse xuyên phiên          | Chưa hỗ trợ (MVP) | Chỉ xem xét khi adapter chứng minh được identity ổn định         |
