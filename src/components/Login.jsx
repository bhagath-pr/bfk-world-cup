import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path if you kept it in src/

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
        <h2>Organizer Login</h2>
        <form onSubmit={handleLogin} className="login-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
        <label>Email</label>
        <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        />
        </div>

        <div className="form-group">
        <label>Password</label>
        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
        {loading ? 'Authenticating...' : 'Log In'}
        </button>
        </form>
        </div>
    );
}
