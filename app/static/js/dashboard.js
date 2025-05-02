document.addEventListener('DOMContentLoaded', function() {
    // Load match data from localStorage
    const matchData = JSON.parse(localStorage.getItem('matchData')) || [];
    
    // Get filter elements
    const timePeriodFilter = document.getElementById('timePeriodFilter');
    const tournamentFilter = document.getElementById('tournamentFilter');
    const teamFilter = document.getElementById('teamFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    
    // Populate filter dropdowns
    populateFilters(matchData);
    
    // Filter handlers
    applyFiltersBtn.addEventListener('click', function() {
        applyFilters();
    });
    
    resetFiltersBtn.addEventListener('click', function() {
        resetFilters();
    });
    
    if (matchData.length === 0) {
        // Display no data message
        document.querySelectorAll('.chart-container').forEach(container => {
            container.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-gray-500">No match data available. Please add data in the Data section.</p></div>';
        });
        return;
    }

    // Update overview stats
    updateOverviewStats(matchData);
    
    // Initialize all charts with the data
    initializeCharts(matchData);
    
    // Function to populate filter dropdowns
    function populateFilters(data) {
        // Populate tournaments
        const tournaments = new Set();
        const teams = new Set();
        
        data.forEach(match => {
            if (match.tournament) tournaments.add(match.tournament);
            if (match.homeTeam) teams.add(match.homeTeam);
            if (match.awayTeam) teams.add(match.awayTeam);
        });
        
        // Add tournament options
        tournaments.forEach(tournament => {
            const option = document.createElement('option');
            option.value = tournament;
            option.textContent = tournament;
            tournamentFilter.appendChild(option);
        });
        
        // Add team options
        teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            teamFilter.appendChild(option);
        });
    }
    
    // Function to apply filters
    function applyFilters() {
        const timePeriod = timePeriodFilter.value;
        const tournament = tournamentFilter.value;
        const team = teamFilter.value;
        
        let filteredData = [...matchData];
        
        // Apply time period filter
        if (timePeriod !== 'all') {
            const now = new Date();
            let startDate;
            
            switch(timePeriod) {
                case 'lastMonth':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
                case 'last3Months':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                    break;
                case 'last6Months':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                    break;
                case 'lastYear':
                    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    break;
            }
            
            filteredData = filteredData.filter(match => new Date(match.matchDate) >= startDate);
        }
        
        // Apply tournament filter
        if (tournament !== 'all') {
            filteredData = filteredData.filter(match => match.tournament === tournament);
        }
        
        // Apply team filter
        if (team !== 'all') {
            filteredData = filteredData.filter(match => 
                match.homeTeam === team || match.awayTeam === team
            );
        }
        
        // Update data visualizations with filtered data
        updateOverviewStats(filteredData);
        initializeCharts(filteredData);
    }
    
    // Function to reset filters
    function resetFilters() {
        timePeriodFilter.value = 'all';
        tournamentFilter.value = 'all';
        teamFilter.value = 'all';
        
        // Update with all data
        updateOverviewStats(matchData);
        initializeCharts(matchData);
    }
    
    // Update overview statistics
    function updateOverviewStats(data) {
        // Calculate overview stats
        const totalMatches = data.length;
        
        let totalGoals = 0;
        const uniqueTeams = new Set();
        
        data.forEach(match => {
            totalGoals += parseInt(match.homeScore || 0) + parseInt(match.awayScore || 0);
            if (match.homeTeam) uniqueTeams.add(match.homeTeam);
            if (match.awayTeam) uniqueTeams.add(match.awayTeam);
        });
        
        const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : 0;
        
        // Update DOM elements
        document.getElementById('totalMatchesCount').textContent = totalMatches;
        document.getElementById('totalGoalsCount').textContent = totalGoals;
        document.getElementById('avgGoalsPerMatch').textContent = avgGoals;
        document.getElementById('teamsCount').textContent = uniqueTeams.size;
    }
});

