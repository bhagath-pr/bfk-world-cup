import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FIXED_MATCHUPS, generateWildcardMatches } from '../lib/knockoutRouter';

export default function KnockoutBracket() {
    const [matchups, setMatchups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function buildBracket() {
            try {
                setLoading(true);

                // 1. Fetch the overall group standings
                const { data: standingsData, error: standingsError } = await supabase
                .from('group_standings')
                .select('*');
                if (standingsError) throw standingsError;

                // 2. Fetch the 3rd-place wildcards
                const { data: wildcardData, error: wildcardError } = await supabase
                .from('third_place_wildcards')
                .select('*');
                if (wildcardError) throw wildcardError;

                // 3. Create a Team Lookup Dictionary
                // We need to map codes like "1A" or "2B" to the actual team names
                const teamLookup = {};

                // Group the standings by group_id and sort them
                const groups = standingsData.reduce((acc, row) => {
                    if (!acc[row.group_id]) acc[row.group_id] = [];
                    acc[row.group_id].push(row);
                    return acc;
                }, {});

                // Assign 1st and 2nd place codes
                Object.keys(groups).forEach(groupId => {
                    const groupTeams = groups[groupId];
                    if (groupTeams.length >= 1) teamLookup[`1${groupId}`] = groupTeams[0];
                    if (groupTeams.length >= 2) teamLookup[`2${groupId}`] = groupTeams[1];
                });

                // Get the top 8 wildcards and assign their 3rd place codes
                const top8Wildcards = (wildcardData || []).slice(0, 8);
                top8Wildcards.forEach(team => {
                    teamLookup[`3${team.group_id}`] = team;
                });

                // 4. Generate the Wildcard Matches using the Annex C matrix
                console.log("--- WILDCARD DEBUGGER ---");
                console.log("Top 8 Teams Array:", top8Wildcards);
                console.log("Generated Key string:", top8Wildcards.map(t => t.group_id).sort().join(''));
                const dynamicMatches = generateWildcardMatches(top8Wildcards);

                // If the matrix returned empty (meaning exactly 8 teams haven't qualified yet), we just show placeholders
                const allMatches = [...FIXED_MATCHUPS, ...(dynamicMatches.length > 0 ? dynamicMatches : [
                    { match: 74, home: '1E', away: 'TBD' },
                    { match: 77, home: '1I', away: 'TBD' },
                    { match: 79, home: '1A', away: 'TBD' },
                    { match: 80, home: '1L', away: 'TBD' },
                    { match: 81, home: '1D', away: 'TBD' },
                    { match: 82, home: '1G', away: 'TBD' },
                    { match: 85, home: '1B', away: 'TBD' },
                    { match: 87, home: '1K', away: 'TBD' }
                ])];

                // Sort by Match ID chronologically
                allMatches.sort((a, b) => a.match - b.match);

                // Attach actual team data to the match objects
                const resolvedMatchups = allMatches.map(m => ({
                    matchId: m.match,
                    homeCode: m.home,
                    awayCode: m.away,
                    homeTeam: teamLookup[m.home] || null,
                    awayTeam: teamLookup[m.away] || null
                }));

                setMatchups(resolvedMatchups);
            } catch (err) {
                console.error("Error building bracket:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        buildBracket();
    }, []);

    if (loading) return <div>Loading Knockout Bracket...</div>;
    if (error) return <div>System Error: {error}</div>;

    return (
        <div className="knockout-container">
        <h2>Round of 32 Matchups</h2>
        <div className="bracket-grid">
        {matchups.map((m) => (
            <div key={m.matchId} className="match-card">
            <div className="match-header">Match {m.matchId}</div>
            <div className="team-row">
            <span className="seed-badge">{m.homeCode}</span>
            <span className="team-name">{m.homeTeam ? m.homeTeam.team_name : 'TBD'}</span>
            </div>
            <div className="vs-divider">vs</div>
            <div className="team-row">
            <span className="seed-badge">{m.awayCode}</span>
            <span className="team-name">{m.awayTeam ? m.awayTeam.team_name : 'TBD'}</span>
            </div>
            </div>
        ))}
        </div>
        </div>
    );
}
