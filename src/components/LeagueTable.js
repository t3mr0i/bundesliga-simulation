import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
// In LeagueTable.js
// In LeagueTable.js
export default function LeagueTable({ leagueResults }) {
    // Use leagueResults directly, which is now the sortedResults from the parent component
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

                        <TableCell align="right">Points</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.values(leagueResults).map((team, index) => (
                        <TableRow key={team.teamName}>
                            <TableCell component="th" scope="row">
                                {team.teamName}
                            </TableCell>
                            <TableCell align="right">{team.played}</TableCell>
                            <TableCell align="right">{team.won}</TableCell>
                            <TableCell align="right">{team.drawn}</TableCell>
                            <TableCell align="right">{team.lost}</TableCell>

                            <TableCell align="right">{team.goalsDifference}</TableCell>
                            <TableCell align="right">{team.points}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
