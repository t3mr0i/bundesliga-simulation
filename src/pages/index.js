import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LeagueTable from '../components/LeagueTable';
import MatchResults from '../components/MatchResults';

const maxMatchDay = 34; // Assuming a Bundesliga season has 34 matchdays

export default function Home() {
  const [matchesResponse, setMatchesResponse] = useState([]);
  const [currentMatchDay, setCurrentMatchDay] = useState(0);
  const [baseHomeWinProbability, setBaseHomeWinProbability] = useState(0.5);
  const [positionDiffWeight, setPositionDiffWeight] = useState(0.05);
  const [leagueTable, setLeagueTable] = useState([]);
  const [leagueResults, setLeagueResults] = useState({});
  useEffect(() => {
    fetchAllMatches();
    fetchLeagueTable();
  }, []);

  async function fetchAllMatches() {
    try {
      const response = await fetch(`https://api.openligadb.de/getmatchdata/bl1/2023`);
      const allMatches = await response.json();
      // Mark each fetched match as real
      const markedMatches = allMatches.map(match => ({ ...match, isSimulated: false }));
      setMatchesResponse(markedMatches);

      // Determine the current matchday based on the fetched matches
      const currentGroupData = allMatches.find(match => match.matchIsFinished).group;
      const currentMatchDay = currentGroupData ? parseInt(currentGroupData.groupOrderID, 10) : 0;
      setCurrentMatchDay(currentMatchDay);
    } catch (error) {
      console.error("Error fetching matches data:", error);
    }
  }

  async function fetchLeagueTable() {
    try {
      const response = await fetch(`https://api.openligadb.de/getbltable/bl1/2022`);
      const tableData = await response.json();
      setLeagueTable(tableData);
    } catch (error) {
      console.error("Error fetching league table:", error);
    }
  }

  function simulateFutureMatchdays(startMatchDay) {
    console.log(`Simulating future matchdays starting from ${startMatchDay}...`);

    const simulatedMatches = matchesResponse.map(match => {
      if (match.group.groupOrderID >= startMatchDay && !match.isSimulated) {
        // Prepare teams for simulation
        const homeTeam = match.team1.teamName;
        const awayTeam = match.team2.teamName;

        // Simulate the match
        const simulationResult = simulateMatch(homeTeam, awayTeam);

        // Update the match with the simulated result
        const simulatedMatch = {
          ...match,
          isSimulated: true,
          matchResults: [{
            pointsTeam1: simulationResult.homeGoals,
            pointsTeam2: simulationResult.awayGoals
          }]
        };
        return simulatedMatch;
      }
      return match;
    });

    setMatchesResponse(simulatedMatches);
    updateLeagueResults();

  }

  function simulateMatch(homeTeam, awayTeam) {
    console.log(`simulateMatch called with homeTeam: ${homeTeam}, awayTeam: ${awayTeam}`);
    const homePosition = Math.floor(Math.random() * 18);
    const awayPosition = Math.floor(Math.random() * 18);
    const rankDiff = homePosition - awayPosition;
    const winProb = baseHomeWinProbability + rankDiff * positionDiffWeight;
    const adjustedWinProb = Math.max(0.2, Math.min(0.8, winProb));
    const matchOutcome = Math.random();

    // Determine match outcome based on adjustedWinProb
    let homeGoals, awayGoals;
    if (matchOutcome < adjustedWinProb) {
      // Home win
      homeGoals = Math.floor(Math.random() * 4) + 1; // Random goals between 1 and 4
      awayGoals = Math.floor(Math.random() * homeGoals); // Away goals less than or equal to home goals
    } else if (matchOutcome < adjustedWinProb + (1 - adjustedWinProb) / 2) {
      // Draw
      homeGoals = awayGoals = Math.floor(Math.random() * 3); // Random goals between 0 and 2
    } else {
      // Away win
      awayGoals = Math.floor(Math.random() * 4) + 1; // Random goals between 1 and 4
      homeGoals = Math.floor(Math.random() * awayGoals); // Home goals less than or equal to away goals
    }

    return { homeGoals, awayGoals };
  }

  function updateLeagueResults() {
    console.log("Updating league results based on matchesResponse...");

    const newLeagueResults = {};

    matchesResponse.forEach(match => {
      if (!match.isSimulated || (match.isSimulated && someOtherCondition)) {
        const homeTeam = match.team1.teamName;
        const awayTeam = match.team2.teamName;
        const homeGoals = match.matchResults?.[0]?.pointsTeam1 ?? 'N/A';
        const awayGoals = match.matchResults?.[0]?.pointsTeam2 ?? 'N/A';

        // Initialize teams in newLeagueResults if they don't exist
        if (!newLeagueResults[homeTeam]) {
          newLeagueResults[homeTeam] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
        }
        if (!newLeagueResults[awayTeam]) {
          newLeagueResults[awayTeam] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
        }

        // Update played games
        newLeagueResults[homeTeam].played += 1;
        newLeagueResults[awayTeam].played += 1;

        // Update goals
        newLeagueResults[homeTeam].goalsFor += homeGoals;
        newLeagueResults[homeTeam].goalsAgainst += awayGoals;
        newLeagueResults[awayTeam].goalsFor += awayGoals;
        newLeagueResults[awayTeam].goalsAgainst += homeGoals;

        // Determine match outcome and update records
        if (homeGoals > awayGoals) { // Home win
          newLeagueResults[homeTeam].won += 1;
          newLeagueResults[awayTeam].lost += 1;
          newLeagueResults[homeTeam].points += 3;
        } else if (homeGoals < awayGoals) { // Away win
          newLeagueResults[awayTeam].won += 1;
          newLeagueResults[homeTeam].lost += 1;
          newLeagueResults[awayTeam].points += 3;
        } else { // Draw
          newLeagueResults[homeTeam].drawn += 1;
          newLeagueResults[awayTeam].drawn += 1;
          newLeagueResults[homeTeam].points += 1;
          newLeagueResults[awayTeam].points += 1;
        }
      }
    });

    // Update the state with the new league standings
    setLeagueResults(newLeagueResults);
  }

  const handleStartSimulation = () => {
    // Reset to initial state and fetch all matches again
    fetchAllMatches();
  };

  const handleNextMatchday = () => {
    if (currentMatchDay < maxMatchDay) {
      simulateFutureMatchdays(currentMatchDay + 1);
    }
  };

  const handleBaseHomeWinProbabilityChange = (event, newValue) => {
    setBaseHomeWinProbability(newValue);
  };

  const handlePositionDiffWeightChange = (event, newValue) => {
    setPositionDiffWeight(newValue);
  };

  // Filter matches up to the current matchday for display
  const matchesUpToCurrent = matchesResponse.filter(match => match.group.groupOrderID <= currentMatchDay);

  return (
    <Box sx={{ width: 300 }}>
      <Typography id="base-home-win-probability-slider" gutterBottom>
        Base Home Win Probability
      </Typography>
      <Slider
        value={baseHomeWinProbability}
        onChange={handleBaseHomeWinProbabilityChange}
        aria-labelledby="base-home-win-probability-slider"
        valueLabelDisplay="auto"
        step={0.01}
        marks
        min={0}
        max={1}
      />
      <Typography id="position-diff-weight-slider" gutterBottom>
        Position Difference Weight
      </Typography>
      <Slider
        value={positionDiffWeight}
        onChange={handlePositionDiffWeightChange}
        aria-labelledby="position-diff-weight-slider"
        valueLabelDisplay="auto"
        step={0.01}
        marks
        min={0}
        max={0.1}
      />
      <Button onClick={handleStartSimulation}>Start Simulation</Button>
      <Button onClick={handleNextMatchday}>Next Matchday</Button>
      {/* Button for previous matchday if implemented */}
      <LeagueTable leagueResults={leagueTable} />
      <MatchResults matchesUpToCurrent={matchesUpToCurrent} />
    </Box>
  );
}