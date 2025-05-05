document.addEventListener('DOMContentLoaded', function() {
    // Get match data from localStorage
    const matchData = JSON.parse(localStorage.getItem('matchData')) || [];
    const teamsGrid = document.getElementById('teamsGrid');
    const emptyTeamsState = document.getElementById('emptyTeamsState');
    
    // Function to generate team stats from match data
    function generateTeamStats() {
        if (matchData.length === 0) {
            // Show empty state if no data
            emptyTeamsState.classList.remove('hidden');
            teamsGrid.classList.add('hidden');
            return;
        }
        
        // Hide empty state and show grid
        emptyTeamsState.classList.add('hidden');
        teamsGrid.classList.remove('hidden');
        
        // Extract all team names from matches
        const allTeams = new Set();
        matchData.forEach(match => {
            allTeams.add(match.homeTeam);
            allTeams.add(match.awayTeam);
        });
        
        // Calculate stats for each team
        const teamStats = {};
        
        allTeams.forEach(team => {
            // Initialize team stats
            teamStats[team] = {
                name: team,
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                points: 0,
                scorers: {}
            };
            
            // Calculate match statistics
            matchData.forEach(match => {
                // Only process matches where this team played
                if (match.homeTeam === team || match.awayTeam === team) {
                    teamStats[team].matches++;
                    
                    const homeScore = parseInt(match.homeScore);
                    const awayScore = parseInt(match.awayScore);
                    
                    if (match.homeTeam === team) {
                        // Team played as home team
                        teamStats[team].goalsFor += homeScore;
                        teamStats[team].goalsAgainst += awayScore;
                        
                        if (homeScore > awayScore) {
                            teamStats[team].wins++;
                            teamStats[team].points += 2;  // 2 points for a win
                        } else if (homeScore === awayScore) {
                            teamStats[team].draws++;
                            teamStats[team].points += 1;  // 1 point for a draw
                        } else {
                            teamStats[team].losses++;
                            // 0 points for a loss, no need to add
                        }
                        
                        // Record goal scorers
                        if (match.scorers) {
                            match.scorers.forEach(scorer => {
                                if (scorer.team === 'home') {
                                    if (!teamStats[team].scorers[scorer.playerName]) {
                                        teamStats[team].scorers[scorer.playerName] = 0;
                                    }
                                    teamStats[team].scorers[scorer.playerName] += parseInt(scorer.goals);
                                }
                            });
                        }
                    } else {
                        // Team played as away team
                        teamStats[team].goalsFor += awayScore;
                        teamStats[team].goalsAgainst += homeScore;
                        
                        if (awayScore > homeScore) {
                            teamStats[team].wins++;
                            teamStats[team].points += 2;  // 2 points for a win
                        } else if (awayScore === homeScore) {
                            teamStats[team].draws++;
                            teamStats[team].points += 1;  // 1 point for a draw
                        } else {
                            teamStats[team].losses++;
                            // 0 points for a loss, no need to add
                        }
                        
                        // Record goal scorers
                        if (match.scorers) {
                            match.scorers.forEach(scorer => {
                                if (scorer.team === 'away') {
                                    if (!teamStats[team].scorers[scorer.playerName]) {
                                        teamStats[team].scorers[scorer.playerName] = 0;
                                    }
                                    teamStats[team].scorers[scorer.playerName] += parseInt(scorer.goals);
                                }
                            });
                        }
                    }
                }
            });
        });
        
        // Sort teams by points (descending)
        const sortedTeams = Object.values(teamStats).sort((a, b) => b.points - a.points);
        
        // Clear existing content
        teamsGrid.innerHTML = '';
        
        // Generate team cards
        sortedTeams.forEach((team, index) => {
            // Generate a deterministic color based on team name
            const hashCode = team.name.split('').reduce((hash, char) => {
                return char.charCodeAt(0) + ((hash << 5) - hash);
            }, 0);
            
            const colorIndex = Math.abs(hashCode) % 6;
            const colors = [
                'from-blue-500 to-blue-700',   // Blue
                'from-red-500 to-red-700',     // Red
                'from-green-500 to-green-700', // Green
                'from-purple-500 to-purple-700', // Purple
                'from-yellow-500 to-yellow-700', // Yellow
                'from-indigo-500 to-indigo-700'  // Indigo
            ];
            
            const teamInitials = getTeamInitials(team.name);
            const winRate = team.matches > 0 ? Math.round((team.wins / team.matches) * 100) : 0;
            
            const teamCard = document.createElement('div');
            // Add animation delay based on index
            teamCard.className = 'animated-card team-card';
            teamCard.style.animationDelay = `${index * 0.1}s`;
            
            teamCard.innerHTML = `
                <div class="team-header bg-gradient-to-r ${colors[colorIndex]}">
                    <div class="team-logo text-${colors[colorIndex].split('-')[1]}">
                        ${teamInitials}
                    </div>
                </div>
                <div class="team-body">
                    <h3 class="team-name">${team.name}</h3>
                    <p class="team-rank">Rank: ${index + 1}</p>
                    
                    <div class="team-stats">
                        <div>
                            <span class="stat-label">Points: </span>
                            <span class="stat-value">${team.points}</span>
                        </div>
                        <div>
                            <span class="stat-label">Win Rate: </span>
                            <span class="stat-value">${winRate}%</span>
                        </div>
                    </div>
                    
                    <div class="record-badges">
                        <span class="badge badge-win">W${team.wins}</span>
                        <span class="badge badge-draw">D${team.draws}</span>
                        <span class="badge badge-loss">L${team.losses}</span>
                    </div>
                    
                    <a href="/SingleTeam?team=${encodeURIComponent(team.name)}" 
                       class="team-view-btn mt-auto">
                        <i class="fas fa-chart-line mr-2"></i> View Details
                    </a>
                </div>
            `;
            
            teamsGrid.appendChild(teamCard);
        });
    }
    
    // Helper function to get team initials from team name
    function getTeamInitials(teamName) {
        if (!teamName) return '??';
        
        // Split by spaces and get initials
        const words = teamName.split(' ');
        if (words.length === 1) {
            // For single word, return first 3 letters
            return teamName.substring(0, 3).toUpperCase();
        } else {
            // For multiple words, return initials of first 3 words
            return words.slice(0, 3).map(word => word.charAt(0)).join('').toUpperCase();
        }
    }
    
    // Initialize the team cards
    generateTeamStats();
}); 