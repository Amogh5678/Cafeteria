import { useEffect, useState } from "react";
import { BACKEND_URL } from "./config";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/me`, {
      credentials: "include", // 🔴 IMPORTANT
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

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Cafeteria Seat Reservation</h1>

      {!user ? (
        <>
          <p>You are not logged in.</p>
          <button onClick={login}>Login with w3id</button>
        </>
      ) : (
        <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>

          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  );
}

export default App;
