function initializeCharts(matchData) {
    // Clear previous charts
    document.querySelectorAll('canvas').forEach(canvas => {
        if (canvas.chart) {
            canvas.chart.destroy();
        }
    });
    
    // Time Dimension Charts
    createMonthlyMatchesChart(matchData);
    createRecentMatchesTrendChart(matchData);
    createMonthlyAverageScoreChart(matchData);
    
    // Match Dimension Charts
    createTournamentDistributionChart(matchData);
    createMatchResultsChart(matchData);
    createScoreDifferenceChart(matchData);
    
    // Team Dimension Charts
    createTeamWinRateChart(matchData);
    createTeamAverageScoreChart(matchData);
    createHomeAwayPerformanceChart(matchData);
    
    // Player Dimension Charts
    createTopScorersChart(matchData);
    createPlayerAppearancesChart(matchData);
    
    // Setup share buttons after all charts are created
    setupShareButtons();
}

// Time Dimension Charts
function createMonthlyMatchesChart(matchData) {
    // Process data - count matches by month
    const monthlyCount = {};
    
    matchData.forEach(match => {
        const date = new Date(match.matchDate);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyCount[monthYear]) {
            monthlyCount[monthYear] = 0;
        }
        monthlyCount[monthYear]++;
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyCount).sort();
    const monthLabels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return `${monthNum}/${year.substring(2)}`;
    });
    const counts = sortedMonths.map(month => monthlyCount[month]);
    
    // Create chart
    const ctx = document.getElementById('monthlyMatchesChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Number of Matches',
                data: counts,
                backgroundColor: 'rgba(24, 144, 255, 0.7)',
                borderColor: 'rgba(24, 144, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
    
    // Store chart reference
    ctx.canvas.chart = chart;
}

function createRecentMatchesTrendChart(matchData) {
    // Take the 10 most recent matches
    const recentMatches = [...matchData]
        .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate))
        .slice(0, 10)
        .reverse(); // Reverse to show chronological order
    
    // Extract dates and total goals for each match
    const matchLabels = recentMatches.map(match => {
        const date = new Date(match.matchDate);
        return `${date.getMonth()+1}/${date.getDate()}`;
    });
    
    const totalGoals = recentMatches.map(match => 
        parseInt(match.homeScore) + parseInt(match.awayScore)
    );
    
    // Create chart
    const ctx = document.getElementById('recentMatchesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: matchLabels,
            datasets: [{
                label: 'Total Goals',
                data: totalGoals,
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function createMonthlyAverageScoreChart(matchData) {
    // Process data - calculate average score by month
    const monthlyScores = {};
    const monthlyMatches = {};
    
    matchData.forEach(match => {
        const date = new Date(match.matchDate);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        const totalScore = parseInt(match.homeScore) + parseInt(match.awayScore);
        
        if (!monthlyScores[monthYear]) {
            monthlyScores[monthYear] = 0;
            monthlyMatches[monthYear] = 0;
        }
        
        monthlyScores[monthYear] += totalScore;
        monthlyMatches[monthYear]++;
    });
    
    // Calculate averages
    const sortedMonths = Object.keys(monthlyScores).sort();
    const monthLabels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return `${monthNum}/${year.substring(2)}`;
    });
    
    const averages = sortedMonths.map(month => 
        (monthlyScores[month] / monthlyMatches[month]).toFixed(1)
    );
    
    // Create chart
    const ctx = document.getElementById('monthlyAverageChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Average Goals per Match',
                data: averages,
                borderColor: 'rgba(124, 58, 237, 1)',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Match Dimension Charts
function createTournamentDistributionChart(matchData) {
    // Count matches by tournament
    const tournamentCounts = {};
    
    matchData.forEach(match => {
        if (!tournamentCounts[match.tournament]) {
            tournamentCounts[match.tournament] = 0;
        }
        tournamentCounts[match.tournament]++;
    });
    
    // Sort tournaments by match count (descending)
    const sortedTournaments = Object.keys(tournamentCounts).sort(
        (a, b) => tournamentCounts[b] - tournamentCounts[a]
    );
    
    const labels = sortedTournaments;
    const data = sortedTournaments.map(tournament => tournamentCounts[tournament]);
    
    // Create a color array with different colors
    const colors = [
        'rgba(239, 68, 68, 0.7)',
        'rgba(249, 115, 22, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(99, 102, 241, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(236, 72, 153, 0.7)'
    ];
    
    // Create chart
    const ctx = document.getElementById('tournamentDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 10
                    }
                }
            }
        }
    });
}

