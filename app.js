// Show/Hide Sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    event.target.closest('.nav-item').classList.add('active');
    const titles = {dashboard: 'Dashboard', calls: 'Call Logs', location: 'Location History', device: 'Device Status'};
    document.getElementById('page-title').textContent = titles[sectionId];
    loadSectionData(sectionId);
}

async function loadSectionData(sectionId) {
    try {
        if (sectionId === 'dashboard') await loadDashboardData();
        else if (sectionId === 'calls') await loadCallLogs();
        else if (sectionId === 'location') await loadLocations();
        else if (sectionId === 'device') await loadDeviceStatus();
    } catch (error) {
        console.error(`Error loading ${sectionId}:`, error);
    }
}

async function loadDashboardData() {
    try {
        const [callLogs, deviceStatus, locations] = await Promise.all([
            databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.callLogs),
            databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.deviceStatus),
            databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.locations)
        ]);
        document.getElementById('total-calls').textContent = callLogs.total;
        document.getElementById('total-locations').textContent = locations.total;
        if (deviceStatus.documents.length > 0) {
            const latest = deviceStatus.documents[0];
            document.getElementById('device-status-text').textContent = latest.connected === 'yes' ? 'Online' : 'Offline';
            document.getElementById('battery-percent').textContent = latest.battery || '0%';
        }
        displayRecentCalls(callLogs.documents);
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

async function loadCallLogs() {
    try {
        const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.callLogs);
        displayCallLogsTable(response.documents);
    } catch (error) {
        console.error('Call logs error:', error);
    }
}

async function loadLocations() {
    try {
        const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.locations);
        displayLocations(response.documents);
    } catch (error) {
        console.error('Locations error:', error);
    }
}

async function loadDeviceStatus() {
    try {
        const response = await databases.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.collections.deviceStatus);
        displayDeviceStatus(response.documents);
    } catch (error) {
        console.error('Device status error:', error);
    }
}

function displayRecentCalls(calls) {
    const container = document.getElementById('recent-calls');
    if (calls.length === 0) {
        container.innerHTML = '<p class="no-data">No call logs</p>';
        return;
    }
    const html = calls.slice(0, 5).map(call => `
        <div class="list-item">
            <div class="item-icon">📞</div>
            <div class="item-content">
                <h4>${call.name}</h4>
                <p>${call.number} • ${call.type}</p>
                <span class="item-meta">${call.date} at ${call.time}</span>
            </div>
            <div class="item-value">${call.duration}</div>
        </div>
    `).join('');
    container.innerHTML = html;
}

function displayCallLogsTable(calls) {
    const tbody = document.getElementById('calls-table-body');
    if (calls.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No data</td></tr>';
        return;
    }
    const html = calls.map(call => `
        <tr>
            <td>${call.name}</td>
            <td>${call.number}</td>
            <td><span class="badge badge-${call.type.toLowerCase()}">${call.type}</span></td>
            <td>${call.duration}</td>
            <td>${call.date}</td>
            <td>${call.time}</td>
        </tr>
    `).join('');
    tbody.innerHTML = html;
}

function displayLocations(locations) {
    const container = document.getElementById('location-list');
    if (locations.length === 0) {
        container.innerHTML = '<p class="no-data">No location data</p>';
        return;
    }
    const html = locations.slice(0, 20).map(loc => `
        <div class="list-item">
            <div class="item-icon">📍</div>
            <div class="item-content">
                <h4>Lat: ${parseFloat(loc.latitude).toFixed(4)}, Lng: ${parseFloat(loc.longitude).toFixed(4)}</h4>
                <p>${loc.date} at ${loc.time}</p>
                ${loc.google_maps ? `<a href="${loc.google_maps}" target="_blank">View on Map</a>` : ''}
            </div>
        </div>
    `).join('');
    container.innerHTML = html;
}

function displayDeviceStatus(devices) {
    const container = document.getElementById('device-status-list');
    if (devices.length === 0) {
        container.innerHTML = '<p class="no-data">No device data</p>';
        return;
    }
    const html = devices.slice(0, 20).map(dev => `
        <div class="list-item">
            <div class="item-icon">${dev.connected === 'yes' ? '🟢' : '🔴'}</div>
            <div class="item-content">
                <h4>${dev.connected === 'yes' ? 'Online' : 'Offline'}</h4>
                <p>Battery: ${dev.battery} | ${dev.date} at ${dev.time}</p>
            </div>
        </div>
    `).join('');
    container.innerHTML = html;
}

async function refreshData() {
    const navItems = document.querySelectorAll('.nav-item');
    for (let item of navItems) {
        if (item.classList.contains('active')) {
            item.click();
            break;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});
