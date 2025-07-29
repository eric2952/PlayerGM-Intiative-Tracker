const socket = io();
let campaignName = null;
let isUpdating = false;
let firstTIme = true;
let currentCharacterIndex = 0;
let characters = [];

let sectcont = 0;
let combatName = "";
window.addEventListener('DOMContentLoaded', async () => {
    CreateGlideInstance();
    campaignName = getURLParameter('campaign');
    selectedcharacterName = getURLParameter('playercharacter')
    firstTIme = true
    // Join campaign room when page loads
    if (campaignName) {
        socket.emit('join-campaign', campaignName);
    }
    // Listen for HP updates from other clients
    socket.on('player-hp-change', (data) => {
        isUpdating = true;
        console.log('HP updated')
        // Find the slide by character name instead of sectionId
        hpChanger(data);

        setTimeout(() => { isUpdating = false; }, 100);
    });
    // Listen for new combatants from other clients
    socket.on('player-new-combatant', (data) => {
        isUpdating = true;
        console.log("New combatant:", data);
        loadCampaignCharacters(campaignName);
        setTimeout(() => {isUpdating = false;}, 1000);
    });
    socket.on('player-character-remove', (data) =>{
        isUpdating = true;
        loadCampaignCharacters(campaignName);
        setTimeout(() => {isUpdating = false;}, 1000);
    })
    socket.on('player-initiative-change', (data) =>{
        isUpdating = true;
        loadCampaignCharacters(campaignName);
        setTimeout(() => {isUpdating = false;}, 1000);
    })
    socket.on('carousel-next', (data) =>{
        console.log(window.glideInstance); 
        nextinLine();
        console.log("Next up in player page.")      
    });
    await loadCampaignCharacters(campaignName);
});

function getURLParameter(name){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

async function loadCampaignCharacters(cName) {
    try{
        const response = await fetch(`/api/campaign/${encodeURIComponent(cName)}/ActiveInitiative`);
        const characters = await response.json();

        characters.sort((a, b) => parseInt(b.initiative) - parseInt(a.initiative));
        if (window.glideInstance){
            glideIndex = window.glideInstance.index
        }
        if(window.glideInstance){
            destroyGlideInstance();
        }
        characters.forEach(character => {
                const character_obj = {
                    id: sectcont++,
                    name: character.name,
                    ac: character.ac,
                    hp: character.hp,
                    initiative: parseInt(character.initiative),
                    combatantType: character.chrType
                };
                const glideTrack = document.querySelector('.glide__slides');                
                const isMe = character.name == selectedcharacterName;
                const newSlide = createCharacterSlide(character_obj, isMe);
                glideTrack.appendChild(newSlide);                
                });
    }catch(error){
        console.error('Error loading character file: ', error);
    }

    CreateGlideInstance();
    if(glideIndex){
        window.glideInstance.go(`=${glideIndex}`);
    }
    //ai import
    firstTIme=false
};

function nextinLine() {
    if (window.glideInstance) {
        window.glideInstance.go('>'); // Move to next slide
        window.glideInstance.update();
    }
}

function createCharacterSlide(character, itsMe) {
    const slide = document.createElement('li');
    slide.className = 'glide__slide';
    slide.id = `character-${character.id}`;
    if (itsMe) {
        slide.innerHTML = `
        <div class="Me-section">
            <div class="character-header">
                <div class="initiative-badge">Initiative: ${character.initiative}</div>
                <h3 class="character-name">${character.name}</h3>
            </div>
            <div class="character-stats">
                <div class="stat-group">
                    <label>AC</label>
                    <label id="AC-${character.id}">${character.ac}</label>
                </div>
                <div class="stat-group">
                    <label>HP</label>
                    <label id="HP-${character.id}">${character.hp}</label>
                </div>
            </div>
        </div>
    `;        
    }
    else if (character.combatantType == 'antagonist'){
    slide.innerHTML = `
        <div class="Enemy-section">
            <div class="character-header">
                <div class="initiative-badge">Initiative: ${character.initiative}</div>
                <h3 class="character-name">${character.name}</h3>
            </div>
        </div>
    `;
    }
    else if (character.combatantType == 'npc'){
    slide.innerHTML = `
        <div class="Neutral-section">
            <div class="character-header">
                <div class="initiative-badge">Initiative: ${character.initiative}</div>
                <h3 class="character-name">${character.name}</h3>
            </div>
        </div>
    `;        
    }
    else if (character.combatantType == 'player'){
        slide.innerHTML = `
        <div class="Player-section">
            <div class="character-header">
                <div class="initiative-badge">Initiative: ${character.initiative}</div>
                <h3 class="character-name">${character.name}</h3>
            </div>
            <div class="character-stats">
                <div class="stat-group">
                    <label>AC</label>
                    <label id="AC-${character.id}">${character.ac}</label>
                </div>
                <div class="stat-group">
                    <label>HP</label>
                    <label id="HP-${character.id}">${character.hp}</label>
                </div>
            </div>
        </div>
    `;
    }
    return slide;
}
function sortCharactersByInitiative() {
    characters.sort((a, b) => b.initiative - a.initiative);
}

function hpChanger(data){
    const slides = document.querySelectorAll('.glide__slide');
    slides.forEach(slide => {
        const characterNameElement = slide.querySelector('.character-name');
        if (characterNameElement && characterNameElement.textContent === data.name) {
            // Find the HP label and update it
            const hpLabel = slide.querySelector('[id^="HP-"]'); // Selects any element with ID starting with "HP-"
            if (hpLabel) {
                hpLabel.textContent = data.newHP;
                console.log(`Updated HP for ${data.name} to ${data.newHP}`);
            }
        }
    });
}

function DamageHP(button){

    const theID = button.parentElement.id;
    const theSection = button.parentElement;
    const thehpBox = theSection.querySelector("input#HP");
    const themodifierBox = theSection.querySelector("input#modifier");
    const combatantHP = parseInt(thehpBox.value || parseInt(thehpBox.placeholder));
    const theDamage = parseInt(themodifierBox.value || 0);

    newHPs = combatantHP - theDamage;
    thehpBox.value = newHPs;
    if (isUpdating) return;
    socket.emit('hp-change', {
        campaign: campaignName,
        sectionId: theID,
        newHP: newHPs
    });
}

function HealHP(button){

    const theID = button.parentElement.id;
    const theSection = button.parentElement;
    const thehpBox = theSection.querySelector("input#HP");
    const themodifierBox = theSection.querySelector("input#modifier");
    const combatantHP = parseInt(thehpBox.value || parseInt(thehpBox.placeholder));
    const theHeal = parseInt(themodifierBox.value || 0);

    newHPs = combatantHP + theHeal;
    thehpBox.value = newHPs;
    if(isUpdating) return;
    socket.emit('hp-change', {
        campaign: campaignName,
        sectionId: theID,
        newHP: newHPs
    });
}

function CreateGlideInstance(){
    window.glideInstance = new Glide('.glide', {
        type: 'carousel',
        startAt: 0,
        perView: 5,
        gap: 5,
        focusAt: 'center',
        breakpoints: {
            1024: {
                perView: 2
            },
            600: {
                perView: 1
            }
        }
    }).mount();
}

function destroyGlideInstance(){
    if (window.glideInstance) {
        window.glideInstance.destroy();
    }
    clearTrack();
}

function updateGlideInstance(){
    window.glideInstance.update();
}

function clearTrack(){
    const glideTrack = document.querySelector('.glide__slides');
    glideTrack.innerHTML = '';
    
    // Reset counter
    sectcont = 0;
}