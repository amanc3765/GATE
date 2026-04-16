document.addEventListener('DOMContentLoaded', () => {
    let cutoffData = [];
    let filteredData = [];
    let currentSort = { column: null, direction: 'asc' };

    const tableBody = document.getElementById('table-body');
    
    // Filter inputs
    const filterInstitute = document.getElementById('filter-institute');
    const filterProgram = document.getElementById('filter-program');
    const filterRound = document.getElementById('filter-round');
    const filterMinScore = document.getElementById('filter-min-score');
    const filterMaxScore = document.getElementById('filter-max-score');
    const filterState = document.getElementById('filter-state');

    // Fetch data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            cutoffData = data;
            filteredData = [...cutoffData];
            populateRoundSelect(cutoffData);
            renderTable(filteredData);
            setupEventListeners();
        })
        .catch(error => console.error('Error loading data:', error));

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.institute}</td>
                <td>${row.state}</td>
                <td>${row.program}</td>
                <td>${row.round}</td>
                <td>${row.score_min}</td>
                <td>${row.score_max}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function populateRoundSelect(data) {
        const rounds = [...new Set(data.map(row => row.round))].sort();
        rounds.forEach(round => {
            const option = document.createElement('option');
            option.value = round.toString();
            option.textContent = `Round ${round}`;
            filterRound.appendChild(option);
        });
    }

    function setupEventListeners() {
        // Add listeners to filter inputs
        const filters = [
            filterInstitute, filterProgram, filterRound, 
            filterMinScore, filterMaxScore, filterState
        ];
        
        filters.forEach(filter => {
            filter.addEventListener('input', applyFilters);
        });

        // Add listeners to table headers for sorting
        const headers = document.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const columnId = header.id.replace('header-', '').replace('-', '_');
                handleSort(columnId, header);
            });
        });
    }

    function applyFilters() {
        const instVal = filterInstitute.value.toLowerCase();
        const progVal = filterProgram.value.toLowerCase();
        const roundVal = filterRound.value;
        const minVal = filterMinScore.value ? parseFloat(filterMinScore.value) : null;
        const maxVal = filterMaxScore.value ? parseFloat(filterMaxScore.value) : null;
        const stateVal = filterState.value.toLowerCase();

        filteredData = cutoffData.filter(row => {
            const matchInst = row.institute.toLowerCase().includes(instVal);
            const matchProg = row.program.toLowerCase().includes(progVal);
            const matchRound = roundVal ? row.round.toString() === roundVal : true;
            const matchMin = minVal !== null ? row.score_min >= minVal : true;
            const matchMax = maxVal !== null ? row.score_min <= maxVal : true;
            const matchState = row.state.toLowerCase().includes(stateVal);

            return matchInst && matchProg && matchRound && matchMin && matchMax && matchState;
        });

        // Re-apply current sort if any
        if (currentSort.column) {
            sortData(currentSort.column, currentSort.direction);
        }

        renderTable(filteredData);
    }

    function handleSort(column, headerElement) {
        let direction = 'asc';
        if (currentSort.column === column && currentSort.direction === 'asc') {
            direction = 'desc';
        }

        currentSort = { column, direction };

        // Update UI icons
        document.querySelectorAll('th.sortable .sort-icon').forEach(icon => {
            icon.textContent = '↕';
            icon.style.opacity = '0.5';
        });
        
        const icon = headerElement.querySelector('.sort-icon');
        icon.textContent = direction === 'asc' ? '↑' : '↓';
        icon.style.opacity = '1';

        sortData(column, direction);
        renderTable(filteredData);
    }

    function sortData(column, direction) {
        filteredData.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Handle numeric comparison
            if (column === 'score_min' || column === 'score_max' || column === 'round') {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            } else {
                valA = valA.toString().toLowerCase();
                valB = valB.toString().toLowerCase();
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
});
