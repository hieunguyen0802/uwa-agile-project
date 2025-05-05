document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const addDataBtn = document.getElementById('addDataBtn');
    const fileUpload = document.getElementById('fileUpload');
    const addMatchModal = document.getElementById('addMatchModal');
    const viewMatchModal = document.getElementById('viewMatchModal');
    const addMatchForm = document.getElementById('addMatchForm');
    const addScorerBtn = document.getElementById('addScorerBtn');
    const scorersList = document.getElementById('scorersList');
    const matchDataTable = document.getElementById('matchDataTable');
    const emptyState = document.getElementById('emptyState');
    
    // Close buttons
    const closeButtons = document.querySelectorAll('.close, .close-modal');
    
    // Load match data from localStorage
    let matchData = JSON.parse(localStorage.getItem('matchData')) || [];
    
    // Display data in the table
    displayMatchData();
    
    // Event listeners
    addDataBtn.addEventListener('click', openAddMatchModal);
    fileUpload.addEventListener('change', handleFileUpload);
    addMatchForm.addEventListener('submit', saveMatchData);
    addScorerBtn.addEventListener('click', addScorerField);
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            addMatchModal.style.display = 'none';
            viewMatchModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(e) {
        if (e.target === addMatchModal) {
            addMatchModal.style.display = 'none';
        }
        if (e.target === viewMatchModal) {
            viewMatchModal.style.display = 'none';
        }
    });
    
    // Function to display match data in the table
    function displayMatchData() {
        if (matchData.length === 0) {
            matchDataTable.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Sort matches by date (newest first)
        const sortedData = [...matchData].sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
        
        matchDataTable.innerHTML = '';
        
        sortedData.forEach((match, index) => {
            const row = document.createElement('tr');
            row.className = 'match-row';
            
            // Format the date
            const matchDate = new Date(match.matchDate);
            const formattedDate = matchDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Create score display with tag styling and color based on value
            const homeScoreClass = parseInt(match.homeScore) >= 5 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
            const awayScoreClass = parseInt(match.awayScore) >= 5 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
            const scoreDisplay = `
                <span class="${homeScoreClass} px-2 py-1 rounded font-bold">${match.homeScore}</span>
                <span class="mx-1">-</span>
                <span class="${awayScoreClass} px-2 py-1 rounded font-bold">${match.awayScore}</span>
            `;
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${match.tournament}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${match.homeTeam}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    ${scoreDisplay}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${match.awayTeam}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <button class="view-btn action-btn" data-index="${index}">
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                </td>
            `;
            
            matchDataTable.appendChild(row);
        });
        
        // Add event listeners to the view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                viewMatchDetails(sortedData[index]);
            });
        });
    }
    
    // Function to open the add match modal
    function openAddMatchModal() {
        // Reset the form
        addMatchForm.reset();
        
        // Clear scorers list except for the first one
        const scorerEntries = scorersList.querySelectorAll('.scorer-entry');
        for (let i = 1; i < scorerEntries.length; i++) {
            scorerEntries[i].remove();
        }
        
        // Reset first scorer fields
        const firstScorer = scorersList.querySelector('.scorer-entry');
        if (firstScorer) {
            firstScorer.querySelector('.team-select').value = 'home';
            firstScorer.querySelector('.player-name').value = '';
            firstScorer.querySelector('.goals').value = '';
        }
        
        // Set default match date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('matchDate').value = today;
        
        // Show the modal
        addMatchModal.style.display = 'block';
    }
    
    // Function to add a new scorer field
    function addScorerField() {
        const scorerEntry = document.createElement('div');
        scorerEntry.className = 'scorer-entry grid grid-cols-1 md:grid-cols-3 gap-4 mb-3';
        
        scorerEntry.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <select class="team-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="home">Home Team</option>
                    <option value="away">Away Team</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Player Name</label>
                <input type="text" class="player-name w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="relative">
                <label class="block text-sm font-medium text-gray-700 mb-1">Goals</label>
                <div class="flex">
                    <input type="number" min="1" class="goals w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <button type="button" class="remove-scorer ml-2 text-red-500 hover:text-red-700 mt-2">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>
            </div>
        `;
        
        scorersList.appendChild(scorerEntry);
        
        // Add event listener for remove button
        scorerEntry.querySelector('.remove-scorer').addEventListener('click', function() {
            scorerEntry.remove();
        });
    }
    
    // Function to save match data
    function saveMatchData(e) {
        e.preventDefault();
        
        // Get form values
        const matchDate = document.getElementById('matchDate').value;
        const tournament = document.getElementById('tournament').value;
        const homeTeam = document.getElementById('homeTeam').value;
        const awayTeam = document.getElementById('awayTeam').value;
        const homeScore = document.getElementById('homeScore').value;
        const awayScore = document.getElementById('awayScore').value;
        
        // Validate form
        if (!matchDate || !tournament || !homeTeam || !awayTeam || homeScore === '' || awayScore === '') {
            toast.error('Please fill in all required fields');
            return;
        }
        
        // Get scorers
        const scorers = [];
        const scorerEntries = scorersList.querySelectorAll('.scorer-entry');
        
        scorerEntries.forEach(entry => {
            const team = entry.querySelector('.team-select').value;
            const playerName = entry.querySelector('.player-name').value.trim();
            const goals = entry.querySelector('.goals').value;
            
            // Only add if player name and goals are provided
            if (playerName && goals) {
                scorers.push({
                    team,
                    playerName,
                    goals
                });
            }
        });
        
        // Create match object
        const match = {
            id: Date.now().toString(), // Use timestamp as ID
            matchDate,
            tournament,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
            scorers
        };
        
        // Add to match data
        matchData.push(match);
        
        // Save to localStorage
        localStorage.setItem('matchData', JSON.stringify(matchData));
        
        // Update table
        displayMatchData();
        
        // Close modal
        addMatchModal.style.display = 'none';
        
        // Show success toast
        toast.success('Match added successfully');
    }
    
    // Function to view match details
    function viewMatchDetails(match) {
        // Populate the modal with match details
        document.getElementById('modalTournament').textContent = match.tournament;
        
        // Format date
        const matchDate = new Date(match.matchDate);
        const formattedDate = matchDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('modalDate').textContent = formattedDate;
        
        document.getElementById('modalHomeTeam').textContent = match.homeTeam;
        
        // Create score display with tag styling and color based on value
        const homeScoreClass = parseInt(match.homeScore) >= 5 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
        const awayScoreClass = parseInt(match.awayScore) >= 5 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
        const scoreDisplay = `
            <span class="${homeScoreClass} px-2 py-1 rounded font-bold">${match.homeScore}</span>
            <span class="mx-1">-</span>
            <span class="${awayScoreClass} px-2 py-1 rounded font-bold">${match.awayScore}</span>
        `;
        document.getElementById('modalScore').innerHTML = scoreDisplay;
        
        document.getElementById('modalAwayTeam').textContent = match.awayTeam;
        
        // Display scorers
        const modalScorers = document.getElementById('modalScorers');
        
        if (!match.scorers || match.scorers.length === 0) {
            modalScorers.innerHTML = '<p class="text-gray-500">No scorer information available</p>';
        } else {
            // Group scorers by team
            const homeScorers = match.scorers.filter(scorer => scorer.team === 'home');
            const awayScorers = match.scorers.filter(scorer => scorer.team === 'away');
            
            let scorersHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
            
            // Home team scorers
            scorersHTML += `
                <div>
                    <h4 class="font-medium text-blue-800 mb-2">${match.homeTeam}</h4>
                    <ul class="list-disc list-inside">
            `;
            
            if (homeScorers.length === 0) {
                scorersHTML += '<li class="text-gray-500">No goals</li>';
            } else {
                homeScorers.forEach(scorer => {
                    scorersHTML += `<li>${scorer.playerName} (${scorer.goals})</li>`;
                });
            }
            
            scorersHTML += `
                    </ul>
                </div>
            `;
            
            // Away team scorers
            scorersHTML += `
                <div>
                    <h4 class="font-medium text-blue-800 mb-2">${match.awayTeam}</h4>
                    <ul class="list-disc list-inside">
            `;
            
            if (awayScorers.length === 0) {
                scorersHTML += '<li class="text-gray-500">No goals</li>';
            } else {
                awayScorers.forEach(scorer => {
                    scorersHTML += `<li>${scorer.playerName} (${scorer.goals})</li>`;
                });
            }
            
            scorersHTML += `
                    </ul>
                </div>
            `;
            
            scorersHTML += '</div>';
            modalScorers.innerHTML = scorersHTML;
        }
        
        // Show modal
        viewMatchModal.style.display = 'block';
    }
    
    // Function to handle file upload
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                // Determine file type by extension
                const fileName = file.name.toLowerCase();
                let importedData = [];
                
                if (fileName.endsWith('.json')) {
                    // Parse JSON data
                    importedData = JSON.parse(event.target.result);
                } else if (fileName.endsWith('.csv')) {
                    // Parse CSV data
                    const csvData = event.target.result;
                    const lines = csvData.split('\n');
                    const headers = lines[0].split(',').map(header => header.trim());
                    
                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;
                        
                        const values = lines[i].split(',').map(value => value.trim());
                        const entry = {};
                        
                        headers.forEach((header, index) => {
                            entry[header] = values[index];
                        });
                        
                        // Generate ID if not present
                        if (!entry.id) {
                            entry.id = Date.now().toString() + i;
                        }
                        
                        importedData.push(entry);
                    }
                } else {
                    throw new Error('Unsupported file format. Please upload a JSON or CSV file.');
                }
                
                // Validate imported data
                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid data format. Expected an array of matches.');
                }
                
                // Merge with existing data
                const mergedData = [...matchData];
                let addedCount = 0;
                
                importedData.forEach(match => {
                    // Check if match has required fields
                    if (!match.matchDate || !match.homeTeam || !match.awayTeam || 
                        !match.homeScore || !match.awayScore || !match.tournament) {
                        console.warn('Skipping incomplete match entry:', match);
                        return;
                    }
                    
                    // Generate ID if not present
                    if (!match.id) {
                        match.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    }
                    
                    // Check if match already exists
                    const exists = mergedData.some(m => m.id === match.id);
                    if (!exists) {
                        mergedData.push(match);
                        addedCount++;
                    }
                });
                
                // Update match data
                matchData = mergedData;
                
                // Save to localStorage
                localStorage.setItem('matchData', JSON.stringify(matchData));
                
                // Update table
                displayMatchData();
                
                // Show success message with toast
                toast.success(`Successfully imported ${addedCount} matches.`);
                
            } catch (error) {
                console.error('Error processing file:', error);
                toast.error('Error processing file: ' + error.message);
            }
            
            // Reset file input
            fileUpload.value = '';
        };
        
        reader.onerror = function() {
            console.error('Error reading file.');
            toast.error('Error reading file.');
            fileUpload.value = '';
        };
        
        // Read the file
        if (fileName.endsWith('.json') || fileName.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            toast.warning('Unsupported file format. Please upload a JSON or CSV file.');
            fileUpload.value = '';
        }
    }
}); 