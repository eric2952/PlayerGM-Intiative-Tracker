document.addEventListener('DOMContentLoaded', function() {
    // Event delegation for dynamically created campaign buttons
    document.getElementById('campaign-buttons').addEventListener('click', function(e) {
        if (e.target.classList.contains('Campaign-Select-Button')) {
            const campaignName = e.target.textContent;
            showRoleSelection(campaignName);
        }
    });
    
    // Rest of your modal code...
    const modal = document.getElementById('roleSelectionModal');
    const closeBtn = document.querySelector('.close');
    const playerBtn = document.getElementById('playerBtn');
    const gmBtn = document.getElementById('gmBtn');
    const characterSelect = document.getElementById('characterSelect');
    
    let selectedCampaign = null;

    async function showRoleSelection(campaignName) {
        selectedCampaign = campaignName;
        modal.style.display = 'block';
        try{
            const response = await fetch(`/api/campaign/${encodeURIComponent(campaignName)}/PlayerList`);
            const characters = await response.json();

            characters.forEach(character => {
                if (character.chrType == "player"){
                const option = document.createElement('option');
                option.value = character.name;
                option.textContent = character.name;
                characterSelect.appendChild(option);
                };
            });
        } catch(error){
            console.error('Error loading character file: ', error);
        }
    }

    // Close modal when clicking the X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle Player selection
    playerBtn.addEventListener('click', function() {
        console.log(`Joining ${selectedCampaign} as Player`);
        // Redirect to player view or tracker
        window.location.href = `playerPage.html?campaign=${encodeURIComponent(selectedCampaign)}&role=player&playercharacter=${encodeURIComponent(characterSelect.value)}`;
        modal.style.display = 'none';
    });

    // Handle GM selection
    gmBtn.addEventListener('click', function() {
        console.log(`Joining ${selectedCampaign} as Game Master`);
        // Redirect to GM view or tracker
        window.location.href = `tracker.html?campaign=${encodeURIComponent(selectedCampaign)}&role=gm`;
        modal.style.display = 'none';
    });
});