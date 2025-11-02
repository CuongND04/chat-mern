# MODULE SERVER

> 📘 **Backend của ứng dụng Chat Real-time** - API server được xây dựng với Express.js, MongoDB, và Socket.IO để xử lý authentication, messages, groups, và real-time communication.

---

## 🎯 MỤC TIÊU

Server chịu trách nhiệm:
- **Tiếp nhận yêu cầu từ client** qua REST API
- **Xử lý authentication** với JWT và bcrypt
- **Quản lý database** MongoDB (Users, Messages, Groups)
- **Upload/download file** qua Cloudinary
- **Real-time communication** với Socket.IO (WebSocket)
- **Trả kết quả cho client** dưới dạng JSON
- **Broadcasting events** cho online users, typing indicators, group updates

---

## ⚙️ CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ | Phiên bản | Ghi chú |
|------------|-----------|-----------|---------|
| **Runtime** | Node.js | 20.x | JavaScript runtime |
| **Framework** | Express | 5.1.0 | Web framework |
| **Database** | MongoDB | - | NoSQL database |
| **ODM** | Mongoose | 8.19.2 | MongoDB object modeling |
| **Real-time** | Socket.IO | 4.8.1 | WebSocket library |
| **Authentication** | JWT | 9.0.2 | JSON Web Token |
| **Password Hashing** | bcryptjs | 3.0.2 | Password encryption |
| **File Storage** | Cloudinary | 2.8.0 | Cloud storage |
| **File Upload** | Multer | 2.0.2 | Multipart/form-data |
| **CORS** | cors | 2.8.5 | Cross-Origin handling |
| **Cookie Parser** | cookie-parser | 1.4.7 | Parse cookies |
| **Environment** | dotenv | 17.2.3 | Environment variables |
| **Dev Tool** | nodemon | 3.1.10 | Auto-restart (dev) |

---

## 🚀 HƯỚNG DẪN CHẠY

### **Yêu cầu**
- Node.js 20.x trở lên
- MongoDB (local hoặc MongoDB Atlas)
- Cloudinary Account (để upload file/ảnh)

---

### **Cài đặt**

```powershell
# Di chuyển vào thư mục server
cd source/server

# Cài đặt dependencies
npm install
```

---

### **Cấu hình môi trường**

Tạo file `.env` trong folder `source/server/`:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chat-app
# Hoặc dùng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# JWT Secret (đổi thành chuỗi random phức tạp)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Cloudinary Configuration (lấy từ https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **⚠️ Quan trọng:** Thay thế các giá trị `your_*` bằng thông tin thực tế của bạn!

---

### **Khởi động server**

#### **Development mode (với nodemon - auto restart):**
```powershell
npm run dev
```

#### **Production mode:**
```powershell
npm start
```

**✅ Server chạy tại:** `http://localhost:5001`

**Log khi chạy thành công:**
```
✅ Server is running on port 5001
✅ MongoDB connected successfully
🔌 Socket.IO initialized
```

---

## 🔗 API ENDPOINTS

### **Auth Routes** (`/api/auth`)

| Endpoint | Method | Description | Body | Auth Required |
|----------|--------|-------------|------|---------------|
| `/signup` | POST | Đăng ký tài khoản mới | `{fullName, email, password}` | ❌ |
| `/login` | POST | Đăng nhập | `{email, password}` | ❌ |
| `/logout` | POST | Đăng xuất | - | ✅ |
| `/check` | GET | Kiểm tra authentication | - | ✅ |
| `/update-profile` | PUT | Cập nhật profile | `{fullName, email, profilePic, bio, location}` | ✅ |
| `/change-password` | PUT | Đổi mật khẩu | `{currentPassword, newPassword}` | ✅ |

#### **Examples:**

**Đăng ký:**
```powershell
curl -X POST http://localhost:5001/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "123456"
  }'
```

**Response:**
```json
{
  "_id": "673f8a1b2c3d4e5f6a7b8c9d",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": ""
}
```

**Đăng nhập:**
```powershell
curl -X POST http://localhost:5001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "john@example.com",
    "password": "123456"
  }'
```

---

### **Message Routes** (`/api/messages`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/users` | GET | Lấy danh sách users (với unread count) | ✅ |
| `/:id` | GET | Lấy tin nhắn với user có id | ✅ |
| `/send/:id` | POST | Gửi tin nhắn đến user | ✅ |
| `/read/:id` | PUT | Đánh dấu tin nhắn từ user đã đọc | ✅ |

#### **Request Body (gửi tin nhắn):**
```json
{
  "text": "Hello!",                    // Optional
  "image": "data:image/png;base64,...", // Optional (base64)
  "file": {                            // Optional
    "base64": "data:application/pdf;base64,...",
    "name": "document.pdf",
    "size": 123456,
    "type": "application/pdf"
  }
}
```

---

