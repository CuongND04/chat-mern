# MODULE CLIENT

> 📘 **Frontend của ứng dụng Chat Real-time** - Giao diện người dùng được xây dựng với React, Zustand, và Tailwind CSS, kết nối với server qua REST API và Socket.IO để chat real-time.

---

## 🎯 MỤC TIÊU

Client chịu trách nhiệm:
- **Hiển thị giao diện người dùng** (UI/UX) với Neobrutalism Design
- **Gửi yêu cầu đến server** qua REST API (Axios)
- **Nhận & gửi tin nhắn real-time** qua WebSocket (Socket.IO)
- **Quản lý state** của ứng dụng với Zustand
- **Xử lý authentication** (JWT token trong cookie)
- **Upload/download file** và ảnh qua Cloudinary
- **Hiển thị online status**, typing indicators, read receipts

---

## ⚙️ CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ | Phiên bản | Ghi chú |
|------------|-----------|-----------|---------|
| **Framework** | React | 19.1.1 | UI library |
| **Build Tool** | Vite | Latest | Fast build & HMR |
| **Ngôn ngữ** | JavaScript (ES6+) | - | Modern JS syntax |
| **State Management** | Zustand | 5.0.8 | Lightweight store |
| **Styling** | Tailwind CSS | 4.1.16 | Utility-first CSS |
| **HTTP Client** | Axios | 1.13.1 | Promise-based API calls |
| **Routing** | React Router DOM | 7.9.5 | Client-side routing |
| **Real-time** | Socket.IO Client | 4.8.1 | WebSocket connection |
| **Icons** | Lucide React | 0.548.0 | Modern icon library |
| **Notifications** | React Hot Toast | 2.6.0 | Toast messages |
| **Linting** | ESLint | 9.36.0 | Code quality |

**Giao thức:** 
- REST API: HTTP/HTTPS
- Real-time: WebSocket (Socket.IO)

---

## 🚀 HƯỚNG DẪN CHẠY

### **Yêu cầu**
- Node.js 20.x trở lên
- npm hoặc yarn
- Server đã chạy tại `http://localhost:5001`

---

### **Cài đặt**

```powershell
# Di chuyển vào thư mục client
cd source/client

# Cài đặt dependencies
npm install
```

---

### **Chạy chương trình**

#### **Development mode (với hot reload):**
```powershell
npm run dev
```
✅ Client sẽ chạy tại: **http://localhost:5173**

#### **Build production:**
```powershell
npm run build
```
Output sẽ được tạo trong folder `dist/`

#### **Preview production build:**
```powershell
npm run preview
```

---

### **Cấu hình**

#### **Server URL**
Mặc định kết nối đến: `http://localhost:5001`

Nếu server chạy ở port khác, sửa trong file:
```javascript
// source/client/src/lib/axios.js
const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api", // ⬅️ Thay đổi port ở đây
  withCredentials: true,
});

// source/client/src/store/useAuthStore.js
const BASE_URL = "http://localhost:5001"; // ⬅️ Cho Socket.IO
```

#### **Environment Variables (Optional)**
Có thể tạo file `.env` trong `source/client/`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

Sau đó sử dụng: `import.meta.env.VITE_API_URL`

---

## 📦 CẤU TRÚC

```
client/
├── README.md                   # Tài liệu chi tiết
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint rules
├── index.html                  # HTML template
├── public/
│   └── statics/                # Static assets (images)
│       └── 10.jpg              # Default avatar
└── src/
    ├── main.jsx                # Entry point
    ├── App.jsx                 # Root component
    ├── index.css               # Global styles
    ├── assets/                 # Local assets
    ├── components/             # React components
    │   ├── AuthImagePattern.jsx
    │   ├── ChatContainer.jsx         # Chat 1-1 UI
    │   ├── ChatHeader.jsx
    │   ├── CreateGroupModal.jsx      # Modal tạo group
    │   ├── GroupChatContainer.jsx    # Group chat UI
    │   ├── GroupChatHeader.jsx
    │   ├── GroupSettingsModal.jsx    # Settings group
    │   ├── MessageInput.jsx          # Input tin nhắn
    │   ├── Navbar.jsx                # Navigation bar
    │   ├── NoChatSelected.jsx        # Empty state
    │   ├── Sidebar.jsx               # Danh sách users/groups
    │   └── skeletons/
    │       ├── MessageSkeleton.jsx   # Loading skeleton
    │       └── SidebarSkeleton.jsx
    ├── lib/
    │   ├── axios.js            # Axios instance config
    │   └── utils.js            # Helper functions
    ├── pages/
    │   ├── HomePage.jsx        # Main chat page
    │   ├── LoginPage.jsx       # Login form
    │   ├── SignUpPage.jsx      # Signup form
    │   └── ProfilePage.jsx     # User profile
    └── store/
        ├── useAuthStore.js     # Auth state + Socket.IO
        ├── useChatStore.js     # 1-1 Chat state
        └── useGroupStore.js    # Group Chat state
```

---

## 💡 SỬ DỤNG

