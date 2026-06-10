import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function WildcardStandings() {
    const [wildcards, setWildcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchWildcards() {
            try {
                setLoading(true);
                const { data, error: supabaseError } = await supabase
                .from('third_place_wildcards')
                .select('*');

                if (supabaseError) throw supabaseError;
                setWildcards(data || []);
            } catch (err) {
                console.error('Error fetching wildcards:', err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchWildcards();
    }, []);

    if (loading) return <div>Loading wildcard tracking matrix...</div>;
    if (error) return <div>System Error: {error}</div>;

    return (
        <div className="wildcard-container">
        <h2>3rd-Place Wildcard Standings</h2>
        <p className="subtitle">The top 8 teams advance to the Round of 32</p>

        <table className="wildcard-table">
        <thead>
        <tr>
        <th>Rank</th>
        <th>Group</th>
        <th>Team / Player</th>
        <th>MP</th>
        <th>W</th>
        <th>GD</th>
        <th>GF</th>
        <th>FPP</th>
        <th>PTS</th>
        <th>Status</th>
        </tr>
        </thead>
        <tbody>
        {wildcards.map((team, index) => {
            const overallRank = index + 1;
            const isAdvancing = overallRank <= 8;

            return (
                <React.Fragment key={team.team_id}>
                {/* Visual anchor showing where the tournament cut-off line sits */}
                {overallRank === 9 && (
                    <tr className="cutoff-row">
                    <td colSpan="10" className="cutoff-text">
                    ▲ TOP 8 ADVANCE / BOTTOM 4 ELIMINATED ▼
                    </td>
                    </tr>
                )}

                <tr className={isAdvancing ? 'row-advancing' : 'row-eliminated'}>
                <td><strong>{overallRank}</strong></td>
                <td>Group {team.group_id}</td>
                <td>
                <strong>{team.team_name}</strong>
                <span className="player-tag"> ({team.player_name})</span>
                </td>
                <td>{team.mp}</td>
                <td>{team.w}</td>
                <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                <td>{team.gf}</td>
                <td>{team.fpp}</td>
                <td><strong>{team.pts}</strong></td>
                <td>
                <span className={`status-badge ${isAdvancing ? 'badge-pass' : 'badge-fail'}`}>
                {isAdvancing ? 'Advancing' : 'Eliminated'}
                </span>
                </td>
                </tr>
                </React.Fragment>
            );
        })}
        </tbody>
        </table>
        </div>
    );
}
