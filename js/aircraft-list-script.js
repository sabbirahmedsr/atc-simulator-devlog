const aircraftContainer = document.getElementById('aircraft-container');

// Fetches the JSON data from the specified path
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        aircraftContainer.innerHTML = '<p class="error-message">Failed to load aircraft data.</p>';
        return null;
    }
};

// Extracts the domain name from a URL for attribution.
const getSourceDomainFromUrl = (url) => {
    try {
        const hostname = new URL(url).hostname;
        // Removes 'www.' if it exists to make the name cleaner
        return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    } catch (e) {
        console.error("Invalid URL:", url);
        return "Unknown Source";
    }
};

// Creates and returns an HTML string for a single aircraft card
const createAircraftCardHtml = (aircraft) => {
    const sourceDomain = getSourceDomainFromUrl(aircraft.imageUrl);
    return `
        <div class="aircraft-card">
            <div class="card-image-container">
                <a href="${aircraft.imageUrl}" target="_blank">
                    <img src="${aircraft.imageUrl}" alt="${aircraft.model}" class="aircraft-image">
                </a>
                <div class="image-attribution">
                    Source: <a href="${aircraft.imageUrl}" target="_blank">${sourceDomain}</a>
                </div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h2>${aircraft.name}</h2>
                    <p>${aircraft.fullName}</p>
                </div>
                <div class="card-details">
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-plane-departure icon"></i>ICAO</span>
                        <p>${aircraft.icao}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-tag icon"></i>Model</span>
                        <p>${aircraft.model}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-plane icon"></i>Type</span>
                        <p>${aircraft.type}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-weight-scale icon"></i>Weight</span>
                        <p>${aircraft.weightCategory}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-road icon"></i>Route</span>
                        <p>${aircraft.route}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-map-pin icon"></i>SID</span>
                        <p>${aircraft.sid}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-ruler-horizontal icon"></i>Length</span>
                        <p>${aircraft.length}</p>
                    </div>
                    <div class="detail-item">
                        <span class="label"><i class="fa-solid fa-ruler-combined icon"></i>Wingspan</span>
                        <p>${aircraft.wingspan}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Main function to load data and render the cards
const renderAircrafts = async () => {
    const aircraftData = await fetchData('../data/all-aircraft-data.json');

    if (aircraftData) {
        let cardsHtml = '';
        aircraftData.forEach(aircraft => {
            cardsHtml += createAircraftCardHtml(aircraft);
        });
        aircraftContainer.innerHTML = cardsHtml;
    }
};

// Call the main function when the page loads
document.addEventListener('DOMContentLoaded', renderAircrafts);