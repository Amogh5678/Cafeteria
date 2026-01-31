export const login = () => {
    return (
        <div>
            <div className="login-card">
                {!user ? (
                    <>
                        <h1 className="login-title">CaféConnect</h1>

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
                        <h1 className="login-title">Welcome ☕</h1>

                        <p className="login-subtitle">
                            You are logged in successfully
                        </p>

                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>

                        <button className="login-btn" onClick={logout}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}