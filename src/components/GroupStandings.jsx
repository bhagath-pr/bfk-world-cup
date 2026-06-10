import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function GroupStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        
        // Querying the database view directly
        const { data, error: supabaseError } = await supabase
          .from('group_standings')
          .select('*');

        if (supabaseError) throw supabaseError;
        
        setStandings(data || []);
      } catch (err) {
        console.error('Error fetching standings:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, []);

  if (loading) return <div>Loading tournament standings...</div>;
  if (error) return <div>System Error: {error}</div>;

  // Helper utility to separate the flat data into structural groups (A-L)
  const groups = standings.reduce((acc, row) => {
    if (!acc[row.group_id]) acc[row.group_id] = [];
    acc[row.group_id].push(row);
    return acc;
  }, {});

  return (
    <div className="standings-container">
      {Object.keys(groups).sort().map((groupId) => (
        <div key={groupId} className="group-table-wrap">
          <h2>Group {groupId}</h2>
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th>MP</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GD</th>
                <th>GF</th>
                <th>FPP</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
            {groups[groupId].map((team, index) => (
              <tr key={team.team_id}>
              <td>{index + 1}</td>
              <td className="team-name-cell">
              <strong>{team.team_name}</strong>
              </td>
              <td>{team.mp}</td>
              <td>{team.w}</td>
              <td>{team.d}</td>
              <td>{team.l}</td>
              <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              <td>{team.gf}</td>
              <td>{team.fpp}</td>
              <td><strong>{team.pts}</strong></td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
