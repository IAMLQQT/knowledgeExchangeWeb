<h1 align="center"> Học viện Công nghệ Bưu chính viễn thông <br/>
    Đồ án tốt nghiệp - 
   DIỄN ĐÀN TRAO ĐỔI KIẾN THỨC CHO SINH VIÊN CÔNG NGHỆ THÔNG TIN PTIT
</h1>

## [Table of Contents](#table-of-contents) <a id="table-of-contents"></a>

- [Tables of Contents](#table-of-contents)

- [Overview](#Overview)

- [Structure](#structure)

- [Featured](#feature) 

- [Technologies](#Technologies) 

- [Database](#Database)

- [Usecase Class](#Usecase)

- [Getting Start](#getstart)

- [Contributor](#Contributor)

## [Overview](#Overview) <a id="Overview"></a>

Đề tài "Xây dựng diễn đàn trao đổi kiến thức cho sinh viên công nghệ thông tin PTIT" nhằm mục đích xây dựng một nền tảng trực tuyến chuyên nghiệp, giúp sinh viên dễ dàng truy cập và chia sẻ kiến thức. 
Mục tiêu chính là tạo ra một môi trường học tập hiệu quả, nơi sinh viên có thể trao đổi, thảo luận và học hỏi từ nhau cũng như từ các sinh viên trong trường chung chuyên ngành cũng như các sinh viên có niềm đam mê với công nghệ thông tin
'

## [Structure](#structure) <a id="structure"></a>
    ────socialWebBE
    │   ├───controllers
    │   ├───models
    │   ├───routes
    │   ├───uploads/profile_pictures
    │   └───utils
    └───socialWebFE
        ├───dist
        │   └───assets
        │   ├───public
        └───src
            ├───assets
            ├───components
            │   ├───Admin
            │   │   └───AdminPage
            │   │       ├───Body
            │   │       ├───Header
            │   │       ├───Modals
            │   │       └───NavBar
            │   ├───Body
            │   │   ├───Contact
            │   │   ├───Forum
            │   │   ├───HomePage
            │   │   ├───Message
            │   │   ├───Modals
            │   │   ├───Post
            │   │   ├───Profile
            │   │   └───Search
            │   ├───Header
            │   ├───Login
            │   │   ├───LoginUI
            │   │   ├───Password
            │   │   └───Verification
            │   └───NavBar
            └───scss


## [Featured](#feature) <a id="feature"></a> 

Xây dựng diễn đàn trao đổi kiến thức có các chức năng:

 - Chức năng quản trị: quản lý tài khoản (tạo mới, tạm dừng/mở khóa, khóa vĩnh viễn), cấp quyền và theo dõi tình hình truy cập, theo dõi tình trạng hoạt động của website

 - Chức năng quản lý nội dung: tạo diễn đàn, theo dõi tình trạng đăng bài, đánh giá nội dung, duyệt nội dung (cho phép đăng/cấm đăng); gửi cảnh báo; thông báo về bài viết và liên quan

 - Chức năng người dùng: theo dõi bài đăng, đăng bài, tìm kiếm, bình luận/đánh giá, chỉnh sửa bài, theo dõi tình trạng bài

 - Dịch vụ tin nhắn tức thời (chatting service), nhóm nói chuyện 
 
 - Front End: ReactJS, Vite.

 - Back End: NodeJS, ExpressJS, Socket.io

 - CSDL: MySQL, Firebase Realtime Database.
 
## [Technologies](#Technologies) <a id="Technologies"></a> 

### Frontend 
- ReactJs (version 18.2.0)
- Vite (version 4.5.0)
- Sass (version 1.80.6)
### Backend 
- NodeJS (version 18)
- ExpressJS (version 4.18.2)
- JWT Web Token (version 9.0.2)
- Firebase Realtime Databse
- MySQL 
- socket.io (version 4.7.4)

## [Database](#Database) <a id="Database"></a> 

![alt text](/screenshot/database.png)

## [Usecase Class](#Usecase) <a id="Usecase"></a> 
User Usecase

![alt text](/screenshot/userUseCase.png)

Admin Usecase

![alt text](/screenshot/adminUseCase.png)

## [Getting Start](#getstart) <a id="getstart"></a> 

**Bước 1: Thực hiện clone git hoặc giải nén source code.** 

```sh
git clone https://github.com/IAMLQQT/knowledgeExchangeWeb.git
```

**Bước 2: Sử dụng Terminal, chuyển đến thư mục vừa giải nén source code, Chạy các câu lệnh để cài các gói cần thiết**

```sh
cd knowledgeExchangeWeb/socialWebFE
npm install 
cd ../socialWebBE
npm install 
```
**Bước 3: Tạo database và config database**

Thực hiện tạo mới một databse trên Mysql.

Sau đó ta vào từng file socialWebFE và socialWebBE tạo file env:

Thêm file `socialWebFE/.env` với các thông số localhost server.

```
VITE_SERVER_DOMAIN="http://127.0.0.1:3000"
```

Với http://127.0.0.1:3000 là  URL của server chạy cục bộ (localhost). 127.0.0.1 tương đương với localhost, còn 3000 là cổng mà server đang lắng nghe.

Tương tự thêm file `socialWebBE/.env` với các thông số của DB và các thông số khác.

```
NODE_ENV=development
DATABASE_PORT=3306
USERNAME=username
PASSWORD=password

DATABASE_HOST=database_host
DATABASE_NAME=database_name

JWT_SECRET=jwt_secret_name
JWT_EXPIRES_IN=time_jwt_expires
JWT_COOKIE_EXPIRES_IN=time_jwt_expires_cookie

EMAIL_USERNAME=email
EMAIL_PASSWORD=passwork


NODE_ENV=production
WEB_DOMAIN=http://localhost:5173
```
Hãy điền các thông tin tương ứng với config trong database của bạn.

**Bước 4: Tạo serviceAccountKey.json để chạy các dịch vụ của AccountService**

Tạo 1 file `socialWebBE/untils/serviceAccountKey.json` với các thuộc tính sau: 
```
{
    "type": "service_account",
    "project_id": "PROJECT ID",
    "private_key_id": "PRIVATE KEY ID",
    "private_key": "PRIVATE KEY",
    "client_email": "CLIENT EMAIL": 
    "client_id": "CLIENT ID",
    "auth_uri": "AUTH URI",
    "token_uri": "TOKEN URI",
    "auth_provider_x509_cert_url": "AUTH PROVIDER URL",
    "client_x509_cert_url": "CLIENT CERT URL ",
    "universe_domain":  "UNIVERSE DOMAIN"
  }
  
```

bạn có thể thực hiện các bước sau theo trang web [này](https://lucidgen.com/cach-tao-service-account-va-bat-api-google-cloud/) để lấy được các thuộc tính trên theo serviceAccount của riêng bạn.


**Bước 5: Chạy chương trình**

Mở lần lượt các 2 Terminal mới riêng biệt truy cập vào project hiện tại. 

Ở Termial thứ nhất chạy lệnh 

```sh
cd socialWebFE
npm run dev
```
Ở Termial thứ hai chạy lệnh 

```sh
cd socialWebBE
npm start
```
## [Contributor](#Contributor) <a id="Contributor"></a> 

LE QUANG QUỐC THỊNH  
