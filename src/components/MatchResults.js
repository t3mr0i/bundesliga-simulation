import React, { useState, useEffect } from 'react';

function MatchResults({ matchHistory }) {
    const [selectedMatchday, setSelectedMatchday] = useState('');

    const uniqueMatchdays = [...new Set(matchHistory.map(match => match.group.groupName))];
    const handleMatchdayChange = (event) => {
        setSelectedMatchday(event.target.value);
    };


    const filteredMatches = matchHistory.filter(match => match.group.groupName === selectedMatchday);
    console.log("Selected Matchday:", selectedMatchday);
    console.log("Filtered Matches:", filteredMatches);
    return (
        <div>
            <label htmlFor="matchday-select">Matchday:</label>
            <select onChange={handleMatchdayChange}>
                {uniqueMatchdays.map(matchday => (
                    <option key={matchday} value={matchday}>{matchday}</option>
                ))}
            </select>

            <ul>
                {filteredMatches.map((match, index) => (
                    <li key={index}>
                        {match.team1.teamName} vs {match.team2.teamName} - Result: {match.matchResults[0].pointsTeam1} : {match.matchResults[0].pointsTeam2}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MatchResults;