### **1. Đăng ký tài khoản**
```
1. Truy cập: http://localhost:5173/signup
2. Nhập: Full Name, Email, Password
3. Click "Create Account"
4. Tự động login và redirect về HomePage
```

### **2. Đăng nhập**
```
1. Truy cập: http://localhost:5173/login
2. Nhập: Email, Password
3. Click "Sign In"
4. Redirect về HomePage
```

### **3. Chat 1-1**
```
1. Click vào user trong Sidebar (tab "Chats")
2. Nhập tin nhắn, hoặc:
   - Click 📷 để gửi ảnh
   - Click 📎 để gửi file
3. Enter hoặc Click Send
4. Tin nhắn hiển thị real-time cho cả 2 bên
```

### **4. Tạo Group Chat**
```
1. Click tab "Groups" trong Sidebar
2. Click nút "+" (Create Group)
3. Nhập tên, mô tả (optional), upload ảnh
4. Chọn members (checkbox)
5. Click "Create Group"
```

### **5. Chat trong Group**
```
1. Click vào group trong Sidebar
2. Gửi tin nhắn giống chat 1-1
3. Tất cả members nhận real-time
```

### **6. Quản lý Group (Admin)**
```
1. Mở group chat
2. Click icon ⚙️ (Settings) ở header
3. Có thể:
   - Thêm members
   - Xóa members
   - Sửa tên/mô tả/ảnh group
```

---

## 🎨 TÍNH NĂNG CHÍNH

### **I. Authentication**
- ✅ Đăng ký với email validation
- ✅ Đăng nhập với JWT (lưu trong httpOnly cookie)
- ✅ Auto-login nếu có token hợp lệ
- ✅ Đăng xuất (xóa token + disconnect Socket.IO)
- ✅ Protected routes (redirect về login nếu chưa auth)

### **II. Profile Management**
- ✅ Upload/thay đổi avatar (lưu lên Cloudinary)
- ✅ Cập nhật Full Name, Email
- ✅ Đổi mật khẩu
- ✅ Hiển thị loading state khi update

### **III. Chat 1-1**
- ✅ Danh sách users với avatar + online status
- ✅ Badge hiển thị số tin nhắn chưa đọc
- ✅ Filter "Online only"
- ✅ Gửi text, image, file
- ✅ Preview ảnh trong chat
- ✅ Download file attachments
- ✅ **Typing indicator:** "User đang gõ..."
- ✅ **Read receipts:** Hiển thị "Read" khi đã đọc
- ✅ Auto-scroll to bottom khi có tin nhắn mới

### **IV. Group Chat**
- ✅ Tab "Groups" riêng trong Sidebar
- ✅ Tạo group với tên, mô tả, ảnh
- ✅ Chọn members từ danh sách users
- ✅ Gửi tin nhắn với tên + avatar người gửi
- ✅ Group typing indicator
- ✅ "Seen by X/Y" cho tin nhắn group
- ✅ Admin có thể:
  - Thêm members
  - Xóa members
  - Sửa thông tin group
- ✅ User có thể rời group (admin không được)

### **V. Real-time Features**
- ✅ Socket.IO connection khi login
- ✅ Online status với dấu xanh
- ✅ Real-time message delivery
- ✅ Real-time typing indicators
- ✅ Real-time read receipts
- ✅ Real-time group notifications
- ✅ Auto-reconnect nếu mất kết nối

