import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // Adjust path if needed
import GroupStandings from './components/GroupStandings';
import WildcardStandings from './components/WildcardStandings';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import './App.css';
import KnockoutBracket from './components/KnockoutBracket';

function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [session, setSession] = useState(null);

  // Listen for login/logout events
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to changes (e.g., when a user logs in or out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="app-wrapper">
    <header>
    <h1>BFK World Cup 2026</h1>
    <div className="header-controls">
    <button
    className="view-toggle-btn"
    onClick={() => setIsAdminView(!isAdminView)}
    >
    {isAdminView ? 'Switch to Public Dashboard' : 'Switch to Admin Panel'}
    </button>

    {/* Show Logout button only if logged in and on the Admin View */}
    {session && isAdminView && (
      <button className="logout-btn" onClick={handleLogout}>
      Log Out
      </button>
    )}
    </div>
    </header>

    <main className="dashboard-layout">
    {isAdminView ? (
      <section className="full-width-panel">
      {/* The Protection Logic: If no session, show Login. If session, show AdminPanel. */}
      {!session ? <Login /> : <AdminPanel />}
      </section>
    ) : (
      <>
      <section className="left-panel">
      <GroupStandings />
      </section>
      <section className="right-panel">
      <WildcardStandings />
      </section>
      <section className="full-width-panel" style={{ marginTop: '2rem' }}>
      <KnockoutBracket />
      </section>
      </>
    )}
    </main>
    </div>
  );
}

export default App;