### **Group Routes** (`/api/groups`)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/create` | POST | Tạo group mới | ✅ |
| `/` | GET | Lấy danh sách groups (với unread count) | ✅ |
| `/:groupId/messages` | GET | Lấy tin nhắn của group | ✅ |
| `/:groupId/send` | POST | Gửi tin nhắn trong group | ✅ |
| `/:groupId/read` | PUT | Đánh dấu tin nhắn group đã đọc | ✅ |
| `/:groupId/members` | POST | Thêm members vào group (Admin) | ✅ |
| `/:groupId/members/:memberId` | DELETE | Xóa member khỏi group (Admin) | ✅ |
| `/:groupId` | PUT | Cập nhật thông tin group (Admin) | ✅ |
| `/:groupId/leave` | POST | Rời khỏi group | ✅ |

#### **Request Body (tạo group):**
```json
{
  "name": "My Group",
  "description": "This is a test group",
  "memberIds": ["userId1", "userId2"],
  "groupPic": "data:image/png;base64,..."
}
```

---

## 🔌 SOCKET.IO EVENTS

Server lắng nghe và phát các Socket.IO events để communication real-time:

### **Client → Server (On)**

| Event | Payload | Description |
|-------|---------|-------------|
| `connection` | `{ userId }` (từ handshake) | Khi client connect |
| `typing` | `{ receiverId }` | User đang gõ tin nhắn 1-1 |
| `stop-typing` | `{ receiverId }` | User ngừng gõ 1-1 |
| `joinGroup` | `{ groupId }` | Join group room |
| `leaveGroup` | `{ groupId }` | Leave group room |
| `groupTyping` | `{ groupId, isTyping }` | User đang gõ trong group |
| `disconnect` | - | Khi client disconnect |

---

### **Server → Client (Emit)**

| Event | Payload | Description |
|-------|---------|-------------|
| `getOnlineUsers` | `[userId1, userId2, ...]` | Danh sách online users |
| `newMessage` | `{message object}` | Tin nhắn mới 1-1 |
| `message_seen_update` | `{senderId, receiverId}` | Tin nhắn đã được đọc |
| `user-typing` | `{userId, isTyping}` | User đang gõ (1-1) |
| `newGroupMessage` | `{groupId, message}` | Tin nhắn mới trong group |
| `newGroup` | `{group object}` | Được thêm vào group mới |
| `groupUpdated` | `{group object}` | Thông tin group thay đổi |
| `removedFromGroup` | `{groupId}` | Bị xóa khỏi group |
| `memberLeftGroup` | `{groupId, userId}` | Member rời group |
| `groupUserTyping` | `{groupId, userId, isTyping}` | User đang gõ trong group |

---

## 📦 CẤU TRÚC

```
server/
├── README.md                    # Tài liệu chi tiết
├── package.json                 # Dependencies & scripts
├── .env                         # Environment variables (không commit)
└── src/
    ├── index.js                 # Entry point - Server startup
    ├── controllers/
    │   ├── auth.controller.js      # Auth logic (signup, login, logout)
    │   ├── message.controller.js   # Message logic (send, get, read)
    │   └── group.controller.js     # Group logic (create, manage)
    ├── lib/
    │   ├── cloudinary.js        # Cloudinary config
    │   ├── db.js                # MongoDB connection
    │   ├── socket.js            # Socket.IO setup & handlers
    │   └── utils.js             # Helper functions (generateToken)
    ├── middleware/
    │   └── auth.middleware.js   # JWT verification (protectRoute)
    ├── models/
    │   ├── user.model.js        # User schema
    │   ├── message.model.js     # Message schema
    │   └── group.model.js       # Group schema
    └── routes/
        ├── auth.route.js        # Auth endpoints
        ├── message.route.js     # Message endpoints
        └── group.route.js       # Group endpoints
```

---

## 🗄️ DATABASE MODELS

### **1. User Model** (`user.model.js`)