function createMatchResultsChart(matchData) {
    // Count match results: wins, draws, losses
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    
    matchData.forEach(match => {
        const homeScore = parseInt(match.homeScore);
        const awayScore = parseInt(match.awayScore);
        
        if (homeScore > awayScore) {
            homeWins++;
        } else if (homeScore === awayScore) {
            draws++;
        } else {
            awayWins++;
        }
    });
    
    // Create chart
    const ctx = document.getElementById('matchResultsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Home Wins', 'Draws', 'Away Wins'],
            datasets: [{
                label: 'Number of Matches',
                data: [homeWins, draws, awayWins],
                backgroundColor: [
                    'rgba(52, 211, 153, 0.7)',
                    'rgba(251, 191, 36, 0.7)',
                    'rgba(239, 68, 68, 0.7)'
                ],
                borderColor: [
                    'rgba(52, 211, 153, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createScoreDifferenceChart(matchData) {
    // Calculate score differences
    const scoreDifferences = matchData.map(match => {
        return Math.abs(parseInt(match.homeScore) - parseInt(match.awayScore));
    });
    
    // Count occurrences of each difference
    const differenceCount = {};
    scoreDifferences.forEach(diff => {
        if (!differenceCount[diff]) {
            differenceCount[diff] = 0;
        }
        differenceCount[diff]++;
    });
    
    // Prepare data for the chart
    const maxDiff = Math.max(...Object.keys(differenceCount).map(Number));
    const labels = Array.from({length: maxDiff + 1}, (_, i) => i.toString());
    const data = labels.map(diff => differenceCount[diff] || 0);
    
    // Create chart
    const ctx = document.getElementById('scoreDifferenceChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Matches',
                data: data,
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Goal Difference'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Team Dimension Charts functions
function createTeamWinRateChart(matchData) {
    // Calculate team statistics
    const teamStats = {};
    
    // Initialize team stats
    matchData.forEach(match => {
        [match.homeTeam, match.awayTeam].forEach(team => {
            if (!teamStats[team]) {
                teamStats[team] = { matches: 0, wins: 0 };
            }
        });
        
        const homeScore = parseInt(match.homeScore);
        const awayScore = parseInt(match.awayScore);
        
        // Update home team stats
        teamStats[match.homeTeam].matches++;
        if (homeScore > awayScore) {
            teamStats[match.homeTeam].wins++;
        }
        
        // Update away team stats
        teamStats[match.awayTeam].matches++;
        if (awayScore > homeScore) {
            teamStats[match.awayTeam].wins++;
        }
    });
    
    // Calculate win rates and sort
    const teamsWithWinRates = Object.keys(teamStats).map(team => {
        const winRate = teamStats[team].matches > 0 
            ? (teamStats[team].wins / teamStats[team].matches * 100).toFixed(1) 
            : 0;
        return { team, winRate: parseFloat(winRate) };
    });
    
    // Sort by win rate (descending)
    teamsWithWinRates.sort((a, b) => b.winRate - a.winRate);
    
    // Take top 10 teams only
    const topTeams = teamsWithWinRates.slice(0, 10);
    
    // Create chart
    const ctx = document.getElementById('teamWinRateChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topTeams.map(t => t.team),
            datasets: [{
                label: 'Win Rate (%)',
                data: topTeams.map(t => t.winRate),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Win Rate (%)'
                    }
                }
            }
        }
    });
}

function createTeamAverageScoreChart(matchData) {
    // Calculate team scores
    const teamTotalGoals = {};
    const teamMatches = {};
    
    matchData.forEach(match => {
        // Initialize if first occurrence
        [match.homeTeam, match.awayTeam].forEach(team => {
            if (!teamTotalGoals[team]) {
                teamTotalGoals[team] = 0;
                teamMatches[team] = 0;
            }
        });
        
        // Add goals to respective teams
        teamTotalGoals[match.homeTeam] += parseInt(match.homeScore);
        teamTotalGoals[match.awayTeam] += parseInt(match.awayScore);
        
        // Increment match counters
        teamMatches[match.homeTeam]++;
        teamMatches[match.awayTeam]++;
    });
    
    // Calculate average goals per match
    const teamsWithAvg = Object.keys(teamTotalGoals).map(team => {
        const avgGoals = teamMatches[team] > 0 
            ? (teamTotalGoals[team] / teamMatches[team]).toFixed(2) 
            : 0;
        return { team, avgGoals: parseFloat(avgGoals) };
    });
    
    // Sort by average goals (descending)
    teamsWithAvg.sort((a, b) => b.avgGoals - a.avgGoals);
    
    // Take top 10 teams
    const topTeams = teamsWithAvg.slice(0, 10);
    
    // Create chart
    const ctx = document.getElementById('teamAvgScoreChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topTeams.map(t => t.team),
            datasets: [{
                label: 'Average Goals per Match',
                data: topTeams.map(t => t.avgGoals),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Avg Goals'
                    }
                }
            }
        }
    });
}

