/* ====================================
    Module 1: Core Utilities
    Description: Contains fundamental functions used throughout the application, like data fetching from JSON files and the main application initializer.
    ==================================== */

const fetchData = async (url, errorMessage) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} for ${errorMessage}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
};

const initializeApp = async () => {
    // --- Start of change ---
    const urlParams = new URLSearchParams(window.location.search);
    const airportCode = urlParams.get('airport');

    if (!airportCode) {
        // Redirect to the default airport URL
        window.location.href = 'rt-call.html?airport=vghs';
        return; // Stop the function from running further
    }

    const dataPath = `../data/rt-call/${airportCode}-rt-call/`;
    const pageTitle = `${airportCode.toUpperCase()} RT Call Log`;

    document.title = pageTitle;
    document.querySelector('.main-content h1').textContent = pageTitle;
    // --- End of change ---

    const [aircraftList, tooltips] = await Promise.all([
        fetchData(`${dataPath}aircraftList.json`, 'aircraftList.json'),
        fetchData('../data/rt-call/variable-tooltip.json', 'variable-tooltip.json')
    ]);

    if (!aircraftList || !tooltips) {
        return;
    }

    setupEventListeners(aircraftList, tooltips, dataPath);

    if (aircraftList.length > 0) {
        const firstAircraft = aircraftList[0];
        const firstNavLink = document.querySelector('.nav-link');
        if (firstNavLink) {
            firstNavLink.classList.add('active');
        }
        createPhaseLinks(firstAircraft, tooltips, dataPath);
    }
};

/* ====================================
    Module 2: DOM Rendering & UI Updates
    Description: Handles all dynamic rendering of HTML elements, including tables, titles, and individual call rows.
    ==================================== */
const updateMainTitle = (fullName, phaseLabel) => {
    const mainTitle = document.querySelector('.main-content h1');
    if (mainTitle) {
        mainTitle.textContent = `${fullName} - ${phaseLabel} RT Call`;
    }
};

const createPhaseLinks = (aircraft, tooltips, dataPath) => {
    const phaseListContainer = document.getElementById('phase-list-container');
    phaseListContainer.innerHTML = '';

    aircraft.phases.forEach(phase => {
        const phaseLink = document.createElement('a');
        phaseLink.href = '#';
        phaseLink.textContent = phase.label;
        phaseLink.classList.add('phase-link');
        phaseLink.dataset.file = phase.file;

        phaseLink.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelectorAll('.phase-link').forEach(link => link.classList.remove('active-phase'));
            phaseLink.classList.add('active-phase');
            renderCallLog(phase.file, tooltips, aircraft, phase.label, dataPath);
        });

        phaseListContainer.appendChild(phaseLink);
    });

    const firstLink = document.querySelector('.phase-link');
    if (firstLink) {
        firstLink.classList.add('active-phase');
        renderCallLog(firstLink.dataset.file, tooltips, aircraft, firstLink.textContent, dataPath);
    }
};

const renderCallLog = async (fileName, tooltips, aircraft, phaseLabel, dataPath) => {
    const contentContainer = document.querySelector('.communication-table-container');
    const callsData = await fetchData(`${dataPath}${fileName}`, fileName);

    if (callsData) {
        updateMainTitle(aircraft.fullName, phaseLabel);
        contentContainer.innerHTML = '';
        createAircraftDetailsTable(aircraft.details, contentContainer);
        
        const divider = document.createElement('hr');
        divider.classList.add('section-divider');
        contentContainer.appendChild(divider);

    } else {
        contentContainer.innerHTML = '<p class="error-message">Could not load call log data.</p>';
        return;
    }

    const totalPhases = callsData.length;
    callsData.forEach((phaseData, index) => {
        const phaseWrapper = document.createElement('div');
        phaseWrapper.classList.add('phase-wrapper');

        const { phaseTable, callsTable } = createTablesForPhase(phaseData, index, totalPhases, tooltips);

        phaseWrapper.appendChild(phaseTable);
        phaseWrapper.appendChild(callsTable);
        contentContainer.appendChild(phaseWrapper);
    });
};

