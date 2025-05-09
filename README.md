# Next.js and Node.js Chat Application

A real-time chat application built with Next.js, Node, and Socket.io featuring responsive design, user authentication, and instant messaging.

## App Preview

### Desktop View
![Desktop Screenshot](/public/screenshots/chat-1.png)
![Desktop Screenshot](/public/screenshots/chat-2.png)
![Desktop Screenshot](/public/screenshots/chat-3.png)

### Mobile View
![Mobile Screenshot](/public/screenshots/mobile-1.png)
![Mobile Screenshot](/public/screenshots/mobile-2.png)

### Auth View
![Auth Screenshot](/public/screenshots/signIn.png)
![Auth Screenshot](/public/screenshots/signUp.png)

## Key Features

- 💬 Real-time messaging with Socket.io
- 📱 Responsive design (mobile & desktop)
- 🔐 User authentication (JWT)
- 📞 Online/offline status indicators
- 🔍 Contact search functionality
- 📲 Message read receipts with counter
- 🎨 Dark mode UI

## Technologies Used

- **Frontend**: 
  - Next.js (Page Router because of avoids the added complexity of server components.)
  - Tailwind CSS
- **Backend**: 
  - Node.js
  - Express.js
  - Socket.io
  - MongoDB (or your database)
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/firseBugAagya/chat-app
   cd chat-app
   install the dependencies of both Client and Server
   npm run dev for client
   npm start for server
