# Cafeteria Application

A full-stack web application for cafeteria management, featuring seat booking, wallet management, and authentication via IBM Verify OIDC.

## Project Structure

The project is divided into two main parts:

- **`backend/`**: Node.js/Express server handling API requests, authentication, and database connections.
- **`frontend/`**: React + Vite application for the user interface.

## Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas connection string)

## Getting Started

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=8080
SESSION_SECRET=your_super_secret_session_key

# Database
MONGO_URI=mongodb://localhost:27017/cafeteria # Or your MongoDB Atlas URI

# Authentication (IBM Verify OIDC)
OIDC_CLIENT_ID=your_oidc_client_id
OIDC_CLIENT_SECRET=your_oidc_client_secret
```

> **Note:** The OIDC Issuer is currently hardcoded to `https://test.login.w3.ibm.com/oidc/endpoint/default`. Ensure your OIDC client is registered with this issuer and allows callbacks to `http://localhost:8080/auth/callback`.

Start the backend server:

```bash
npm start
```

The server will run on [http://localhost:8080](http://localhost:8080).

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will typically run on [http://localhost:5173](http://localhost:5173).

## Usage

1.  Open the frontend URL in your browser.
2.  Login functionality is handled via the backend's `/auth/login` route, which redirects to IBM Verify.
3.  Upon successful login, the user session is established.
4.  Explore features like Seat Booking and Wallet (API endpoints available at `/seats` and `/wallet`).

## API Endpoints

-   `GET /`: Health check
-   `GET /auth/login`: Initiates OIDC login flow
-   `GET /auth/logout`: Logs out the user
-   `GET /api/me`: Returns current logged-in user details
-   `GET /debug-user`: Debug endpoint to view session user data
