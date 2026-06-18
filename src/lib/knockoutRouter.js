/**
 * 1. The Fixed Round of 32 Matchups
 * Exactly half of the bracket is hardcoded by FIFA. These never change.
 */
export const FIXED_MATCHUPS = [
    { match: 73, home: '2A', away: '2B' },
{ match: 75, home: '1F', away: '2C' },
{ match: 76, home: '1C', away: '2F' },
{ match: 78, home: '2E', away: '2I' },
{ match: 83, home: '2K', away: '2L' },
{ match: 84, home: '1H', away: '2J' },
{ match: 86, home: '1J', away: '2H' },
{ match: 88, home: '2D', away: '2G' }
];

/**
 * 2. The Annex C Lookup Dictionary (Snippet)
 * The keys are an alphabetically sorted string of the 8 advancing groups.
 * The values tell you exactly which group's 3rd-place team goes to which slot.
 * * Note: You will need to paste the full 495-combination JSON here.
 */
const ANNEX_C_MATRIX = {
    // Scenario 1: Groups A, B, C, D, E, F, G, H produce the best 3rd-place teams
    "ABCDEFGH": {
        "1E": "3A", "1I": "3B", "1A": "3C", "1L": "3D",
        "1G": "3E", "1D": "3F", "1B": "3G", "1K": "3H"
    },
    // Scenario 2: Groups A, B, C, D, E, F, G, I advance
    "ABCDEFGI": {
        "1E": "3A", "1I": "3B", "1A": "3C", "1L": "3D",
        "1G": "3E", "1D": "3F", "1B": "3G", "1K": "3I"
    },
    // ... 493 more combinations
};

/**
 * 3. The Extraction and Routing Algorithm
 * This function takes your 8 advancing wildcard teams, sorts their groups into a string,
 * checks the dictionary, and generates the dynamic matches.
 */
export function generateWildcardMatches(advancingWildcards) {
    // Step 1: Extract the group letters from the 8 teams (e.g., ['A', 'C', 'F', ...])
    const advancingGroups = advancingWildcards.map(team => team.group_id);

    // Step 2: Sort them alphabetically and join into a single string (e.g., "ACF...")
    const combinationKey = advancingGroups.sort().join('');

    // Step 3: Look up the FIFA routing rule for this specific combination
    const routingRule = ANNEX_C_MATRIX[combinationKey];

    if (!routingRule) {
        console.error(`Error: Combination ${combinationKey} not found in Annex C matrix.`);
        return [];
    }

    // Step 4: Map the wildcard teams to their specific Match IDs based on the FotMob/FIFA bracket
    // match 74: 1E vs 3rd
    // match 77: 1I vs 3rd
    // match 79: 1A vs 3rd
    // match 80: 1L vs 3rd
    // match 81: 1D vs 3rd
    // match 82: 1G vs 3rd
    // match 85: 1B vs 3rd
    // match 87: 1K vs 3rd

    return [
        { match: 74, home: '1E', away: routingRule["1E"] },
        { match: 77, home: '1I', away: routingRule["1I"] },
        { match: 79, home: '1A', away: routingRule["1A"] },
        { match: 80, home: '1L', away: routingRule["1L"] },
        { match: 81, home: '1D', away: routingRule["1D"] },
        { match: 82, home: '1G', away: routingRule["1G"] },
        { match: 85, home: '1B', away: routingRule["1B"] },
        { match: 87, home: '1K', away: routingRule["1K"] }
    ];
}
