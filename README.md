# 🚀 Enova Ticket Manager

Enova Ticket Manager is a modern full-stack web application designed to streamline communication between departments. It provides a comprehensive solution for ticket creation, assignment, tracking, and resolution.

## 📌 Key Features

✅ User authentication with role-based access control  
✅ Ticket creation, assignment, and lifecycle management  
✅ Department management and ticket routing  
✅ File attachments for tickets  
✅ Search and filtering capabilities  
✅ Responsive design for desktop and mobile  
✅ Admin dashboard for system oversight

## 🏗️ Architecture

Enova Ticket Manager follows a modern client-server architecture:

### Frontend

- **Framework**: React.js with React Router
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Form Handling**: react-hook-form
- **UI Components**: Custom components with react-icons

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer
- **Database**: PostgreSQL
- **File System**: fs-extra

## 📂 Project Structure

```
/
├── front/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── api/           # API service modules
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── index.html         # HTML entry point
│
└── back/                  # Backend Node.js application
    ├── config/            # Configuration files
    ├── controllers/       # Request handlers
    ├── middleware/        # Express middleware
    ├── models/            # Database models
    ├── routes/            # API route definitions
    ├── uploads/           # File storage for attachments
    └── server.js          # Server entry point
```

## 📦 Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/Khaliil02/enova-tm.git
   cd enova-tm
   ```

2. **Install backend dependencies:**

   ```sh
   cd back
   npm install
   ```

3. **Install frontend dependencies:**

   ```sh
   cd ../front
   npm install
   ```

4. **Set up the PostgreSQL database**

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the **back** directory:

```ini
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=enova_db
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
```

### Frontend Configuration

The frontend configuration is managed through environment variables in the **front** directory.

## 🚀 Running the Application

### Backend

```sh
cd back
npm start
```

The server will run on **http://localhost:5000**.

### Frontend

```sh
cd front
npm run dev
```

The application will be available at **http://localhost:3000**.

## 📱 Application Pages

- **Home** (`/`): Landing page with application overview
- **Login** (`/login`): User authentication
- **Register** (`/register`): New user registration
- **Dashboard** (`/dashboard`): User dashboard with activity summary
- **Tickets** (`/tickets`): List and manage all tickets
- **Create Ticket** (`/tickets/new`): Create new support tickets
- **Ticket Details** (`/tickets/:id`): View and manage specific tickets
- **Users** (`/users`): Admin user management (admin only)
- **Departments** (`/departments`): Department management (admin only)

## 📡 API Endpoints

### 👤 Users

- `GET /api/users` → Retrieve all users
- `GET /api/users/:id` → Retrieve a user by ID
- `POST /api/users` → Create a new user
- `PUT /api/users/:id` → Update a user
- `DELETE /api/users/:id` → Delete a user

### 🎟️ Tickets

- `GET /api/tickets` → Retrieve all tickets
- `GET /api/tickets/:id` → Retrieve a ticket by ID
- `GET /api/tickets/status/:status` → Retrieve tickets by status
- `GET /api/tickets/priority/:priority` → Retrieve tickets by priority
- `POST /api/tickets` → Create a new ticket
- `PUT /api/tickets/:id/status` → Update the status of a ticket
- `DELETE /api/tickets/:id` → Delete a ticket (admin only)
- `PUT /api/tickets/:id/claim` → Claim a ticket (assign it to yourself)
- `PUT /api/tickets/:id/escalate` → Escalate a ticket to admin
- `PUT /api/tickets/:id/reassign` → Reassign an escalated ticket (admin only)

### 🏢 Departments

- `GET /api/departments` → Retrieve all departments
- `GET /api/departments/:id` → Retrieve a department by ID
- `POST /api/departments` → Create a new department
- `PUT /api/departments/:id` → Update a department
- `DELETE /api/departments/:id` → Delete a department

### 🔔 Notifications

- `GET /api/notifications` → Get all notifications for the authenticated user
- `GET /api/notifications/unread` → Get unread notifications for the authenticated user
- `PUT /api/notifications/:id/read` → Mark a notification as read
- `PUT /api/notifications/read-all` → Mark all notifications as read

### 📋 Ticket History

- `GET /api/history/ticket/:id` → Get the complete history of changes for a specific ticket

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token.

## 👥 User Roles

- **Admin**: Full system access, including user and department management
- **Regular Users**: Can create and manage tickets within their assigned departments

## 🛠️ Technologies

- **Frontend**: React.js, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js, JWT
- **Database**: PostgreSQL
- **File Handling**: Multer, fs-extra

## 📄 License

[MIT](LICENSE)
