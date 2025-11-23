# Electronic Voting System (EVS)

A secure and transparent electronic voting platform built with React, Node.js, and Express.

## 🚀 Features

- User authentication and authorization
- Secure voting system
- Real-time results and analytics
- Admin dashboard
- Voter management
- Election creation and management

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT
- **State Management**: React Context API
- **Routing**: React Router v6
- **UI Components**: Custom components with TailwindCSS

## 📁 Project Structure

```
electronic-voting-system/
├── frontend/              # Frontend React application
│   ├── public/            # Static files
│   └── src/               # Source files
│       ├── components/    # Reusable UI components
│       ├── context/       # React context providers
│       ├── pages/         # Page components
│       ├── styles/        # Global styles
│       └── utils/         # Utility functions
│
├── backend/               # Backend Node.js server
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
│
├── .gitignore           # Git ignore file
└── package.json         # Root package.json with project scripts
```

## 🛠️ Development Scripts

From the root directory, you can run:

| Command               | Description                                        |
| --------------------- | -------------------------------------------------- |
| `npm run dev`         | Start both frontend and backend in development     |
| `npm run server`      | Start only the backend server                      |
| `npm run build`       | Build the frontend for production                  |
| `npm start`           | Start the production server                        |
| `npm test`            | Run tests for both frontend and backend            |
| `npm run install:all` | Install all dependencies (root, frontend, backend) |

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/David-mwendwa/electronic-voting-system.git
   cd electronic-voting-system
   ```

2. **Install all dependencies**

   ```bash
   # Install all dependencies (root, frontend, and backend)
   # This will also install concurrently globally if needed
   npm run install:all
   ```

   This will:

   - Install root dependencies (primarily for development tooling)
   - Install frontend dependencies in the `frontend` directory
   - Install backend dependencies in the `backend` directory

3. **Environment Setup**
   - Create `.env` files in both `frontend` and `backend` directories
   - See `.env.example` files for required environment variables

### Running the Application

1. **Development Mode**

   ```bash
   # Start both frontend and backend development servers
   npm run dev
   ```

   - Frontend will be available at `http://localhost:3000`
   - Backend API will be available at `http://localhost:5000`

2. **Running Servers Individually**

   ```bash
   # Start only the frontend
   npm run dev --prefix frontend

   # Start only the backend
   npm run server
   ```

3. **Production Build**

   ```bash
   # Build frontend for production
   npm run build

   # Start production server
   npm start
   ```

   This will serve the optimized frontend build and start the production backend server.

## 🌐 Environment Variables

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
# Add other frontend environment variables here
```

### Backend (`.env`)

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
# Add other backend environment variables here
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

David Mwendwa - [@DavidMwens](https://x.com/davidmwens?s=21&t=0K4V3sUOE2yo73T-9eBFuQ) - davidmw022@gmail.com

Project Link: [https://github.com/David-mwendwa/electronic-voting-system](https://github.com/David-mwendwa/electronic-voting-system)
