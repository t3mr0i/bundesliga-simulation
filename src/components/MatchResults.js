import React, { useState } from 'react';

function MatchResults({ matchHistory }) {
    const [selectedMatchday, setSelectedMatchday] = useState('');

    if (!matchHistory || matchHistory.length === 0) {
        return <div>No match history available.</div>;
    }

    const uniqueMatchdays = [...new Set(matchHistory.map(match => match.group.groupName))];
    const handleMatchdayChange = (event) => {
        setSelectedMatchday(event.target.value);
    };

    const filteredMatches = matchHistory.filter(match => match.group.groupName === selectedMatchday);

    return (
        <div>
            <label htmlFor="matchday-select">Matchday:</label>
            <select value={selectedMatchday} onChange={handleMatchdayChange} id="matchday-select">
                <option value="">Select a matchday</option>
                {uniqueMatchdays.map(matchday => (
                    <option key={matchday} value={matchday}>{matchday}</option>
                ))}
            </select>

            {selectedMatchday === '' ? (
                <div>Please select a matchday to view results.</div>
            ) : filteredMatches.length > 0 ? (
                <ul>
                    {filteredMatches.map((match, index) => (
                        <li key={index}>
                            {match.team1.teamName} vs {match.team2.teamName} - Result: {match.matchResults[0].pointsTeam1} : {match.matchResults[0].pointsTeam2}
                        </li>
                    ))}
                </ul>
            ) : (
                <div>No matches found for the selected matchday.</div>
            )}
        </div>
    );
}

export default MatchResults;