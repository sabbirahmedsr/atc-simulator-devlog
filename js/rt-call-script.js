/* ====================================
    Module 1: Core Utilities & Data Fetching
    ==================================== */

/**
 * Fetches JSON data from a given URL.
 * @param {string} url - The URL of the JSON file.
 * @returns {Promise<Object|null>} The parsed JSON data or null on error.
 */
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
};

/**
 * Normalizes a string by removing non-alphanumeric characters and converting to lowercase.
 * This is used for case-insensitive and flexible variable matching.
 * @param {string} str - The string to normalize.
 * @returns {string} The normalized string.
 */
const normalizeString = (str) => {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

/**
 * Initializes the application by fetching all necessary data files.
 */
const initializeApp = async () => {
    const [callData, tooltipData] = await Promise.all([
        fetchData('../data/rt-call/all-rt-call.json'),
        fetchData('../data/rt-call/variable-tooltip.json')
    ]);

    if (!callData || !tooltipData) {
        document.querySelector('.communication-table-container').innerHTML = '<p class="error-message">Could not load all necessary data. Please check the file paths.</p>';
        return;
    }

    setupNavigation(callData, tooltipData);
};

/* ====================================
    Module 2: UI Rendering & DOM Manipulation
    ==================================== */

/**
 * Updates the main title of the content area.
 * @param {string} category - The category name to display in the title.
 */
const updateMainTitle = (category) => {
    const mainTitle = document.querySelector('.main-content h1');
    if (mainTitle) {
        mainTitle.textContent = `${category} RT Call Log`;
    }
};

/**
 * Renders all `CallSession` elements on the page.
 * @param {Array<Object>} sessionsData - The array of call session data.
 * @param {string} categoryName - The name of the current category.
 * @param {Object} tooltipData - The data for variable tooltips.
 */
const renderCallSessions = (sessionsData, categoryName, tooltipData) => {
    const contentContainer = document.querySelector('.communication-table-container');
    contentContainer.innerHTML = '';
    
    updateMainTitle(categoryName);

    const totalSessions = sessionsData.length;

    sessionsData.forEach((sessionData, index) => {
        const sessionWrapper = document.createElement('div');
        sessionWrapper.classList.add('call-session-wrapper');

        const { metaDataElement, callDataElement } = createCallSessionElements(sessionData, index, totalSessions, tooltipData);
        
        sessionWrapper.appendChild(metaDataElement);
        sessionWrapper.appendChild(callDataElement);

        contentContainer.appendChild(sessionWrapper);
    });
    
    setupTooltips(tooltipData);
};

/* ====================================
    Module 2.1: CallSession Component Creation
    ==================================== */

/**
 * Creates and returns the MetaData and CallData DOM elements for a single CallSession.
 * @param {Object} sessionData - The data for a single call session.
 * @param {number} index - The index of the current session.
 * @param {number} totalSessions - The total number of sessions.
 * @param {Object} tooltipData - The data for variable tooltips.
 * @returns {{metaDataElement: HTMLElement, callDataElement: HTMLElement}} The created elements.
 */
const createCallSessionElements = (sessionData, index, totalSessions, tooltipData) => {
    const metaDataElement = document.createElement('table');
    metaDataElement.classList.add('meta-data-table');
    
    metaDataElement.innerHTML = `
        <tbody>
            <tr>
                <td class="meta-data-title-cell">
                    <span class="meta-data-number">${index + 1} of ${totalSessions}</span><br>${sessionData.title}
                </td>
            </tr>
            <tr>
                <td class="meta-data-route">${sessionData.Route}</td>
            </tr>
        </tbody>
    `;

    const metaDataTitleCell = metaDataElement.querySelector('.meta-data-title-cell');
    metaDataTitleCell.addEventListener('click', () => {
        showDescriptionPopup(sessionData.title, sessionData.description);
    });

    const callDataElement = createCallDataElement(sessionData, tooltipData);

    return { metaDataElement, callDataElement };
};

/**
 * Creates the CallData DOM element (the table with call transcriptions).
 * @param {Object} sessionData - The data for a single call session.
 * @param {Object} tooltipData - The data for variable tooltips.
 * @returns {HTMLElement} The created table element.
 */
const createCallDataElement = (sessionData, tooltipData) => {
    const callDataElement = document.createElement('table');
    callDataElement.classList.add('call-data-table');
    const tbody = document.createElement('tbody');

    const rows = [
        { type: 'Initial Call', content: sessionData.initialCall, buttonId: sessionData.initialCommandId, cssClass: 'call-initial-call' , isPilot: true },
        { type: 'ATC Call', content: sessionData.atcCall, buttonId: null, cssClass: 'call-atc-call' , isPilot: false },
        { type: 'Feedback Call', content: sessionData.feedbackCall, buttonId: sessionData.feedbackCommandId, cssClass: 'call-feedback' , isPilot: true }
    ];

    rows.forEach(rowInfo => {
        const row = document.createElement('tr');
        const typeCell = document.createElement('td');
        typeCell.textContent = rowInfo.type;
        row.appendChild(typeCell);

        const contentCell = document.createElement('td');
        contentCell.classList.add(rowInfo.cssClass);
        contentCell.innerHTML = formatCallContent(rowInfo.content, tooltipData);
        row.appendChild(contentCell);

        const buttonCell = document.createElement('td');
        buttonCell.classList.add('button-cell');
        buttonCell.appendChild(createButtonOrIcon(rowInfo));
        row.appendChild(buttonCell);

        tbody.appendChild(row);
    });

    callDataElement.appendChild(tbody);
    return callDataElement;
};

/**
 * Replaces variable placeholders in call content with styled spans and tooltip data.
 * @param {string} content - The raw call content string.
 * @param {Object} tooltipData - The data for variable tooltips.
 * @returns {string} The HTML string with formatted variables.
 */
const formatCallContent = (content, tooltipData) => {
    const normalizedTooltips = Object.keys(tooltipData).reduce((acc, key) => {
        acc[normalizeString(key)] = key;
        return acc;
    }, {});

    const regex = /{(.*?)}/g;
    return content.replace(regex, (match, variableKeyWithSpace) => {
        const variableKey = variableKeyWithSpace.trim();
        const normalizedKey = normalizeString(variableKey);
        const originalKey = normalizedTooltips[normalizedKey];

        if (originalKey) {
            const tooltipText = tooltipData[originalKey];
            return `{<span class="variable-text" data-tooltip-text="${tooltipText}">${variableKey}</span>}`;
        }
        return match;
    });
};

/**
 * Creates a command button or ATC icon based on the row information.
 * @param {Object} rowInfo - The data for the current table row.
 * @returns {HTMLElement} The created button or icon element.
 */
const createButtonOrIcon = (rowInfo) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('centered-content-wrapper');

    if (rowInfo.isPilot) {
        const button = document.createElement('button');
        button.textContent = rowInfo.buttonId;
        button.classList.add('command-button');
        wrapper.appendChild(button);
    } else {
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-headset', 'command-icon');
        wrapper.appendChild(icon);
    }
    return wrapper;
};

