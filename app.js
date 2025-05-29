// Remove Supabase Configuration since it's now in index.html

// Function to check if Supabase is ready
function isSupabaseReady() {
    if (!window.supabase) {
        console.error('Supabase is not initialized!');
        return false;
    }
    try {
        // Test if we can access the from method
        if (typeof window.supabase.from === 'function') {
            return true;
        }
        console.error('Supabase client is missing required methods');
        return false;
    } catch (error) {
        console.error('Error checking Supabase:', error);
        return false;
    }
}

// Initialize check
console.log('Checking Supabase connection...');
if (isSupabaseReady()) {
    console.log('Supabase is ready to use!');
} else {
    console.log('Waiting for Supabase to initialize...');
}

// Save Masjid data
async function saveMasjid(event) {
    event.preventDefault();
    console.log('Attempting to save masjid...');

    if (!isSupabaseReady()) {
        alert('Database is not ready. Please refresh the page.');
        return;
    }

    const masjidData = {
        name: document.getElementById('masjidName').value,
        fajr: document.getElementById('fajr').value,
        zuhr: document.getElementById('zuhr').value,
        asr: document.getElementById('asr').value,
        maghrib: document.getElementById('maghrib').value,
        isha: document.getElementById('isha').value
    };

    try {
        console.log('Attempting to insert data:', masjidData);
        
        // Test the Supabase connection first
        const { data: testData, error: testError } = await window.supabase
            .from('masjids')
            .select('count');
            
        if (testError) {
            console.error('Database connection test failed:', testError);
            throw new Error('Database connection failed: ' + testError.message);
        }
        
        console.log('Database connection test successful');

        // Now try to insert the data
        const { data, error } = await window.supabase
            .from('masjids')
            .insert([masjidData])
            .select();

        if (error) {
            console.error('Insert error:', error);
            throw new Error(error.message || 'Failed to add masjid');
        }
        
        if (!data) {
            throw new Error('No data returned from insert');
        }
        
        console.log('Masjid added successfully:', data);
        alert('Masjid added successfully!');
        document.getElementById('masjidForm').reset();
    } catch (error) {
        console.error('Detailed error:', error);
        alert(error.message || 'Error adding masjid. Please try again.');
    }
}

// Search for Masjid
async function searchMasjid() {
    if (!isSupabaseReady()) {
        alert('Please wait a moment and try again. Database is connecting...');
        return;
    }

    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<h3>Searching...</h3>';

    try {
        const { data, error } = await window.supabase
            .from('masjids')
            .select('*')
            .ilike('name', `%${searchInput}%`);

        if (error) throw error;

        let resultsHtml = '';
        if (data && data.length > 0) {
            data.forEach(masjid => {
                resultsHtml += `
                    <div class="masjid-card">
                        <h3>${masjid.name}</h3>
                        <div class="prayer-times-display">
                            <p><strong>Fajr:</strong> ${masjid.fajr}</p>
                            <p><strong>Zuhr:</strong> ${masjid.zuhr}</p>
                            <p><strong>Asr:</strong> ${masjid.asr}</p>
                            <p><strong>Maghrib:</strong> ${masjid.maghrib}</p>
                            <p><strong>Isha:</strong> ${masjid.isha}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            resultsHtml = '<p>No masjids found.</p>';
        }

        resultsDiv.innerHTML = resultsHtml;
    } catch (error) {
        console.error('Error searching for masjids:', error);
        resultsDiv.innerHTML = '<p>Error searching for masjids: ' + error.message + '</p>';
    }
}

// Show all Masjids
async function showAllMasjids() {
    if (!isSupabaseReady()) {
        alert('Database is not ready. Please refresh the page.');
        return;
    }

    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<h3>Loading all masjids...</h3>';

    try {
        const { data, error } = await window.supabase
            .from('masjids')
            .select('*');

        if (error) throw error;

        let resultsHtml = '';
        if (data && data.length > 0) {
            resultsHtml = '<div class="masjids-grid">';
            data.forEach(masjid => {
                resultsHtml += `
                    <div class="masjid-card">
                        <h3>${masjid.name}</h3>
                        <div class="prayer-times-display">
                            <div class="prayer-time">
                                <span class="prayer-label">Fajr:</span>
                                <span class="prayer-value">${masjid.fajr}</span>
                            </div>
                            <div class="prayer-time">
                                <span class="prayer-label">Zuhr:</span>
                                <span class="prayer-value">${masjid.zuhr}</span>
                            </div>
                            <div class="prayer-time">
                                <span class="prayer-label">Asr:</span>
                                <span class="prayer-value">${masjid.asr}</span>
                            </div>
                            <div class="prayer-time">
                                <span class="prayer-label">Maghrib:</span>
                                <span class="prayer-value">${masjid.maghrib}</span>
                            </div>
                            <div class="prayer-time">
                                <span class="prayer-label">Isha:</span>
                                <span class="prayer-value">${masjid.isha}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            resultsHtml += '</div>';
        } else {
            resultsHtml = '<p class="no-results">No masjids found in the database.</p>';
        }

        resultsDiv.innerHTML = resultsHtml;
    } catch (error) {
        console.error('Error fetching masjids:', error);
        resultsDiv.innerHTML = '<p class="error-message">Error loading masjids: ' + error.message + '</p>';
    }
}

// Add event listener for search input
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchMasjid();
        }
    });
}

// Add some additional CSS for the search results
const style = document.createElement('style');
style.textContent = `
    .masjid-card {
        background-color: #fff;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .masjid-card h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
    }

    .prayer-times-display {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
    }

    .prayer-times-display p {
        margin: 0;
    }
`;
document.head.appendChild(style);

// Function to export masjid data
function exportMasjidData() {
    const masjids = JSON.parse(localStorage.getItem('masjids')) || [];
    const dataStr = JSON.stringify(masjids, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'masjid-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to import masjid data
function importMasjidData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            const currentMasjids = JSON.parse(localStorage.getItem('masjids')) || [];
            
            // Merge imported data with existing data, avoiding duplicates
            const mergedMasjids = [...currentMasjids];
            importedData.forEach(importedMasjid => {
                if (!mergedMasjids.some(m => m.name === importedMasjid.name && m.address === importedMasjid.address)) {
                    mergedMasjids.push(importedMasjid);
                }
            });
            
            localStorage.setItem('masjids', JSON.stringify(mergedMasjids));
            alert('Masjid data imported successfully!');
            displayMasjids(); // Refresh the display
        } catch (error) {
            alert('Error importing data. Please make sure the file is valid.');
        }
    };
    reader.readAsText(file);
}

// Gist-based cloud sync
const GIST_ID = 'YOUR_GIST_ID'; // User will need to create a Gist and put ID here

async function uploadToGist() {
    try {
        const masjids = JSON.parse(localStorage.getItem('masjids')) || [];
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`);
        
        if (response.ok) {
            alert('Data uploaded to cloud successfully!');
        } else {
            throw new Error('Failed to upload');
        }
    } catch (error) {
        alert('Error uploading to cloud. Please check your connection.');
        console.error('Upload error:', error);
    }
}

async function downloadFromGist() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`);
        
        if (response.ok) {
            const data = await response.json();
            const content = JSON.parse(data.files['masjid-data.json'].content);
            
            // Update local storage with cloud data
            localStorage.setItem('masjids', JSON.stringify(content));
            alert('Data downloaded from cloud successfully!');
            showAllMasjids(); // Refresh the display
        } else {
            throw new Error('Failed to download');
        }
    } catch (error) {
        alert('Error downloading from cloud. Please check your connection.');
        console.error('Download error:', error);
    }
} 