### **VI. UI/UX**
- ✅ **Neobrutalism Design:**
  - Border đen đậm
  - Box shadow offset (2px 2px 0 #000)
  - Màu sắc tươi sáng: Yellow, Blue, Pink, Green
- ✅ **Responsive:**
  - Mobile: Icon-only sidebar
  - Desktop: Full sidebar với text
- ✅ **Loading states:**
  - Skeleton loaders
  - Spinner khi upload
- ✅ **Toast notifications:**
  - Success: "Logged in successfully"
  - Error: "Invalid credentials"
  - Info: "You've been added to group"

---

## 🔌 KẾT NỐI VỚI SERVER

### **REST API (Axios)**

Client gọi các endpoint sau:

#### **Auth APIs**
```javascript
POST   /api/auth/signup         // Đăng ký
POST   /api/auth/login          // Đăng nhập
POST   /api/auth/logout         // Đăng xuất
GET    /api/auth/check          // Kiểm tra auth
PUT    /api/auth/update-profile // Cập nhật profile
PUT    /api/auth/change-password // Đổi mật khẩu
```

#### **Message APIs**
```javascript
GET    /api/messages/users      // Lấy danh sách users
GET    /api/messages/:id        // Lấy tin nhắn với user
POST   /api/messages/send/:id   // Gửi tin nhắn
PUT    /api/messages/read/:id   // Đánh dấu đã đọc
```

#### **Group APIs**
```javascript
POST   /api/groups/create                      // Tạo group
GET    /api/groups                             // Lấy groups
GET    /api/groups/:groupId/messages           // Lấy messages
POST   /api/groups/:groupId/send               // Gửi message
PUT    /api/groups/:groupId/read               // Mark as read
POST   /api/groups/:groupId/members            // Thêm members
DELETE /api/groups/:groupId/members/:memberId  // Xóa member
PUT    /api/groups/:groupId                    // Update group
POST   /api/groups/:groupId/leave              // Rời group
```

---

### **Socket.IO Events**

#### **Client Emit (gửi lên server)**
```javascript
socket.emit("typing", { receiverId })           // Đang gõ 1-1
socket.emit("stop-typing", { receiverId })      // Ngừng gõ 1-1
socket.emit("joinGroup", { groupId })           // Join group room
socket.emit("leaveGroup", { groupId })          // Leave group room
socket.emit("groupTyping", { groupId, isTyping }) // Đang gõ group
```

#### **Client Listen (nhận từ server)**
```javascript
// Online Status
socket.on("getOnlineUsers", (userIds) => {
  // Cập nhật danh sách online
})

// 1-1 Chat
socket.on("newMessage", (message) => {
  // Tin nhắn mới từ user khác
})

socket.on("message_seen_update", ({ senderId, receiverId }) => {
  // Người kia đã đọc tin nhắn của mình
})

socket.on("user-typing", ({ userId, isTyping }) => {
  // User đang gõ hoặc ngừng gõ
})

// Group Chat
socket.on("newGroupMessage", ({ groupId, message }) => {
  // Tin nhắn mới trong group
})

socket.on("newGroup", (group) => {
  // Được thêm vào group mới
})

socket.on("groupUpdated", (group) => {
  // Thông tin group thay đổi
})

socket.on("removedFromGroup", (groupId) => {
  // Bị xóa khỏi group
})

socket.on("memberLeftGroup", ({ groupId, userId }) => {
  // Member rời group
})

socket.on("groupUserTyping", ({ groupId, userId, isTyping }) => {
  // User đang gõ trong group
})
```

---

## 🗂️ STATE MANAGEMENT (Zustand)

### **1. useAuthStore.js**
Quản lý authentication và Socket.IO connection:
```javascript
{
  authUser: null,              // User hiện tại
  isSigningUp: false,          // Loading state
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],             // Danh sách userId online
  socket: null,                // Socket.IO instance
  
  // Actions
  checkAuth(),                 // Verify JWT
  signup(data),
  login(data),
  logout(),
  updateProfile(data),
  changePassword(data),
  connectSocket(),             // Kết nối Socket.IO
  disconnectSocket(),
}
```

### **2. useChatStore.js**
Quản lý chat 1-1:
```javascript
{
  messages: [],                // Tin nhắn với user đang chọn
  users: [],                   // Danh sách users
  selectedUser: null,          // User đang chat
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: new Set(),      // Users đang gõ
  
  // Actions
  getUsers(),
  getMessages(userId),
  sendMessage(messageData),
  markMessagesAsRead(senderId),
  subscribeToMessages(),       // Listen socket events
  unsubscribeFromMessages(),
  setUserTyping(userId),
  setUserStoppedTyping(userId),
}
```

### **3. useGroupStore.js**
Quản lý group chat:
```javascript
{
  groups: [],                  // Danh sách groups
  selectedGroup: null,         // Group đang chat
  groupMessages: [],           // Tin nhắn group
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  groupTypingUsers: {},        // { groupId: Set([userId1, ...]) }
  
  // Actions
  getGroups(),
  createGroup(groupData),
  getGroupMessages(groupId),
  sendGroupMessage(groupId, messageData),
  markGroupMessagesAsRead(groupId),
  addMembersToGroup(groupId, memberIds),
  removeMemberFromGroup(groupId, memberId),
  updateGroupInfo(groupId, data),
  leaveGroup(groupId),
  subscribeToGroupMessages(),
  unsubscribeFromGroupMessages(),
}
```

---

---

## 📝 GHI CHÚ

### **Lưu ý quan trọng:**
- ✅ **Server PHẢI chạy trước** khi start client
- ✅ Mặc định kết nối: `localhost:5001`
- ✅ JWT lưu trong **httpOnly cookie** (không đọc được từ JavaScript)
- ✅ Socket.IO auto-connect khi login, auto-disconnect khi logout
- ✅ File upload tối đa **50MB** (server config)
- ✅ Typing indicator tự động tắt sau **3 giây** không gõ

### **Performance Tips:**
- ✅ Vite HMR (Hot Module Replacement) → Code thay đổi tự động reload
- ✅ Lazy load images với `loading="lazy"`
- ✅ Zustand → Lightweight state (chỉ re-render component cần thiết)
- ✅ Socket cleanup khi unmount component (tránh memory leak)

### **Security:**
- ✅ JWT không lưu trong localStorage (chống XSS)
- ✅ `withCredentials: true` cho Axios (gửi cookie)
- ✅ No sensitive data in client-side code

---

## 📚 TÀI LIỆU THAM KHẢO

- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Zustand:** https://docs.pmnd.rs/zustand
- **Tailwind CSS:** https://tailwindcss.com/
- **Socket.IO Client:** https://socket.io/docs/v4/client-api/
- **Axios:** https://axios-http.com/
- **React Router:** https://reactrouter.com/

---
