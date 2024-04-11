// pages/index.js
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import LeagueTable from '../components/LeagueTable';
import MatchResults from '../components/MatchResults';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function Home() {
  const [leagueResults, setLeagueResults] = useState({});
  const [matchHistory, setMatchHistory] = useState([]);
  const [currentMatchDay, setCurrentMatchDay] = useState(0);
  const [baseHomeWinProbability, setBaseHomeWinProbability] = useState(0.5);
  const [positionDiffWeight, setPositionDiffWeight] = useState(0.025);
  const [autoProgress, setAutoProgress] = useState(false);

  useEffect(() => {
    async function fetchCurrentMatchday() {
      try {
        const response = await fetch('https://api.openligadb.de/getcurrentgroup/bl1');
        const currentGroupData = await response.json();
        setCurrentMatchDay(parseInt(currentGroupData.groupOrderID, 10));
      } catch (error) {
        console.error("Error fetching current matchday:", error);
      }
    }

    async function fetchLeagueTable() {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const seasonYear = currentMonth < 7 ? currentYear - 1 : currentYear;

      try {
        const response = await fetch(`https://api.openligadb.de/getbltable/bl1/${seasonYear}`);
        const leagueTableData = await response.json();
        const leagueResults = leagueTableData.reduce((acc, team) => {
          acc[team.teamName] = {
            teamName: team.teamName,
            played: team.matches,
            won: team.won,
            drawn: team.draw,
            lost: team.lost,
            goalsFor: team.goals,
            goalsAgainst: team.opponentGoals,
            goalsDifference: team.goalDiff,
            points: team.points,
          };
          return acc;
        }, {});
        setLeagueResults(leagueResults);
      } catch (error) {
        console.error("Error fetching league table:", error);
      }
    }

    fetchCurrentMatchday();
    fetchLeagueTable();
  }, []);

  function simulateMatch(homeTeam, awayTeam) {
    console.log(`simulateMatch called with homeTeam: ${homeTeam}, awayTeam: ${awayTeam}`);
    const homePosition = Math.floor(Math.random() * 18);
    const awayPosition = Math.floor(Math.random() * 18);
    const rankDiff = homePosition - awayPosition;
    const winProb =
      baseHomeWinProbability + rankDiff * positionDiffWeight;
    const adjustedWinProb = Math.max(0.2, Math.min(0.8, winProb));
    const matchOutcome = Math.random();

    if (matchOutcome < adjustedWinProb) return { result: `${homeTeam} wins`, homeGoals: Math.floor(Math.random() * 5), awayGoals: Math.floor(Math.random() * 3) };
    else if (matchOutcome < adjustedWinProb + 0.2) return { result: `Draw`, homeGoals: Math.floor(Math.random() * 3), awayGoals: Math.floor(Math.random() * 3) };
    else return { result: `${awayTeam} wins`, homeGoals: Math.floor(Math.random() * 2), awayGoals: Math.floor(Math.random() * 4) };
  }

  async function fetchMatchesAndSimulate(matchDay) {

    if (isNaN(currentMatchDay) || currentMatchDay > 34) {
      console.error("Invalid matchDay:", currentMatchDay);
      return;
    }

    setCurrentMatchDay(currentMatchDay);

    const currentYear = new Date().getFullYear();
    let season = currentYear;
    if (new Date().getMonth() < 7) {
      season -= 1;
    }


    try {
      const response = await fetch(
        `https://api.openligadb.de/getmatchdata/bl1/${2023}/${matchDay}`
      );
      const data = await response.json();

      data.forEach((match, index) => {
        if (match.team1 && match.team2) {
          const { result, homeGoals, awayGoals } = simulateMatch(
            match.team1.teamName,
            match.team2.teamName
          );
          updateLeagueResults(
            match.team1.teamName,
            match.team2.teamName,
            homeGoals,
            awayGoals
          );
        } else {
          console.log(`Match ${index + 1} does not have both teams defined.`);
        }
      });

      if (autoProgress && currentMatchDay < 34) {
        setTimeout(() => {
          fetchMatchesAndSimulate(matchDay + 1);
        }, 500); // Adjust delay as needed
      }
    } catch (error) {
      console.error("Error fetching match data:", error);
    }
  }

  async function fetchPlayedMatches() {
    const response = await fetch('https://api.openligadb.de/getmatchdata/bl1/2022');
    const matches = await response.json();
    return matches.filter(match => match.matchIsFinished);
  }

  async function fetchUpcomingMatches() {
    const response = await fetch('https://api.openligadb.de/getmatchdata/bl1/2022');
    const matches = await response.json();
    return matches.filter(match => !match.matchIsFinished);
  }

  function simulateMatches(matches) {
    return matches.map(match => {
      // Einfache Simulation: jedes Team hat eine 50% Chance zu gewinnen
      const homeGoals = Math.floor(Math.random() * 5);
      const awayGoals = Math.floor(Math.random() * 5);
      return {
        ...match,
        matchIsFinished: true,
        matchResults: [{
          resultName: "Endergebnis",
          pointsTeam1: homeGoals,
          pointsTeam2: awayGoals,
          resultOrderID: 2,
          resultTypeID: 2,
          resultDescription: "Ergebnis nach Ende des Spiels"
        }]
      };
    });
  }

  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function fetchAndSimulateMatches() {
      const playedMatches = await fetchPlayedMatches();
      const upcomingMatches = await fetchUpcomingMatches();
      const simulatedMatches = simulateMatches(upcomingMatches);
      setMatches([...playedMatches, ...simulatedMatches]);
    }

    fetchAndSimulateMatches();
  }, []);


  function updateLeagueResults(homeTeam, awayTeam, homeGoals, awayGoals) {
    console.log(`updateLeagueResults called with homeTeam: ${homeTeam}, awayTeam: ${awayTeam}, homeGoals: ${homeGoals}, awayGoals: ${awayGoals}`);
    // Clone the current state to avoid direct mutation
    const updatedLeagueResults = { ...leagueResults };

    // Update home team stats
    if (!updatedLeagueResults[homeTeam]) {
      updatedLeagueResults[homeTeam] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    }
    updatedLeagueResults[homeTeam].played += 1;
    updatedLeagueResults[homeTeam].goalsFor += homeGoals;
    updatedLeagueResults[homeTeam].goalsAgainst += awayGoals;
    if (homeGoals > awayGoals) {
      updatedLeagueResults[homeTeam].won += 1;
      updatedLeagueResults[homeTeam].points += 3;
    } else if (homeGoals === awayGoals) {
      updatedLeagueResults[homeTeam].drawn += 1;
      updatedLeagueResults[homeTeam].points += 1;
    } else {
      updatedLeagueResults[homeTeam].lost += 1;
    }

    // Update away team stats
    if (!updatedLeagueResults[awayTeam]) {
      updatedLeagueResults[awayTeam] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    }
    updatedLeagueResults[awayTeam].played += 1;
    updatedLeagueResults[awayTeam].goalsFor += awayGoals;
    updatedLeagueResults[awayTeam].goalsAgainst += homeGoals;
    if (awayGoals > homeGoals) {
      updatedLeagueResults[awayTeam].won += 1;
      updatedLeagueResults[awayTeam].points += 3;
    } else if (awayGoals === homeGoals) {
      updatedLeagueResults[awayTeam].drawn += 1;
      updatedLeagueResults[awayTeam].points += 1;
    } else {
      updatedLeagueResults[awayTeam].lost += 1;
    }

    // Update the state
    setLeagueResults(updatedLeagueResults);
  }

  const handleStartSimulation = () => {
    setMatchHistory([]);
    setLeagueResults({});
    fetchMatchesAndSimulate(currentMatchDay || 1);
  };

  const handleNextMatchday = () => {
    if (currentMatchDay < 34) {
      fetchMatchesAndSimulate(currentMatchDay + 1);
    }
  };

  const handlePreviousMatchday = () => {
    if (currentMatchDay > 1) {
      fetchMatchesAndSimulate(currentMatchDay - 1);
    }
  };
  const sortedResults = Object.values(leagueResults).sort((a, b) => {
    return b.points - a.points || b.goalsDifference - a.goalsDifference; // Adjust sorting logic as needed
  });
  // Render function with MUI and Tailwind CSS
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-4 mt-4 p-4"
      style={{ backgroundColor: 'var(--space-cadet)', color: 'var(--united-nations-blue)' }}
    >
      <Typography variant="h2" component="h2" className="text-2xl font-bold mb-4" style={{ color: 'var(--argentinian-blue)' }}>Bundesliga Season Simulator</Typography>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <Typography style={{ color: 'var(--lapis-lazuli)' }}>Base Home Win Probability:</Typography>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={baseHomeWinProbability}
            onChange={(e, value) => setBaseHomeWinProbability(value)}
            valueLabelDisplay="auto"
            style={{ color: 'var(--argentinian-blue)' }}
          />
          <Typography style={{ color: 'var(--lapis-lazuli)' }}>{baseHomeWinProbability.toFixed(2)}</Typography>
        </div>
        <div className="flex items-center justify-between">
          <Typography style={{ color: 'var(--lapis-lazuli)' }}>Position Difference Weight:</Typography>
          <Slider
            min={0}
            max={0.1}
            step={0.005}
            value={positionDiffWeight}
            onChange={(e, value) => setPositionDiffWeight(value)}
            valueLabelDisplay="auto"
            style={{ color: 'var(--argentinian-blue)' }}
          />
          <Typography style={{ color: 'var(--lapis-lazuli)' }}>{positionDiffWeight.toFixed(3)}</Typography>
        </div>
      </div>
      <Button variant="contained" style={{ backgroundColor: 'var(--argentinian-blue)', color: 'white' }} onClick={handleStartSimulation}>
        Start Simulator
      </Button>
      <FormControlLabel
        control={<Checkbox checked={autoProgress} onChange={(e) => setAutoProgress(e.target.checked)} />}
        label="Automatically progress through matchdays"
        style={{ color: 'var(--united-nations-blue)' }}
      />
      <div className="flex justify-between my-4">
        <Button variant="contained" style={{ backgroundColor: 'var(--lapis-lazuli)', color: 'white' }} onClick={handlePreviousMatchday} disabled={currentMatchDay <= 1}>
          <ArrowBackIosNewIcon style={{ color: 'var(--united-nations-blue)' }} />
        </Button>
        <Button variant="contained" style={{ backgroundColor: 'var(--indigo-dye)', color: 'white' }} onClick={handleNextMatchday} disabled={currentMatchDay >= 34}>
          <ArrowForwardIosIcon style={{ color: 'var(--united-nations-blue)' }} />
        </Button>
      </div>
      <LeagueTable leagueResults={sortedResults} />

      <MatchResults matchHistory={matches} />
    </motion.div>
  );
}
