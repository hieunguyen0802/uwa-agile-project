import { api } from "/static/js/apiClient.js";
document.addEventListener('DOMContentLoaded', async function() {
    // Get team name from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const teamName = urlParams.get('team');
    
    // Get match data from localStorage
    //const matchData = JSON.parse(localStorage.getItem('matchData')) || [];
    // getting data from db instead of localstorage
    let matchData = await api.get("/matches");    
    // Get DOM elements
    const teamDetails = document.getElementById('teamDetails');
    const emptyTeamState = document.getElementById('emptyTeamState');
    const emptyStateMessage = document.getElementById('emptyStateMessage');
    
    // Generate team stats and display details
    function displayTeamDetails() {
        if (!teamName || matchData.length === 0) {
            // Show empty state
            teamDetails.classList.add('hidden');
            emptyTeamState.classList.remove('hidden');
            emptyStateMessage.textContent = !teamName ? 'Team Not Found' : 'No Match Data Available';
            return;
        }
        
        // Filter matches for this team
        const teamMatches = matchData.filter(match => match.homeTeam === teamName || match.awayTeam === teamName);
        
        if (teamMatches.length === 0) {
            // Team exists but has no matches
            teamDetails.classList.add('hidden');
            emptyTeamState.classList.remove('hidden');
            emptyStateMessage.textContent = 'No Match Data for This Team';
            return;
        }
        
        // Show team details
        teamDetails.classList.remove('hidden');
        emptyTeamState.classList.add('hidden');
        
        // Calculate team stats
        const stats = calculateTeamStats(teamName, teamMatches);
        
        // Update UI with team stats
        updateTeamUI(stats);
        
        // Display recent matches
        displayRecentMatches(teamName, teamMatches);
        
        // Display top scorers
        displayTopScorers(stats.scorers);
    }
    
    // Calculate team statistics from match data
    function calculateTeamStats(team, matches) {
        const stats = {
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
        
        matches.forEach(match => {
            stats.matches++;
            
            const homeScore = parseInt(match.homeScore);
            const awayScore = parseInt(match.awayScore);
            
            if (match.homeTeam === team) {
                // Team played as home team
                stats.goalsFor += homeScore;
                stats.goalsAgainst += awayScore;
                
                if (homeScore > awayScore) {
                    stats.wins++;
                    stats.points += 2;  // 2 points for a win
                } else if (homeScore === awayScore) {
                    stats.draws++;
                    stats.points += 1;  // 1 point for a draw
                } else {
                    stats.losses++;
                    // 0 points for a loss, no need to add
                }
                
                // Record goal scorers
                if (match.scorers) {
                    match.scorers.forEach(scorer => {
                        if (scorer.team === 'home') {
                            if (!stats.scorers[scorer.playerName]) {
                                stats.scorers[scorer.playerName] = 0;
                            }
                            stats.scorers[scorer.playerName] += parseInt(scorer.goals);
                        }
                    });
                }
            } else {
                // Team played as away team
                stats.goalsFor += awayScore;
                stats.goalsAgainst += homeScore;
                
                if (awayScore > homeScore) {
                    stats.wins++;
                    stats.points += 2;  // 2 points for a win
                } else if (awayScore === homeScore) {
                    stats.draws++;
                    stats.points += 1;  // 1 point for a draw
                } else {
                    stats.losses++;
                    // 0 points for a loss, no need to add
                }
                
                // Record goal scorers
                if (match.scorers) {
                    match.scorers.forEach(scorer => {
                        if (scorer.team === 'away') {
                            if (!stats.scorers[scorer.playerName]) {
                                stats.scorers[scorer.playerName] = 0;
                            }
                            stats.scorers[scorer.playerName] += parseInt(scorer.goals);
                        }
                    });
                }
            }
        });
        
        return stats;
    }
    
    // Update the UI with team statistics
    function updateTeamUI(stats) {
        // Update team name and logo
        document.getElementById('teamName').textContent = stats.name;
        
        // Set team logo with initials
        const teamInitials = getTeamInitials(stats.name);
        document.getElementById('teamLogo').textContent = teamInitials;
        
        // Set team logo background color based on team name
        const hashCode = stats.name.split('').reduce((hash, char) => {
            return char.charCodeAt(0) + ((hash << 5) - hash);
        }, 0);
        
        const colorIndex = Math.abs(hashCode) % 6;
        const colors = [
            'bg-blue-100 text-blue-700',
            'bg-red-100 text-red-700',
            'bg-green-100 text-green-700',
            'bg-purple-100 text-purple-700',
            'bg-yellow-100 text-yellow-700',
            'bg-indigo-100 text-indigo-700'
        ];
        
        document.getElementById('teamLogo').className = `h-32 w-32 rounded-full flex items-center justify-center mb-4 text-5xl font-bold ${colors[colorIndex]}`;
        
        // Update record text
        document.getElementById('teamRecord').textContent = `W${stats.wins} D${stats.draws} L${stats.losses}`;
        
        // Update counts
        document.getElementById('matchesCount').textContent = stats.matches;
        document.getElementById('winsCount').textContent = stats.wins;
        document.getElementById('goalsCount').textContent = stats.goalsFor;
        
        // Update total points
        document.getElementById('totalPoints').textContent = stats.points;
        
        // Calculate win rate and update progress bar
        const winRate = stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
        document.getElementById('winRateBar').style.width = `${winRate}%`;
        document.getElementById('winRateText').textContent = `${winRate}%`;
        
        // Update other stats
        const goalsPerMatch = stats.matches > 0 ? (stats.goalsFor / stats.matches).toFixed(1) : '0.0';
        document.getElementById('goalsPerMatch').textContent = goalsPerMatch;
        
        const goalDifference = stats.goalsFor - stats.goalsAgainst;
        const goalDiffElement = document.getElementById('goalDifference');
        goalDiffElement.textContent = goalDifference > 0 ? `+${goalDifference}` : goalDifference;
        if (goalDifference > 0) {
            goalDiffElement.className = 'font-bold text-green-600';
        } else if (goalDifference < 0) {
            goalDiffElement.className = 'font-bold text-red-600';
        }
    }
    
    // Display recent matches in the table
    function displayRecentMatches(teamName, matches) {
        const recentResults = document.getElementById('recentResults');
        const noResultsMessage = document.getElementById('noResultsMessage');
        
        if (matches.length === 0) {
            recentResults.innerHTML = '';
            noResultsMessage.classList.remove('hidden');
            return;
        }
        
        noResultsMessage.classList.add('hidden');
        
        // Sort matches by date (most recent first)
        const sortedMatches = [...matches].sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
        
        // Take only the 5 most recent matches
        const recentMatches = sortedMatches.slice(0, 5);
        
        // Clear existing content
        recentResults.innerHTML = '';
        
        // Add match rows
        recentMatches.forEach(match => {
            const row = document.createElement('tr');
            
            // Format date
            const matchDate = new Date(match.matchDate);
            const formattedDate = matchDate.toLocaleDateString();
            
            // Determine match outcome for this team
            let resultClass = 'text-gray-500'; // Draw
            let resultText = 'D';
            
            const homeScore = parseInt(match.homeScore);
            const awayScore = parseInt(match.awayScore);
            
            if (match.homeTeam === teamName) {
                if (homeScore > awayScore) {
                    resultClass = 'text-green-600';
                    resultText = 'W';
                } else if (homeScore < awayScore) {
                    resultClass = 'text-red-600';
                    resultText = 'L';
                }
            } else {
                if (awayScore > homeScore) {
                    resultClass = 'text-green-600';
                    resultText = 'W';
                } else if (awayScore < homeScore) {
                    resultClass = 'text-red-600';
                    resultText = 'L';
                }
            }
            
            // Create match text
            const matchText = `${match.homeTeam} vs ${match.awayTeam}`;
            const scoreText = `${resultText} ${match.homeScore}-${match.awayScore}`;
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${match.tournament}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${matchText}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${resultClass} font-medium">${scoreText}</td>
            `;
            
            recentResults.appendChild(row);
        });
    }
    
    // Display top scorers
    function displayTopScorers(scorers) {
        const topScorers = document.getElementById('topScorers');
        const noScorersMessage = document.getElementById('noScorersMessage');
        
        // Sort scorers by goals (descending)
        const sortedScorers = Object.entries(scorers).sort((a, b) => b[1] - a[1]);
        
        if (sortedScorers.length === 0) {
            topScorers.innerHTML = '';
            noScorersMessage.classList.remove('hidden');
            return;
        }
        
        noScorersMessage.classList.add('hidden');
        topScorers.innerHTML = '';
        
        // Take top 5 scorers
        const top5Scorers = sortedScorers.slice(0, 5);
        
        // Create list items for each scorer
        top5Scorers.forEach((scorer, index) => {
            const [playerName, goals] = scorer;
            const lastItem = index === top5Scorers.length - 1 ? '' : 'border-b';
            
            const listItem = document.createElement('li');
            listItem.className = `flex justify-between items-center py-2 ${lastItem}`;
            listItem.innerHTML = `
                <span>${playerName}</span>
                <span class="font-bold">${goals} ${goals === 1 ? 'goal' : 'goals'}</span>
            `;
            
            topScorers.appendChild(listItem);
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
    
    // Initialize the team details page
    displayTeamDetails();
}); 