import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(event) {
        event.preventDefault();

        setError("");

        if (!username.trim() || !password) {
            setError("Please enter username and password.");
            return;
        }

        setLoading(true);

        try {
            // ------------------------------------------------
            // STEP 1: Clear any existing session
            // ------------------------------------------------
            try {
                await api.post(
                    "/logout",
                    {},
                    { withCredentials: true }
                );
            } catch (logoutError) {
                // Ignore if no prior session existed
            }

            // ------------------------------------------------
            // STEP 2: Login using form urlencoded payload
            // ------------------------------------------------
            const formData = new URLSearchParams();
            formData.append("username", username.trim());
            formData.append("password", password);

            const loginRes = await api.post(
                "/login",
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            // ------------------------------------------------
            // STEP 3: Store user credentials & token immediately
            // ------------------------------------------------
            const userData = {
                username: loginRes.data?.username || username.trim(),
                role: loginRes.data?.role || "ADMIN",
                token: loginRes.data?.token || ""
            };

            sessionStorage.setItem("dhmUser", JSON.stringify(userData));
            localStorage.setItem("dhmUser", JSON.stringify(userData));

            // Optional verification check with authorization header
            try {
                const response = await api.get("/api/auth/me", {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${userData.token}`,
                        "X-Dhm-User": userData.username
                    }
                });

                if (response.data?.role) {
                    userData.role = response.data.role;
                    sessionStorage.setItem("dhmUser", JSON.stringify(userData));
                    localStorage.setItem("dhmUser", JSON.stringify(userData));
                }
            } catch (verifyErr) {
                // Keep initial credentials from loginRes
            }

            // ------------------------------------------------
            // STEP 4: Navigate to dashboard or vehicle register
            // ------------------------------------------------
            if (userData.role === "SUPERVISOR") {
                navigate("/vehicle-register");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            console.error("Login failed:", error);

            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                setError("Invalid username or password.");
            } else {
                setError("Unable to connect to the server. Please try again.");
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">

            {/* Background effects */}
            <div className="login-glow glow-one"></div>
            <div className="login-glow glow-two"></div>

            {/* Login Card */}
            <div className="login-card">

                {/* Company Branding */}
                <div className="login-brand">
                    <img
                        src="/dhm-logo.jpg"
                        alt="DHM Pyrotech Enterprises"
                        className="company-logo"
                    />
                    <div>
                        <h1>DHM</h1>
                        <h2>Pyrotech Enterprises</h2>
                    </div>
                </div>

                <div className="login-divider"></div>

                {/* Heading */}
                <div className="login-heading">
                    <h2>Welcome Back</h2>
                    <p>Sign in to continue to your dashboard</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="login-error">
                        ⚠ {error}
                    </div>
                )}

                {/* Login Form */}
                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >

                    {/* Username */}
                    <div className="form-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                            <span className="input-icon">◉</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Enter username"
                                autoComplete="username"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">◆</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter password"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? "◉" : "◌"}
                            </button>
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="button-spinner"></span>
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
                                <span>→</span>
                            </>
                        )}
                    </button>

                    {/* Quick Demo Fill Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                        <button
                            type="button"
                            onClick={() => { setUsername('admin'); setPassword('Admin@123'); setError(''); }}
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#b5c4d3', padding: '6px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer' }}
                        >
                            ⚡ Admin Demo
                        </button>
                        <button
                            type="button"
                            onClick={() => { setUsername('supervisor'); setPassword('Supervisor@123'); setError(''); }}
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#b5c4d3', padding: '6px 12px', borderRadius: '7px', fontSize: '11px', cursor: 'pointer' }}
                        >
                            ⚡ Supervisor Demo
                        </button>
                    </div>

                </form>

                {/* Footer */}
                <div className="login-footer">
                    <span>DHM Factory Management System</span>
                    <span>Secure Access</span>
                </div>

            </div>

        </div>
    );
}

export default Login;