function createHomeAwayPerformanceChart(matchData) {
    // Track home and away performance for teams
    const teamHomeAway = {};
    
    matchData.forEach(match => {
        const homeTeam = match.homeTeam;
        const awayTeam = match.awayTeam;
        const homeScore = parseInt(match.homeScore);
        const awayScore = parseInt(match.awayScore);
        
        // Initialize team stats if first occurrence
        [homeTeam, awayTeam].forEach(team => {
            if (!teamHomeAway[team]) {
                teamHomeAway[team] = {
                    homeMatches: 0, homeGoals: 0,
                    awayMatches: 0, awayGoals: 0
                };
            }
        });
        
        // Update home team stats
        teamHomeAway[homeTeam].homeMatches++;
        teamHomeAway[homeTeam].homeGoals += homeScore;
        
        // Update away team stats
        teamHomeAway[awayTeam].awayMatches++;
        teamHomeAway[awayTeam].awayGoals += awayScore;
    });
    
    // Calculate average home and away goals
    const teamsWithHomeAwayAvg = Object.keys(teamHomeAway).map(team => {
        const stats = teamHomeAway[team];
        const homeAvg = stats.homeMatches > 0 ? (stats.homeGoals / stats.homeMatches).toFixed(2) : 0;
        const awayAvg = stats.awayMatches > 0 ? (stats.awayGoals / stats.awayMatches).toFixed(2) : 0;
        
        // Only include teams with both home and away matches
        if (stats.homeMatches === 0 || stats.awayMatches === 0) {
            return null;
        }
        
        return {
            team,
            homeAvg: parseFloat(homeAvg),
            awayAvg: parseFloat(awayAvg)
        };
    }).filter(Boolean);
    
    // Sort by total average (home + away)
    teamsWithHomeAwayAvg.sort((a, b) => 
        (b.homeAvg + b.awayAvg) - (a.homeAvg + a.awayAvg)
    );
    
    // Take top 6 teams for readability
    const topTeams = teamsWithHomeAwayAvg.slice(0, 6);
    
    // Create chart
    const ctx = document.getElementById('homeAwayPerformanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topTeams.map(t => t.team),
            datasets: [
                {
                    label: 'Home Avg Goals',
                    data: topTeams.map(t => t.homeAvg),
                    backgroundColor: 'rgba(124, 58, 237, 0.7)',
                    borderColor: 'rgba(124, 58, 237, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Away Avg Goals',
                    data: topTeams.map(t => t.awayAvg),
                    backgroundColor: 'rgba(236, 72, 153, 0.7)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Player Dimension Charts
function createTopScorersChart(matchData) {
    // Aggregate total goals by player
    const playerGoals = {};
    
    matchData.forEach(match => {
        if (!match.scorers) return;
        
        match.scorers.forEach(scorer => {
            const playerName = scorer.playerName;
            const goals = parseInt(scorer.goals) || 0;
            
            if (!playerGoals[playerName]) {
                playerGoals[playerName] = 0;
            }
            
            playerGoals[playerName] += goals;
        });
    });
    
    // Sort players by goals (descending)
    const sortedPlayers = Object.keys(playerGoals).map(player => ({
        name: player,
        goals: playerGoals[player]
    })).sort((a, b) => b.goals - a.goals);
    
    // Take top 10 players
    const topPlayers = sortedPlayers.slice(0, 10);
    
    // Create chart
    const ctx = document.getElementById('topScorersChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topPlayers.map(p => p.name),
            datasets: [{
                label: 'Total Goals',
                data: topPlayers.map(p => p.goals),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function createPlayerAppearancesChart(matchData) {
    // Count player appearances
    const playerAppearances = {};
    
    matchData.forEach(match => {
        if (!match.scorers) return;
        
        // Count unique appearances in this match
        const matchPlayers = new Set();
        match.scorers.forEach(scorer => {
            matchPlayers.add(scorer.playerName);
        });
        
        // Update player appearances counter
        matchPlayers.forEach(playerName => {
            if (!playerAppearances[playerName]) {
                playerAppearances[playerName] = 0;
            }
            playerAppearances[playerName]++;
        });
    });
    
    // Sort players by number of appearances (descending)
    const sortedPlayers = Object.keys(playerAppearances).map(player => ({
        name: player,
        appearances: playerAppearances[player]
    })).sort((a, b) => b.appearances - a.appearances);
    
    // Take top 10 players
    const topPlayers = sortedPlayers.slice(0, 10);
    
    // Create chart
    const ctx = document.getElementById('playerAppearancesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topPlayers.map(p => p.name),
            datasets: [{
                label: 'Match Appearances',
                data: topPlayers.map(p => p.appearances),
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
} 