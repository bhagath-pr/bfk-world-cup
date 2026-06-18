import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState({});
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        homeScore: 0, awayScore: 0,
        homeYellows: 0, awayYellows: 0,
        homeReds: 0, awayReds: 0,
    });

    // Fetch Scheduled Matches and Teams
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get all teams to create a lookup dictionary
            const { data: teamsData, error: teamsError } = await supabase.from('teams').select('*');
            if (teamsError) throw teamsError;

            const teamDict = {};
            teamsData.forEach(t => teamDict[t.id] = t);
            setTeams(teamDict);

            // 2. Get matches that are still waiting to be played
            const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .eq('status', 'Scheduled')
            .order('id', { ascending: true });

            if (matchesError) throw matchesError;
            setMatches(matchesData || []);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectMatch = (match) => {
        setSelectedMatch(match);
        // Reset form when a new match is selected
        setFormData({
            homeScore: 0, awayScore: 0,
            homeYellows: 0, awayYellows: 0,
            homeReds: 0, awayReds: 0,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMatch) return;

        try {
            const { error } = await supabase
            .from('matches')
            .update({
                home_score: formData.homeScore,
                away_score: formData.awayScore,
                home_yellow_cards: formData.homeYellows,
                away_yellow_cards: formData.awayYellows,
                home_red_cards: formData.homeReds,
                away_red_cards: formData.awayReds,
                status: 'Completed' // This triggers the standings recalculation
            })
            .eq('id', selectedMatch.id);

            if (error) throw error;

            alert('Match successfully finalized!');
            setSelectedMatch(null);
            fetchData(); // Refresh the pending list
        } catch (error) {
            console.error("Error updating match:", error.message);
            alert('Failed to update match. Check console.');
        }
    };

    if (loading) return <div>Loading Admin Panel...</div>;

    return (
        <div className="admin-panel">
        <h2>Tournament Admin Control</h2>

        {!selectedMatch ? (
            <div className="match-selector">
            <h3>Select a Match to Finalize</h3>
            {matches.length === 0 ? (
                <p>All scheduled matches have been completed!</p>
            ) : (
                <ul className="pending-matches-list">
                {matches.map(m => (
                    <li key={m.id}>
                    <button onClick={() => handleSelectMatch(m)}>
                    Match {m.id}: {teams[m.home_team_id]?.name} vs {teams[m.away_team_id]?.name}
                    </button>
                    </li>
                ))}
                </ul>
            )}
            </div>
        ) : (
            <div className="match-entry-form">
            <h3>
            Finalizing: {teams[selectedMatch.home_team_id]?.name} vs {teams[selectedMatch.away_team_id]?.name}
            </h3>
            <button className="back-btn" onClick={() => setSelectedMatch(null)}>← Back to List</button>

            <form onSubmit={handleSubmit} className="score-form">
            <div className="team-column">
            <h4>{teams[selectedMatch.home_team_id]?.name} (Home)</h4>
            <label>Goals: <input type="number" min="0" name="homeScore" value={formData.homeScore} onChange={handleInputChange} /></label>
            <label>Yellow Cards: <input type="number" min="0" name="homeYellows" value={formData.homeYellows} onChange={handleInputChange} /></label>
            <label>Red Cards: <input type="number" min="0" name="homeReds" value={formData.homeReds} onChange={handleInputChange} /></label>
            </div>

            <div className="team-column">
            <h4>{teams[selectedMatch.away_team_id]?.name} (Away)</h4>
            <label>Goals: <input type="number" min="0" name="awayScore" value={formData.awayScore} onChange={handleInputChange} /></label>
            <label>Yellow Cards: <input type="number" min="0" name="awayYellows" value={formData.awayYellows} onChange={handleInputChange} /></label>
            <label>Red Cards: <input type="number" min="0" name="awayReds" value={formData.awayReds} onChange={handleInputChange} /></label>
            </div>

            <button type="submit" className="submit-btn">Finalize Match Results</button>
            </form>
            </div>
        )}
        </div>
    );
}
