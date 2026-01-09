# Lotus Travel Flight Management System

Website quản lý và bán vé máy bay Lotus Travel được xây dựng với React (Vite) và Cloud Run Backend. Dự án thuộc học phần Cơ sở dữ liệu Web và hệ thống thông tin - HUS.

## Tech Stack

* **Frontend:** ReactJS, Vite, Axios, CSS Modules.
* **Backend:** Python (FastAPI) - Google Cloud Run.
* **Database:** PostgreSQL.
* **Deployment:** Vercel (Frontend) & Google Cloud Platform (Backend).

## Installation

Hướng dẫn cài đặt và chạy dự án dưới môi trường Local (Máy cá nhân).

### 1. Clone repository

Mở terminal và chạy lệnh sau để tải mã nguồn về máy:

```bash
git clone https://github.com/QAnh999/project-csdlweb-hus.git
```

### 2. Di chuyển đến thư mục

```bash
cd project-csdlweb-hus
```

### 3. Chạy docker

```bash
docker-compose up --build
```

### 4. Website:

 * Trang User: http://localhost:3000
 * Trang Admin: http://localhost:5173
### 5. Thông tin đăng nhập:

  * User login:
      * Email: nguyen.van.a@email.com
      * Password: 123456
  * Admin login:
      * Email: quynhanh@airvn.com (Super Admin) / diemquynh@airvn.com (Admin)
      * Password: 123456

## Link web truy cập bằng internet:

  * Trang user: https://project-csdlweb-hus-d78p.vercel.app/
  * Trang admin: https://webadmin-one.vercel.app/