// Share Functionality
function setupShareButtons() {
    // Find all chart cards
    const chartCards = document.querySelectorAll('.ant-card');
    
    // Add share button to each card header
    chartCards.forEach((card, index) => {
        const cardHeader = card.querySelector('.ant-card-head');
        
        // Create a container for actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'card-header-actions';
        
        // Create the share button with Ant Design styling
        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-btn';
        shareBtn.setAttribute('data-chart-id', index);
        shareBtn.title = 'Share this chart';
        
        // Use Ant Design icon
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
        
        // Add click event to open modal
        shareBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openShareModal(this.getAttribute('data-chart-id'));
        });
        
        // Add button to actions container
        actionsContainer.appendChild(shareBtn);
        
        // Update card header structure
        const cardTitle = card.querySelector('.ant-card-head-title');
        const newHeader = document.createElement('div');
        newHeader.style.display = 'flex';
        newHeader.style.justifyContent = 'space-between';
        newHeader.style.width = '100%';
        newHeader.style.alignItems = 'center';
        
        // Move title to new container
        if (cardTitle) {
            cardHeader.innerHTML = '';
            newHeader.appendChild(cardTitle);
            newHeader.appendChild(actionsContainer);
            cardHeader.appendChild(newHeader);
        }
    });
    
    // Modal elements
    const shareModal = document.getElementById('shareModal');
    const closeShareBtn = document.getElementById('closeShareModal');
    const submitShareBtn = document.getElementById('submitShare');
    
    // Close modal when clicking the X button
    closeShareBtn.addEventListener('click', function() {
        closeShareModal();
    });
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(e) {
        if (e.target === shareModal) {
            closeShareModal();
        }
    });
    
    // Handle share submission
    submitShareBtn.addEventListener('click', function() {
        const recipient = document.getElementById('shareRecipient').value;
        const message = document.getElementById('shareMessage').value;
        const chartId = shareModal.getAttribute('data-chart-id');
        
        if (!recipient) {
            toast.error('Please enter a username or email to share with');
            return;
        }
        
        // Get chart data to share
        const chartData = getChartData(chartId);
        
        // Here you would typically send this data to your backend
        // For now, we'll just simulate success with localStorage
        const shares = JSON.parse(localStorage.getItem('chartShares') || '[]');
        shares.push({
            recipient: recipient,
            message: message,
            chartId: chartId,
            chartData: chartData,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('chartShares', JSON.stringify(shares));
        
        // Show success toast and close modal
        toast.success(`Chart shared successfully with ${recipient}`);
        closeShareModal();
    });
}

function openShareModal(chartId) {
    const modal = document.getElementById('shareModal');
    modal.setAttribute('data-chart-id', chartId);
    
    // Reset form
    document.getElementById('shareRecipient').value = '';
    document.getElementById('shareMessage').value = '';
    
    // Show modal
    modal.style.display = 'flex';
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    modal.style.display = 'none';
}

function getChartData(chartId) {
    // Get all canvas elements
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length <= chartId) {
        return null;
    }
    
    const canvas = canvases[chartId];
    const chart = canvas.chart;
    
    if (!chart) {
        return null;
    }
    
    // Return a simplified version of the chart data
    return {
        type: chart.config.type,
        title: chart.canvas.closest('.ant-card').querySelector('.ant-card-head-title').innerText,
        data: chart.data,
        timestamp: new Date().toISOString()
    };
}

// Dashboard Share Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Dashboard share elements
    const shareDashboardBtn = document.getElementById('shareDashboardBtn');
    const shareDashboardModal = document.getElementById('shareDashboardModal');
    const closeDashboardShareModal = document.getElementById('closeDashboardShareModal');
    const submitDashboardShare = document.getElementById('submitDashboardShare');
    
    // Open dashboard share modal
    if (shareDashboardBtn) {
        shareDashboardBtn.addEventListener('click', function() {
            shareDashboardModal.style.display = 'flex';
        });
    }
    
    // Close modal when clicking the X button
    if (closeDashboardShareModal) {
        closeDashboardShareModal.addEventListener('click', function() {
            shareDashboardModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside the content
    window.addEventListener('click', function(e) {
        if (e.target === shareDashboardModal) {
            shareDashboardModal.style.display = 'none';
        }
    });
    
    // Handle dashboard share submission
    if (submitDashboardShare) {
        submitDashboardShare.addEventListener('click', function() {
            const dashboardName = document.getElementById('dashboardName').value;
            const shareWithUsersInput = document.getElementById('shareWithUsers').value;
            const permissionLevel = document.getElementById('permissionLevel').value;
            const dashboardNote = document.getElementById('dashboardNote').value;
            
            // Validate
            if (!shareWithUsersInput) {
                toast.error('Please enter at least one email to share with');
                return;
            }
            
            // Parse emails (comma or space separated)
            const sharedWith = shareWithUsersInput.split(/[\s,]+/).filter(email => email.trim() !== '');
            
            // Prepare form data for submission
            const formData = new FormData();
            formData.append('dashboardName', dashboardName);
            formData.append('sharedWith', JSON.stringify(sharedWith));
            formData.append('permissionLevel', permissionLevel);
            formData.append('note', dashboardNote);
            
            // Send AJAX request
            fetch('/share-dashboard', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message || 'Dashboard shared successfully');
                    shareDashboardModal.style.display = 'none';
    } else {
                    toast.error(data.message || 'Error sharing dashboard');
                }
            })
            .catch(error => {
                toast.error('Error sharing dashboard: ' + error.message);
            });
        });
    }
}); 