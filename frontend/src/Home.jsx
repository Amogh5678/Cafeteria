import React from "react";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "./config";
import "./index.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  const logout = () => {
    window.location.href = `${BACKEND_URL}/auth/logout`;
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }

  return (
    <div className="login-card">
      {!user ? (
        <>
          <h1 className="login-title">Cafe-reserve</h1>

          <p className="login-subtitle">
            Welcome! Please login to reserve your seat.
          </p>

          <button className="login-btn" onClick={login}>
            Login with w3id
          </button>

          <div className="login-help">
            Need help?
          </div>
        </>


      ) : (
        <>
          <h1 className="login-title">Welcome</h1>

          <p className="login-subtitle">
            You are logged in successfully
          </p>

          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>

          <button className="login-btn" onClick={logout}>
            Logout
          </button>

          <button className="login-btn" onClick={() => navigate("/booking")}>
            Reserve Seats
          </button>
        </>
      )}
      </div>

  );
}

export default Home;
