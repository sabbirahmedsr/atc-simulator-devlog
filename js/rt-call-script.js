/* ====================================
    Module 1: Core Utilities
    Description: Provides foundational functions for data fetching, string normalization, and the app's entry point.
    ==================================== */

/* ====================================
    Module 1.1: Data Fetching
    Description: A reusable function to fetch and parse JSON data from a given URL.
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

/* ====================================
    Module 1.2: String Normalization
    Description: Normalizes a string for case-insensitive and flexible variable matching by removing non-alphanumeric characters and converting to lowercase.
    ==================================== */

/**
 * Normalizes a string by removing non-alphanumeric characters and converting to lowercase.
 * This is used for case-insensitive and flexible variable matching.
 * @param {string} str - The string to normalize.
 * @returns {string} The normalized string.
 */
const normalizeString = (str) => {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

/* ====================================
    Module 1.3: Application Initialization
    Description: The entry point that fetches data and starts the UI setup.
    ==================================== */

/**
 * Initializes the application by fetching all necessary data files.
 */
const initializeApp = async () => {
    const [callData, commandParameterData] = await Promise.all([
        fetchData('../data/rt-call/all-rt-call-data.json'),
        fetchData('../data/rt-call/all-parameter-data.json')
    ]);

    if (!callData || !commandParameterData) {
        document.querySelector('.communication-table-container').innerHTML = '<p class="error-message">Could not load all necessary data. Please check the file paths.</p>';
        return;
    }

    setupNavigation(callData, commandParameterData);
};

/* ====================================
    Module 2: UI Rendering & DOM Manipulation
    Description: Contains functions for rendering and updating the main content area based on data.
    ==================================== */

/* ====================================
    Module 2.1: Main Content Renderer
    Description: Renders all `CallSession` elements on the page and updates the main title.
    ==================================== */

/**
 * Updates the main title of the content area.
 * @param {string} category - The category name to display in the title.
 */
const updateMainTitle = (category) => {
    const mainTitle = document.querySelector('.main-content h1');
    if (mainTitle) {
        // Check if the category already ends with " Call"
        if (category.endsWith(' Call')) {
            mainTitle.textContent = category;
        } else {
            mainTitle.textContent = `${category} Call`;
        }
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

    if (totalSessions === 0) {
        contentContainer.innerHTML = '<p class="no-data-message">No call logs found for this category.</p>';
        return;
    }

    sessionsData.forEach((sessionData, index) => {
        const sessionWrapper = document.createElement('div');
        sessionWrapper.classList.add('call-session-wrapper');
        // Add a unique ID to each session for navigation
        sessionWrapper.id = `session-${sessionData.title.replace(/\s+/g, '-')}`;

        const { metaDataElement, callDataElement } = createCallSessionElements(sessionData, index, totalSessions, tooltipData);
        
        sessionWrapper.appendChild(metaDataElement);
        sessionWrapper.appendChild(callDataElement);

        contentContainer.appendChild(sessionWrapper);
        
        // Add a divider after each session, but not after the last one
        if (index < totalSessions - 1) {
            const divider = document.createElement('div');
            divider.classList.add('call-session-divider');
            contentContainer.appendChild(divider);
        }
    });
    
    // Call the original setupTooltips function
    setupTooltips();
};

/* ====================================
    Module 2.2: Call Session Component Creation
    Description: Functions to build the individual DOM elements for each call session.
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
        </tbody>
    `;

    const metaDataTitleCell = metaDataElement.querySelector('.meta-data-title-cell');
    metaDataTitleCell.addEventListener('click', () => {
        // Now passing the route information to the popup function
        showDescriptionPopup(sessionData.title, sessionData.description, sessionData.Route);
    });

    const callDataElement = createCallDataElement(sessionData, tooltipData);

    return { metaDataElement, callDataElement };
};

/* ====================================
    Module 2.3: Call Data Component Creation
    Description: Functions to build the individual DOM elements for the call data (ATC, Feedback) component.
    ==================================== */

/**
 * Creates the right-hand table element containing the call data (Initial, ATC, Feedback).
 * @param {Object} sessionData - The data for the current call session.
 * @param {Object} commandParameterData - The data for command parameters.
 * @returns {HTMLElement} The created table element.
 */
const createCallDataElement = (sessionData, commandParameterData) => {
    const callDataElement = document.createElement('table');
    callDataElement.classList.add('call-data-table');

    const createRow = (label, text, type, commandData) => {
        const row = document.createElement('tr');
        const labelCell = document.createElement('td');
        const textCell = document.createElement('td');
        const buttonCell = document.createElement('td');

        labelCell.textContent = label;
        textCell.innerHTML = formatCallContent(text, commandParameterData);
        textCell.classList.add(`call-${type}`);

        buttonCell.classList.add('button-cell');

        const isPilot = commandData.caption !== 'ATC';
        
        const buttonOrIcon = createButtonOrIcon({ isPilot, buttonId: type }, commandData, commandParameterData);
        buttonCell.appendChild(buttonOrIcon);

        row.appendChild(labelCell);
        row.appendChild(textCell);
        row.appendChild(buttonCell);

        return row;
    };

    const initialRow = createRow('Initial Call', sessionData.initialCall, 'initial-call', sessionData.initialCommand);
    const atcRow = createRow('ATC Call', sessionData.atcCall, 'atc-call', { caption: 'ATC' });
    const feedbackRow = createRow('Feedback', sessionData.feedbackCall, 'feedback', sessionData.feedbackCommand);

    callDataElement.appendChild(initialRow);
    callDataElement.appendChild(atcRow);
    callDataElement.appendChild(feedbackRow);

    return callDataElement;
};

/* ====================================
    Module 2.4: Call Content Formatting
    Description: Replaces variable placeholders with styled spans for tooltips, matching them against values from the command-parameter.json file.
    ==================================== */

/**
 * Replaces variable placeholders in call content with styled spans and tooltip data.
 * @param {string} content - The raw call content string.
 * @param {Object} commandParameterData - The data for command parameters.
 * @returns {string} The HTML string with formatted variables.
 */
const formatCallContent = (content, commandParameterData) => {
    if (content === null) {
        return "Not available";
    }

    let formattedContent = content;

    const regex = new RegExp(`({[^{}]*?})|(${Object.keys(commandParameterData).join('|')})`, 'gi');

    formattedContent = formattedContent.replace(regex, (match, variableMatch, nameMatch) => {
        // Handle a curly-braced variable match
        if (variableMatch) {
            const variableValue = variableMatch.slice(1, -1);
            const normalizedVariable = normalizeString(variableValue);
            
            let param = null;
            let paramName = '';

            for (const name in commandParameterData) {
                const currentParam = commandParameterData[name];
                
                const matchFound = (normalizeString(name) === normalizedVariable) || 
                                   currentParam.values.some(paramValue => normalizeString(paramValue) === normalizedVariable);

                if (matchFound) {
                    param = currentParam;
                    paramName = name;
                    break;
                }
            }
            
            if (param) {
                const tooltipText = `${paramName}: ${param.description.trim()}`;
                return `<span class="variable-text" data-tooltip-text="${tooltipText}">{${variableValue}}</span>`;
            } else {
                const noMatchTooltip = `No data found for: ${variableValue}`;
                return `<span class="no-tooltip-text" data-tooltip-text="${noMatchTooltip}">{${variableValue}}</span>`;
            }
        }

        // Handle a standalone parameter name match
        if (nameMatch) {
            const paramName = nameMatch;
            const param = commandParameterData[paramName];
            
            if (param) {
                const tooltipText = `${paramName}: ${param.description.trim()}`;
                return `<span class="variable-text" data-tooltip-text="${tooltipText}">${match}</span>`;
            }
        }

        return match;
    });

    return formattedContent;
};

/* ====================================
    Module 2.5: Button and Icon Creation
    Description: Creates a command button or ATC icon with enhanced click handling for 'Play On Awake' and a fully disabled state for missing captions.
    ==================================== */

/**
 * Creates a command button or ATC icon based on the row information.
 * @param {Object} rowInfo - The data for the current table row.
 * @param {Object} [commandData] - Optional: The command data for the button.
 * @param {Object} commandParameterData - The data for command parameters.
 * @returns {HTMLElement} The created button or icon element.
 */
const createButtonOrIcon = (rowInfo, commandData, commandParameterData) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('centered-content-wrapper');

    if (rowInfo.isPilot) {
        const button = document.createElement('button');
        
        // Handle no caption case first
        if (!commandData || !commandData.buttonCaption) {
            button.textContent = ''; // No caption
            button.classList.add('command-button', 'null-state');
            
            // Explicitly prevent any click action
            button.addEventListener('click', (event) => {
                event.preventDefault();
            });

            wrapper.appendChild(button);
            return wrapper;
        }

        button.textContent = commandData.buttonCaption;
        button.classList.add('command-button');

        // Check the dedicated 'playOnAwake' boolean field
        if (commandData.playOnAwake === true) {
            button.classList.add('inactive');
            // Show the popup on click
            button.addEventListener('click', (event) => {
                event.preventDefault();
                showAutoPlayMessagePopup();
            });
        } else {
            // Original click event for all other interactive buttons
            button.addEventListener('click', () => {
                showButtonDetailsPopup(commandData, commandParameterData);
            });
        }

        // Store the command data for later use
        button.textContent = commandData.buttonCaption;
        button.dataset.allCmdInitial = JSON.stringify(commandData.allCmdInitial);
        wrapper.appendChild(button);
    } else {
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-headset', 'command-icon');
        wrapper.appendChild(icon);
    }
    return wrapper;
};

/* ====================================
    Module 2.6: Popup System
    Description: Manages the display and functionality of various popups.
    ==================================== */

/* ====================================
    Module 2.6.1: Description Popup
    Description: Displays a popup with a session's description and route information.
    ==================================== */

/**
 * Displays a popup with a description and route.
 * @param {string} title - The title for the popup.
 * @param {string} description - The description text for the popup.
 * @param {string} route - The route text for the popup.
 */
const showDescriptionPopup = (title, description, route) => {
    const popupOverlay = document.createElement('div');
    popupOverlay.classList.add('popup-overlay');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

    // Updated HTML structure to include the new description box and quotation marks
    popupContent.innerHTML = `
        <h2 class="popup-title">${title}</h2>
        <div class="popup-info">
            <p class="popup-route">${route}</p>
        </div>
        <div class="popup-description-box">
            <p class="popup-description">${description}</p>
        </div>
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
    Module 2.6.2: Button Details Popup
    Description: Displays a popup with detailed information about a command button, including required status and parameter details.
    ==================================== */

/**
 * Displays a popup with detailed information from a command object.
 * @param {Object} commandData - The command data for the button.
 * @param {Object} commandParameterData - The data for command parameters.
 */
const showButtonDetailsPopup = (commandData, commandParameterData) => {
    const popupOverlay = document.createElement('div');
    popupOverlay.classList.add('popup-overlay');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

    const formatArray = (arr) => arr.length > 0 ? arr.join(', ') : 'None';
    const getStatus = (status) => status ? 'Yes' : 'No';

    let parametersHtml = '';
    const hasParameters = commandData.allParameterId && commandData.allParameterId.length > 0;

    if (hasParameters) {
        const parameterListHtml = commandData.allParameterId.map(paramName => {
            const normalizedParamName = paramName.trim().toLowerCase();
            let matchedParam = null;

            // Find the matching parameter data, ignoring case and whitespace
            for (const key in commandParameterData) {
                if (key.trim().toLowerCase() === normalizedParamName) {
                    matchedParam = commandParameterData[key];
                    break;
                }
            }

            if (matchedParam) {
                const values = matchedParam.values || [];
                let valuesDropdownHtml = '';
                if (values.length > 0) {
                    const options = values.map(val => `<option>${val}</option>`).join('');
                    valuesDropdownHtml = `<select class="param-dropdown">${options}</select>`;
                }

                return `
                    <div class="param-detail">
                        <div class="param-row-container">
                            <p class="param-name"><strong>${paramName}</strong></p>
                            ${valuesDropdownHtml}
                        </div>
                    </div>
                `;
            } else {
                return `<p><strong>${paramName}</strong>: No detailed data found.</p>`;
            }
        }).join('');
        
        parametersHtml = `<div class="parameters-section">${parameterListHtml}</div>`;
    }

    // Combine main and alternate commands into a single string
    let commandInitial = `<strong>All Command Line Initial:</strong>&nbsp;&nbsp;&nbsp;${commandData.allCmdInitial.join(', ') || 'None'}`;
    popupContent.innerHTML = `
        <h2 class="popup-title">${commandData.buttonCaption}</h2>
        <div class="popup-info">
            <p>${commandInitial}</p>
            ${parametersHtml}
            <hr>
            <div class="required-status-container">
                <p><strong>Required to Initiate:</strong> ${getStatus(commandData.requiredToInitiate)}</p>
                <p><strong>Required to Complete:</strong> ${getStatus(commandData.requiredToComplete)}</p>
            </div>
        </div>
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
    Module 2.6.3: Auto Play Message Popup
    Description: Displays a popup message for "Play On Awake" buttons.
    ==================================== */

/**
 * Displays a popup message for "Play On Awake" buttons.
 */
const showAutoPlayMessagePopup = () => {
    const popupOverlay = document.createElement('div');
    popupOverlay.classList.add('popup-overlay');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');
    
    // Updated content with a clear message
    popupContent.innerHTML = `
        <h2 class="popup-title">Automated Action</h2>
        <div class="popup-description-box" style="margin-bottom: 30px;">
            <p class="popup-description">This command is designed to play automatically and does not require a manual button click.</p>
        </div>
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
    Module 3: Event Listeners & Navigation
    Description: Manages the interactive components of the UI, including tooltips and the two-tier navigation panel.
    ==================================== */

/* ====================================
    Module 3.1: Tooltip Logic
    Description: Sets up and manages the hover-based tooltips for variables.
    ==================================== */

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

/* ====================================
    Module 3.2: Navigation Logic
    Description: Sets up the two-tier navigation panel with filtering and scrolling functionality.
    ==================================== */

/**
 * Sets up the two-tier navigation panel.
 * @param {Object} data - The main call data object.
 * @param {Object} tooltipData - The data for variable tooltips.
 */
const setupNavigation = (data, tooltipData) => {
    const filterContainer = document.getElementById('category-filter-container');
    
    // Clear existing content
    filterContainer.innerHTML = '';
    
    const mainCategories = Object.keys(data);
    const captions = {
        'allArrivalCall': 'ARRIVAL',
        'allDepartureCall': 'DEPARTURE',
        'allCircuitCall': 'CIRCUIT',
        'allSpecialCall': 'SPECIAL',
        'allNewCall': 'NEW'
    };

    // Create and append category filter buttons
    const filterGroup = document.createElement('div');
    filterGroup.classList.add('category-filter-group');
    
    mainCategories.forEach(categoryKey => {
        const button = document.createElement('button');
        button.textContent = captions[categoryKey] || categoryKey.replace('all', '').replace('Call', '').toUpperCase();
        button.classList.add('category-filter-button');
        button.dataset.categoryKey = categoryKey;
        filterGroup.appendChild(button);

        button.addEventListener('click', () => {
            document.querySelectorAll('.category-filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderNavigationAndContent(categoryKey, data, tooltipData);
        });
    });
    filterContainer.appendChild(filterGroup);

    const firstButton = document.querySelector('.category-filter-button');
    if (firstButton) {
        firstButton.classList.add('active');
        renderNavigationAndContent(firstButton.dataset.categoryKey, data, tooltipData);
    }
};

/**
 * Renders the sub-navigation links and the main content based on the selected category.
 * @param {string} categoryKey - The key for the main category (e.g., 'allArrivalCall').
 * @param {Object} data - The main call data object.
 * @param {Object} tooltipData - The data for variable tooltips.
 */
const renderNavigationAndContent = (categoryKey, data, tooltipData) => {
    const phaseListContainer = document.getElementById('phase-list-container');
    
    // Always clear the existing navigation links before rendering new ones
    phaseListContainer.innerHTML = '';

    const shortCaptions = {
        'allArrivalCall': 'Arr',
        'allDepartureCall': 'Dep',
        'allCircuitCall': 'Cct',
        'allSpecialCall': 'Spl',
        'allNewCall': 'New'
    };

    const fullNames = {
        'allArrivalCall': 'Arrival',
        'allDepartureCall': 'Departure',
        'allCircuitCall': 'Circuit',
        'allSpecialCall': 'Special',
        'allNewCall': 'New'
    };

    const shortName = shortCaptions[categoryKey] || categoryKey.replace('all', '').replace('Call', '').substring(0, 3);
    const fullName = fullNames[categoryKey] || categoryKey.replace('all', '').replace('Call', '');

    const allCallsLink = document.createElement('a');
    allCallsLink.href = '#';
    allCallsLink.textContent = `ALL ${shortName.toUpperCase()} CALL`;
    allCallsLink.classList.add('nav-link-button', 'active');
    phaseListContainer.appendChild(allCallsLink);

    allCallsLink.addEventListener('click', (event) => {
        event.preventDefault();
        document.querySelectorAll('.nav-link-button').forEach(link => link.classList.remove('active'));
        allCallsLink.classList.add('active');
        renderCallSessions(data[categoryKey], `All ${fullName} Call`, tooltipData);
        renderSubNavigationLinks(data[categoryKey]);
    });

    const uniqueCategories = [...new Set(data[categoryKey].map(item => item.category))];
    uniqueCategories.forEach((category) => {
        const navLink = document.createElement('a');
        navLink.href = '#';
        navLink.textContent = category.toUpperCase();
        navLink.classList.add('nav-link-button');
        phaseListContainer.appendChild(navLink);

        navLink.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelectorAll('.nav-link-button').forEach(link => link.classList.remove('active'));
            navLink.classList.add('active');

            const filteredData = data[categoryKey].filter(item => item.category === category);
            
            renderCallSessions(filteredData, category, tooltipData);
            renderSubNavigationLinks(filteredData);
        });
    });

    renderCallSessions(data[categoryKey], `All ${fullName} Call`, tooltipData);
    renderSubNavigationLinks(data[categoryKey]);
};

/**
 * Renders the new set of sub-navigation links based on call titles.
 * @param {Array<Object>} sessionsData - The array of call session data.
 */
const renderSubNavigationLinks = (sessionsData) => {
    const phaseListContainer = document.getElementById('phase-list-container');
    
    // Remove existing dynamic navigation links and section divider
    const existingDynamicElements = phaseListContainer.querySelectorAll('.dynamic-nav-link, .section-divider');
    existingDynamicElements.forEach(element => element.remove());

    // Add a new section divider
    const divider = document.createElement('div');
    divider.classList.add('section-divider');
    phaseListContainer.appendChild(divider);

    // Create a nav link for each call title
    sessionsData.forEach((sessionData) => {
        const navLink = document.createElement('a');
        navLink.href = `#session-${sessionData.title.replace(/\s+/g, '-')}`;
        navLink.textContent = sessionData.title;
        navLink.classList.add('nav-link-button', 'dynamic-nav-link');
        
        navLink.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = navLink.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Scroll the element into the vertical center of the screen
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Then, highlight the element for a few seconds
                highlightSelectedCall(targetId);
            }
        });
        
        phaseListContainer.appendChild(navLink);
    });
};

/**
 * Highlights a selected call session and then removes the highlight after a delay.
 * @param {string} sessionId - The ID of the session to highlight.
 */
const highlightSelectedCall = (sessionId) => {
    // Remove highlight from all highlighted sessions to ensure a fresh start
    document.querySelectorAll('.call-session-wrapper.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });

    // Add highlight to the new selected session
    const selectedSession = document.getElementById(sessionId);
    if (selectedSession) {
        // Force a DOM reflow to restart the animation
        void selectedSession.offsetWidth; 

        selectedSession.classList.add('highlighted');

        // Remove the highlight class after the animation duration (0.5s)
        setTimeout(() => {
            selectedSession.classList.remove('highlighted');
        }, 1000); // Matches the new animation duration
    }
};

/* ====================================
    Module 4: Initial Call
    Description: The entry point of the application, which triggers the data fetching process.
    ==================================== */

document.addEventListener('DOMContentLoaded', initializeApp);