/**
 * Displays a popup with a description.
 * @param {string} title - The title for the popup.
 * @param {string} description - The description text for the popup.
 */
const showDescriptionPopup = (title, description) => {
    const popupOverlay = document.createElement('div');
    popupOverlay.classList.add('popup-overlay');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

    popupContent.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p>
        <button class="popup-ok-button">OK</button>
    `;

    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);

    const closePopup = () => {
        document.body.removeChild(popupOverlay);
    };

    popupContent.querySelector('.popup-ok-button').addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', (event) => {
        if (event.target === popupOverlay) {
            closePopup();
        }
    });
};

/* ====================================
    Module 3: Event Listeners
    ==================================== */

// Sub-module for Tooltip Event Logic
let tooltipTimeout;

/**
 * Sets up the event listeners for all variable text spans to show/hide tooltips.
 */
const setupTooltips = () => {
    const variableSpans = document.querySelectorAll('.variable-text');
    const delay = 500; // Delay in milliseconds before showing the tooltip

    variableSpans.forEach(span => {
        span.addEventListener('mouseenter', () => {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(() => {
                showTooltip(span);
            }, delay);
        });

        span.addEventListener('mouseleave', () => {
            clearTimeout(tooltipTimeout);
            hideTooltip(span);
        });
    });
};

/**
 * Shows the tooltip for a given element, hiding all others.
 * @param {HTMLElement} element - The element to show the tooltip for.
 */
const showTooltip = (element) => {
    document.querySelectorAll('.variable-text.visible').forEach(el => {
        if (el !== element) {
            el.classList.remove('visible');
        }
    });
    
    element.classList.add('visible');
};

/**
 * Hides the tooltip for a given element.
 * @param {HTMLElement} element - The element to hide the tooltip for.
 */
const hideTooltip = (element) => {
    element.classList.remove('visible');
};

// Sub-module for Navigation Logic
/**
 * Sets up the two-tier navigation panel.
 * @param {Object} data - The main call data object.
 * @param {Object} tooltipData - The data for variable tooltips.
 */
const setupNavigation = (data, tooltipData) => {
    const navPanel = document.getElementById('nav-panel');
    navPanel.innerHTML = '';
    const mainCategories = Object.keys(data);

    mainCategories.forEach((mainCategoryKey) => {
        const segment = document.createElement('div');
        segment.classList.add('nav-segment');
        
        const heading = document.createElement('h3');
        heading.textContent = mainCategoryKey.replace('all', '').replace('Call', '').toUpperCase();
        segment.appendChild(heading);

        const allCallsLink = document.createElement('a');
        allCallsLink.href = '#';
        allCallsLink.textContent = `ALL CALLS`;
        allCallsLink.classList.add('nav-link-button');
        segment.appendChild(allCallsLink);

        allCallsLink.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelectorAll('.nav-link-button').forEach(link => link.classList.remove('active'));
            allCallsLink.classList.add('active');
            renderCallSessions(data[mainCategoryKey], allCallsLink.textContent, tooltipData);
        });

        const uniqueCategories = [...new Set(data[mainCategoryKey].map(item => item.category))];

        uniqueCategories.forEach((category) => {
            const navLink = document.createElement('a');
            navLink.href = '#';
            navLink.textContent = category.toUpperCase();
            navLink.classList.add('nav-link-button');
            segment.appendChild(navLink);

            navLink.addEventListener('click', (event) => {
                event.preventDefault();
                document.querySelectorAll('.nav-link-button').forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');

                const filteredData = data[mainCategoryKey].filter(item => item.category === category);
                renderCallSessions(filteredData, category, tooltipData);
            });
        });

        navPanel.appendChild(segment);
    });

    const firstAllCallsLink = document.querySelector('.nav-link-button');
    if (firstAllCallsLink) {
        firstAllCallsLink.classList.add('active');
        const firstMainCategoryKey = mainCategories[0];
        renderCallSessions(data[firstMainCategoryKey], firstAllCallsLink.textContent, tooltipData);
    }
};

/* ====================================
    Module 4: Initial Call
    ==================================== */
document.addEventListener('DOMContentLoaded', initializeApp);