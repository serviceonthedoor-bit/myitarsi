// ========== MY ITARSI - Frontend JavaScript ==========
// ONLY this code goes in your local script.js file!

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyI54-1K2KfJ_XF9opzuajfWJSnxlPXjxV6letT7z3syA8l6khIaypcAGNfqKp4aXmP/exec';  // <-- YOUR URL HERE

let placesData = [];
let activeCategory = 'all';
let searchQuery = '';

// DOM elements
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearchBtn');
const categoryBtns = document.querySelectorAll('.cat-btn');
const cardsContainer = document.getElementById('cardsContainer');
const resultStats = document.getElementById('resultStats');

// Fetch data from Google Sheets via Apps Script
async function fetchDataFromSheets() {
    try {
        resultStats.innerHTML = '🔄 Syncing with Google Sheets...';
        
        console.log('Fetching from:', APPS_SCRIPT_URL);
        
        const response = await fetch(APPS_SCRIPT_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data[0] && data[0].error) {
            throw new Error(data[0].error);
        }
        
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format received');
        }
        
        placesData = data.filter(item => item.name && item.category);
        
        console.log(`✅ Loaded ${placesData.length} records from Google Sheets`);
        
        if (placesData.length === 0) {
            resultStats.innerHTML = '⚠️ No data found. Please add entries to your Google Sheet.';
        } else {
            resultStats.innerHTML = `✅ Loaded ${placesData.length} records from Google Sheets`;
        }
        
        renderCards();
        
    } catch (error) {
        console.error('❌ Sheet connection failed:', error);
        resultStats.innerHTML = `❌ Connection error: ${error.message}`;
        loadFallbackData();
        renderCards();
    }
}

// Fallback demo data
function loadFallbackData() {
    placesData = [
        { name: "Itarsi District Hospital", category: "hospital", address: "Civil Lines, Itarsi", contact: "07572 241001", extra: "24/7 Emergency", typeLabel: "Govt. Hospital" },
        { name: "Delhi Public School Itarsi", category: "school", address: "Junnardeo Road", contact: "07572 288101", extra: "CBSE Curriculum", typeLabel: "CBSE School" },
        { name: "City Auto Service", category: "auto", address: "Railway Station", contact: "99778 66552", extra: "24x7 Available", typeLabel: "Prepaid Auto" }
    ];
    resultStats.innerHTML += '<br><br>⚠️ Using demo data. Connect to Google Sheets for live updates.';
}

// Render cards

function renderCards() {
    let filtered = placesData.filter(item => {
        // Make category comparison case-insensitive
        let itemCategory = (item.category || '').toLowerCase().trim();
        let activeCat = activeCategory.toLowerCase();
        
        if (activeCat !== 'all' && itemCategory !== activeCat) return false;
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (item.name || '').toLowerCase().includes(query) ||
                   (item.address || '').toLowerCase().includes(query) ||
                   (item.contact || '').toLowerCase().includes(query) ||
                   (item.extra || '').toLowerCase().includes(query);
        }
        return true;
    });

    const categoryName = activeCategory === 'all' ? 'all services' : activeCategory + 's';
    resultStats.innerHTML = `📊 Showing ${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} ${searchQuery ? `for "${searchQuery}"` : `in ${categoryName}`}`;
    
    if (filtered.length === 0) {
        cardsContainer.innerHTML = `<div class="no-results">😔 No ${activeCategory !== 'all' ? activeCategory : ''} results found. Try a different category or add data to your Google Sheet!</div>`;
        return;
    }

    cardsContainer.innerHTML = filtered.map(item => {
        let badgeClass = "category-badge";
        let categoryEmoji = "";
        let itemCategory = (item.category || '').toLowerCase();
        
        if (itemCategory === 'hospital') {
            badgeClass += " hospital-badge";
            categoryEmoji = "🏥";
        } else if (itemCategory === 'school') {
            badgeClass += " school-badge";
            categoryEmoji = "🏫";
        } else if (itemCategory === 'auto') {
            badgeClass += " auto-badge";
            categoryEmoji = "🚖";
        }
        
        return `
            <div class="card">
                <div class="card-header">
                    <div class="${badgeClass}">${categoryEmoji} ${itemCategory.toUpperCase()}</div>
                </div>
                <div class="card-title">${escapeHtml(item.name)}</div>
                <div class="card-detail">
                    ${item.address ? `<div class="detail-item"><span class="detail-icon">📍</span> ${escapeHtml(item.address)}</div>` : ''}
                    ${item.contact ? `<div class="detail-item"><span class="detail-icon">📞</span> ${escapeHtml(item.contact)}</div>` : ''}
                    ${item.extra ? `<div class="detail-item"><span class="detail-icon">ℹ️</span> ${escapeHtml(item.extra)}</div>` : ''}
                    ${item.typeLabel ? `<div class="detail-item"><span class="detail-icon">🏷️</span> ${escapeHtml(item.typeLabel)}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Event listeners
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-cat');
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCards();
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCards();
});

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    renderCards();
});

// Initialize
fetchDataFromSheets();