// script.js - Main JavaScript file

// Toggle mobile menu in responsive mode
document.addEventListener('DOMContentLoaded', function() {
    // Handle mobile menu toggle
    const menuToggle = document.querySelector('#mobile-menu-toggle');
    const menu = document.querySelector('#menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('hidden');
        });
    }
    
    // Initialize data page functionality if we're on that page
    initDataPageIfPresent();
});

// Data Page Specific Functions
function initDataPageIfPresent() {
    const dataTabsContainer = document.getElementById('dataTabs');
    
    if (dataTabsContainer) {
        initDataTabs();
        initFileUpload();
        setupDataTableFilters();
        mockChartData();
        initCopyToClipboard();
    }
}

// Initialize tabs on the data page
function initDataTabs() {
    const tabButtons = document.querySelectorAll('#dataTabs button');
    const tabPanels = document.querySelectorAll('#dataTabContent > div');
    
    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Hide all tab panels
            tabPanels.forEach((panel) => {
                panel.classList.add('hidden');
            });
            
            // Remove active state from all buttons
            tabButtons.forEach((btn) => {
                btn.classList.remove('active', 'border-blue-600');
                btn.classList.add('border-transparent');
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Show the selected tab panel
            const targetId = button.getAttribute('data-tabs-target').substring(1);
            const targetPanel = document.getElementById(targetId);
            targetPanel.classList.remove('hidden');
            
            // Set active state on clicked button
            button.classList.add('active', 'border-blue-600');
            button.classList.remove('border-transparent');
            button.setAttribute('aria-selected', 'true');
        });
    });
}

// Handle file upload functionality
function initFileUpload() {
    const dropzone = document.getElementById('dropzone-file');
    const fileList = document.querySelector('.file-list');
    
    if (dropzone && fileList) {
        // File selection handler
        dropzone.addEventListener('change', () => {
            if (dropzone.files.length > 0) {
                fileList.classList.remove('hidden');
                
                // Create file entry in the list
                const fileEntry = document.createElement('div');
                fileEntry.className = 'bg-white p-3 rounded border flex justify-between items-center';
                
                const fileIcon = getFileIcon(dropzone.files[0].name);
                
                fileEntry.innerHTML = `
                    <div class="flex items-center">
                        <i class="${fileIcon} mr-2"></i>
                        <span class="text-sm font-medium">${dropzone.files[0].name}</span>
                    </div>
                    <button type="button" class="text-red-500 hover:text-red-700 remove-file">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Replace any existing file entry
                fileList.innerHTML = '';
                fileList.appendChild(fileEntry);
                
                // Add remove button functionality
                document.querySelector('.remove-file').addEventListener('click', () => {
                    fileList.classList.add('hidden');
                    dropzone.value = '';
                });
            }
        });
        
        // Drag and drop support
        const dropArea = dropzone.parentElement;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        dropArea.addEventListener('drop', handleDrop, false);
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight() {
            dropArea.classList.add('bg-blue-50');
        }
        
        function unhighlight() {
            dropArea.classList.remove('bg-blue-50');
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            dropzone.files = files;
            
            // Trigger change event
            const event = new Event('change');
            dropzone.dispatchEvent(event);
        }
    }
}

// Get appropriate icon based on file extension
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    switch(extension) {
        case 'csv':
            return 'fas fa-file-csv text-green-500';
        case 'xlsx':
        case 'xls':
            return 'fas fa-file-excel text-green-600';
        case 'json':
            return 'fas fa-file-code text-yellow-500';
        default:
            return 'fas fa-file text-gray-500';
    }
}

// Setup data table filters and sorting
function setupDataTableFilters() {
    // Table search functionality
    const searchInputs = document.querySelectorAll('.table-search');
    
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const tableId = this.getAttribute('data-table');
            const table = document.getElementById(tableId);
            
            if (table) {
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    });
}

// Initialize mock chart data for visualization examples
function mockChartData() {
    // This would be replaced with actual chart initialization
    // For now, we're just showing placeholder images
    const chartPlaceholders = document.querySelectorAll('.chart-placeholder');
    
    chartPlaceholders.forEach(placeholder => {
        placeholder.addEventListener('click', () => {
            alert('In a real implementation, this would be an interactive chart using Ant Design Charts or another library.');
        });
    });
}

// Copy to clipboard functionality
function initCopyToClipboard() {
    const copyButton = document.querySelector('#share-link + button');
    
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const linkInput = document.getElementById('share-link');
            linkInput.select();
            document.execCommand('copy');
            
            // Show feedback
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
                copyButton.innerHTML = originalHTML;
            }, 2000);
        });
    }
}