```javascript
{
  _id: ObjectId,                    // Auto-generated
  email: String,                    // Unique, required
  fullName: String,                 // Required
  password: String,                 // Hashed with bcrypt, required
  profilePic: String,               // Cloudinary URL, default: ""
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

**Validation:**
- Email: Unique
- Password: Minimum 6 characters
- Password hashed với bcrypt (10 salt rounds)

---

### **2. Message Model** (`message.model.js`)

```javascript
{
  _id: ObjectId,
  senderId: ObjectId,               // Ref: User, required
  receiverId: ObjectId,             // Ref: User (cho 1-1 chat)
  groupId: ObjectId,                // Ref: Group (cho group chat)
  text: String,                     // Nội dung tin nhắn
  image: String,                    // Cloudinary URL
  file: {                           // File attachment
    url: String,                    // Cloudinary URL
    name: String,                   // File name
    size: Number,                   // Bytes
    type: String                    // MIME type
  },
  read: Boolean,                    // Đã đọc (1-1 chat), default: false
  readBy: [ObjectId],               // Array of userIds (group chat)
  createdAt: Date,
  updatedAt: Date
}
```

**Logic:**
- Nếu có `receiverId` → 1-1 chat
- Nếu có `groupId` → Group chat
- `read` cho 1-1 chat, `readBy[]` cho group chat

---

### **3. Group Model** (`group.model.js`)

```javascript
{
  _id: ObjectId,
  name: String,                     // Required, trim
  description: String,              // Default: ""
  groupPic: String,                 // Cloudinary URL, default: ""
  admin: ObjectId,                  // Ref: User, required
  members: [ObjectId],              // Array of userIds
  lastMessage: ObjectId,            // Ref: Message
  createdAt: Date,
  updatedAt: Date
}
```

**Rules:**
- Admin: Người tạo group
- Admin có thể thêm/xóa members, update group info
- Admin không thể rời group (trừ khi chuyển quyền admin)

---

## 🔐 AUTHENTICATION & SECURITY

### **JWT Authentication**

#### **Generate Token:**
```javascript
// lib/utils.js
export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
  
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,                  // Chống XSS
    sameSite: "strict",              // Chống CSRF
    secure: process.env.NODE_ENV === "production" // HTTPS only in prod
  });
};
```

#### **Verify Token (Middleware):**
```javascript
// middleware/auth.middleware.js
export const protectRoute = async (req, res, next) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    req.user = user; // Gắn user vào request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

---

### **Password Hashing**

```javascript
// Khi đăng ký
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Khi đăng nhập
const isPasswordCorrect = await bcrypt.compare(password, user.password);
```

---

### **CORS Configuration**

```javascript
// src/index.js
app.use(cors({
  origin: ["http://localhost:5173"],  // Client URL
  credentials: true                    // Cho phép gửi cookie
}));
```

---

## ☁️ CLOUDINARY INTEGRATION

### **Configuration** (`lib/cloudinary.js`)

```javascript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
```

---

### **Upload Image**

```javascript
const uploadResponse = await cloudinary.uploader.upload(base64Image);
const imageUrl = uploadResponse.secure_url;
```

---

### **Upload File (Raw)**

```javascript
const uploadResponse = await cloudinary.uploader.upload(file.base64, {
  resource_type: "raw",           // Cho non-image files
  folder: "chat_files",
  public_id: file.name.split('.')[0],
  format: file.name.split('.').pop()
});

const fileData = {
  url: uploadResponse.secure_url,
  name: file.name,
  size: file.size,
  type: file.type
};
```

---

## 🧪 TEST API

### **Test với Postman/Thunder Client**

1. **Import collection:** 
   - Auth endpoints
   - Message endpoints
   - Group endpoints

2. **Set environment variables:**
   - `base_url`: `http://localhost:5001/api`

3. **Enable cookie storage:**
   - Settings → Send cookies automatically

---

### **Test Socket.IO**

Dùng tool **Socket.IO Client** hoặc code:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5001", {
  query: { userId: "your_user_id_here" }
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
});

socket.on("getOnlineUsers", (users) => {
  console.log("👥 Online users:", users);
});

socket.emit("typing", { receiverId: "other_user_id" });
```
---

## 📝 GHI CHÚ

### **Lưu ý quan trọng:**

1. **Environment Variables:**
   - ⚠️ KHÔNG commit file `.env` lên Git
   - Tạo `.env.example` với template (không có values)

2. **Security:**
   - ✅ JWT token lưu trong httpOnly cookie (chống XSS)
   - ✅ Password hash với bcrypt (10 rounds)
   - ✅ CORS configured cho specific origins
   - ✅ Input validation trước khi lưu DB

3. **MongoDB:**
   - Local: `mongodb://localhost:27017/chat-app`
   - Atlas: `mongodb+srv://...` (production)
   - Database name: `chat-app`

4. **Socket.IO:**
   - Connection cần `userId` trong query
   - Use rooms cho group chat
   - Cleanup listeners khi disconnect

5. **Cloudinary:**
   - Free tier: 25 credits/month
   - Image auto-optimized
   - CDN delivery worldwide

---

### **Scalability Considerations:**

- 🔄 **Horizontal Scaling:** Cần Redis adapter cho Socket.IO nếu deploy nhiều instances
- 📊 **Database:** Consider sharding nếu > 10M users
- 🗄️ **File Storage:** Cloudinary có limit, consider S3 cho production scale
- 🔐 **Session:** Hiện tại dùng JWT stateless, có thể thêm Redis cho session storage

---

## 📚 TÀI LIỆU THAM KHẢO

- **Express.js:** https://expressjs.com/
- **MongoDB:** https://docs.mongodb.com/
- **Mongoose:** https://mongoosejs.com/
- **Socket.IO:** https://socket.io/docs/
- **JWT:** https://jwt.io/
- **Cloudinary:** https://cloudinary.com/documentation
- **bcrypt:** https://www.npmjs.com/package/bcryptjs

---