const createAircraftDetailsTable = (details, container) => {
    const detailsTable = document.createElement('table');
    detailsTable.classList.add('aircraft-details-table');
    const tbody = document.createElement('tbody');

    // Row 1: ICAO, Model, Type, Weight Category
    const row1 = document.createElement('tr');
    const keys1 = ['icao', 'model', 'type', 'weightCategory'];
    keys1.forEach(key => {
        const th = document.createElement('th');
        th.textContent = key.toUpperCase().replace('WEIGHTCATEGORY', 'WEIGHT');
        const td = document.createElement('td');
        td.textContent = details[key];
        row1.appendChild(th);
        row1.appendChild(td);
    });
    tbody.appendChild(row1);

    // Row 2: Route, SID, Length, Wingspan
    const row2 = document.createElement('tr');
    const keys2 = ['route', 'sid', 'length', 'wingspan'];
    keys2.forEach(key => {
        const th = document.createElement('th');
        th.textContent = key.toUpperCase();
        const td = document.createElement('td');
        td.textContent = details[key];
        row2.appendChild(th);
        row2.appendChild(td);
    });
    tbody.appendChild(row2);

    detailsTable.appendChild(tbody);
    container.appendChild(detailsTable);
};

const createTablesForPhase = (phaseData, index, totalPhases, tooltips) => {
    const phaseTable = document.createElement('table');
    phaseTable.classList.add('phase-table');
    phaseTable.innerHTML = `
        <tbody>
            <tr>
                <td class="phase-header-cell">
                    <span class="phase-index">${index + 1} of ${totalPhases}</span><br>${phaseData.phase}
                </td>
            </tr>
            <tr>
                <td class="phase-transition">${phaseData.transition}</td>
            </tr>
        </tbody>
    `;

    const callsTable = document.createElement('table');
    callsTable.classList.add('calls-table');
    const callsTbody = document.createElement('tbody');

    phaseData.calls.forEach(call => {
        const row = createCallRow(call, tooltips);
        callsTbody.appendChild(row);
    });

    callsTable.appendChild(callsTbody);

    return { phaseTable, callsTable };
};

const createCallRow = (call, tooltips) => {
    const row = document.createElement('tr');

    const typeCell = document.createElement('td');
    typeCell.textContent = call.type;
    row.appendChild(typeCell);

    const contentCell = document.createElement('td');
    contentCell.innerHTML = formatContentWithTooltips(call.content, tooltips);
    contentCell.classList.add(`call-${call.type.toLowerCase().replace(' ', '-')}`);
    row.appendChild(contentCell);

    const buttonCell = document.createElement('td');
    buttonCell.classList.add('button-cell');
    buttonCell.appendChild(createButtonOrIcon(call));
    row.appendChild(buttonCell);

    return row;
};

const formatContentWithTooltips = (content, tooltips) => {
    return content.replace(/{([^}]+)}/g, (match, fullVariable) => {
        const variableName = fullVariable.trim();
        const firstWord = variableName.split(' ')[0];
        const tooltipText = tooltips[variableName] || tooltips[firstWord] || `No definition for "${variableName}"`;
        return `<span class="variable-text" data-tooltip-text="${tooltipText}">${match}</span>`;
    });
};

const createButtonOrIcon = (call) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('centered-content-wrapper');

    if (call.buttonCaption) {
        const button = document.createElement('button');
        button.textContent = call.buttonCaption;
        button.classList.add('command-button');
        wrapper.appendChild(button);
    } else if (call.type === 'ATC Call') {
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-headset', 'command-icon');
        wrapper.appendChild(icon);
    }
    return wrapper;
};

/* ====================================
    Module 3: Event Listeners
    ==================================== */

const setupEventListeners = (aircraftList, tooltips, dataPath) => {
    const navPanel = document.getElementById('nav-panel');

    aircraftList.forEach(aircraft => {
        const navLink = document.createElement('a');
        navLink.href = '#';
        navLink.textContent = aircraft.name;
        navLink.classList.add('nav-link');
        navPanel.appendChild(navLink);

        navLink.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            navLink.classList.add('active');
            createPhaseLinks(aircraft, tooltips, dataPath);
        });
    });
};

/* ====================================
    Module 4: Initial Call
    ==================================== */
document.addEventListener('DOMContentLoaded', initializeApp);