import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export default function LeagueTable({ leagueResults }) {
    return (
        <TableContainer component={Paper} elevation={3}>
            <Table aria-label="league table">
                <TableHead>
                    <TableRow>
                        <TableCell>Team</TableCell>
                        <TableCell align="right">Played</TableCell>
                        <TableCell align="right">Won</TableCell>
                        <TableCell align="right">Drawn</TableCell>
                        <TableCell align="right">Lost</TableCell>
                        <TableCell align="right">Goals For</TableCell>
                        <TableCell align="right">Goals Against</TableCell>
                        <TableCell align="right">Goal Difference</TableCell>
                        <TableCell align="right">Points</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {leagueResults?.map((team) => (
                        <TableRow key={team.teamInfoId}>
                            <TableCell component="th" scope="row">
                                {team.teamName}
                            </TableCell>
                            <TableCell align="right">{team.matches}</TableCell>
                            <TableCell align="right">{team.won}</TableCell>
                            <TableCell align="right">{team.draw}</TableCell>
                            <TableCell align="right">{team.lost}</TableCell>
                            <TableCell align="right">{team.goals}</TableCell>
                            <TableCell align="right">{team.opponentGoals}</TableCell>
                            <TableCell align="right">{team.goalDiff}</TableCell>
                            <TableCell align="right">{team.points}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}