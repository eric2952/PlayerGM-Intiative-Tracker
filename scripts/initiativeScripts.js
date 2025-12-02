
const addPlayerSectionButton = document.getElementById("addCombatantbtn");
const addAntagonistSectionButton = document.getElementById("addAntagonistbtn");
const addNPCSectionButton = document.getElementById("addNPCbtn");
const nextUpbutton = document.getElementById("NextUp");
const resetInitiativebutton = document.getElementById("ResetInitiative");
const container = document.getElementById("combatant");
const container2 = document.getElementById("savedInitiatives")
const cmtName = document.getElementById("combatantName");
const acField = document.getElementById("combatantAC");
const hpField = document.getElementById("combatantHP");
const initField = document.getElementById("combatantInit");
const diceRollerButton = document.getElementById("dicebutton");
const diceRollerInput1 = document.getElementById("dice-roller-input-id1");
const diceRollerInput2 = document.getElementById("dice-roller-input-id2");
const diceRollerInput3 = document.getElementById("dice-roller-input-id3");
const diceRollerOutput = document.getElementById("diceResult");
const diceToggle = document.getElementById('diceToggle');
const diceMenu = document.getElementById('diceDetails');
const combatantToggle = document.getElementById('addCombatantMenu');
const combatantMenu = document.getElementById('CombatantDetails');

const socket = io();
let campaignName = null;
let isUpdating = false;
let firstTIme = true;

let combatantType;
let isDiceMenuCollapsed = false;
let isCombatantMenuCollapsed = false;

let sectcont = 0;
let combatName = "";

// Variables to track dice application mode
let diceApplicationMode = null;
let lastDiceResult = 0;

window.addEventListener('DOMContentLoaded', async () => {
    campaignName = getURLParameter('campaign');
    firstTIme = true
    // Join campaign room when page loads
    if (campaignName) {
        socket.emit('join-campaign', campaignName);
    }
    // Listen for HP updates from other clients
    socket.on('hp-change', (data) => {
        isUpdating = true;
        const section = document.getElementById(data.sectionId);
        console.log('HP updated')
        if (section) {
            const hpBox = section.querySelector('input#HP');
            hpBox.value = data.newHP;
        }

        setTimeout(() => { isUpdating = false; }, 100);
    });
    // Listen for new combatants from other clients
    socket.on('player', (data) => {
        isUpdating = true;
        console.log("Player:", data);
        characterAdder(data.name, data.ac, data.hp, data.initiative, data.chrType, data.hp,"existing");
        setTimeout(() => {isUpdating = false;}, 1000);
    });
    socket.on('next-up', (data) =>{
        isUpdating = true
        console.log("Next combatant", data);
        nextinLine();
        setTimeout(() => {isUpdating = false;}, 1000);
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

        characters.forEach(character => {
            characterAdder(character.name,character.ac, character.hp, character.initiative, character.chrType, character.unmodifiedhp, character.imagePath,"existing");
        });
    } catch(error){
        console.error('Error loading character file: ', error);
    }
    firstTIme=false
};

resetInitiativebutton.addEventListener("click", ()=>{
    socket.emit('reset-initiative', campaignName);
})

addPlayerSectionButton.addEventListener("click", async () => {
    cName = cmtName.value;
    cAC = acField.value;
    cHP = hpField.value;
    cINIT = parseInt(initField.value);
    const imageFile = document.getElementById('imageUpload').files[0];
    let imagePath = null;
    
    // Upload image if selected
    if (imageFile) {
        imagePath = await uploadImage(imageFile, cName);
    }
    characterAdder(cName,cAC,cHP,cINIT,"player",cHP,imagePath,"new");
})

addAntagonistSectionButton.addEventListener("click", async () => {
    cName = cmtName.value;
    cAC = acField.value;
    cHP = hpField.value;
    cINIT = parseInt(initField.value);
    const imageFile = document.getElementById('imageUpload').files[0];
    let imagePath = null;
    
    // Upload image if selected
    if (imageFile) {
        imagePath = await uploadImage(imageFile, cName);
    }
    characterAdder(cName,cAC,cHP,cINIT,"antagonist",cHP, imagePath,"new");
})

addNPCSectionButton.addEventListener("click", async () => {
    cName = cmtName.value;
    cAC = acField.value;
    cHP = hpField.value;
    cINIT = parseInt(initField.value);
    const imageFile = document.getElementById('imageUpload').files[0];
    let imagePath = null;
    
    // Upload image if selected
    if (imageFile) {
        imagePath = await uploadImage(imageFile, cName);
    }
    characterAdder(cName,cAC,cHP,cINIT,"npc",cHP, imagePath,"new");
})

nextUpbutton.addEventListener("click", () => {
    nextinLine();
})

function nextinLine(){
    //const existingSections = container.querySelectorAll('.Player-section');
    const firstSection = container.firstElementChild;
    if(firstSection){        
        container.appendChild(firstSection);
        if(isUpdating) return;
        socket.emit('next-up',{
            campaign: campaignName
        });
        socket.emit('move-carousel-next', {campaign: campaignName });
    }
    returnContainerPosition();
}

// Add event listener for initiative changes
container.addEventListener("change", (event) => {
    if (event.target.classList.contains("initstattext-box") && event.target.placeholder !== event.target.value) {
        const section = event.target.parentElement;
        const newInitiative = parseInt(event.target.value) || 0;
        sectionRelocate(section.id,newInitiative);
        const combatAC = section.querySelector("input#AC").value || section.querySelector("input#AC").placeholder;
        const combatHP = section.querySelector("input#HP").value || section.querySelector("input#HP").placeholder;
        const combatName = section.querySelector(".Playersection-text").textContent;
        if (section.classList.contains('Player-section')){
            combatantType = "player";
        }else if(section.classList.contains('Enemy-section')){
            combatantType = "antagonist"
        }else if(section.classList.contains('Neutral-section')){
            combatantType = "npc"
        }
        socket.emit('initiative-change', {
            campaign: campaignName,
            name: combatName,
            ac:combatAC, 
            hp:combatHP, 
            initiative:newInitiative, 
            sectionId: section.id,
            chrType: combatantType 
        });
    }
});
function sectionRelocate(theSectionID, theNewInitiative){
        const section = document.getElementById(theSectionID);
        // Remove section from current position
        section.remove();
        
        // Find correct position and insert
        const allSections = container.querySelectorAll('.Player-section, .Enemy-section, .Neutral-section');
        placeFinder(allSections, theNewInitiative, section);
        
}
function placeFinder(theSections, combatantINIT,NewSect, isNew){
    let insertpos = null;
    if(isNew == "new"){
        for (let section of theSections){
            const existingInitInput = section.querySelector("input.initstattext-box");
            const existingInitiative = parseInt(existingInitInput.value) || parseInt(existingInitInput.placeholder);
            if(existingInitiative<combatantINIT){
                insertpos = section;
                break;
            }
        }
        if (insertpos){
            container.insertBefore(NewSect,insertpos);
        } else{
            container.appendChild(NewSect);
        }
    } else{
        container.appendChild(NewSect);
    }
}

container.addEventListener("click", (event) => {
    if (event.target.classList.contains("removecharacterbutton")) {
        RemoveCharacter(event.target);
    }
});

function RemoveCharacter(button){
    const theSection = button.parentElement;
    const combatName = theSection.querySelector(".Playersection-text").textContent;
    theSection.remove();
    socket.emit('character-remove', {
        campaign: campaignName,
        name: combatName,
    });    
}


Sortable.create(container, {
    animation: 150,
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    filter: '.removeCharacterbutton',
    preventOnFilter: false,
    handle: null, // null means entire element is draggable

    onEnd: function(evt){
        returnContainerPosition();
    }
    
});

async function uploadImage(imageFile, characterName) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('characterName', characterName);
    
    try {
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            return result.imagePath;
        } else {
            console.error('Failed to upload image');
            return null;
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}
async function returnContainerPosition(){
    const theSections = container.querySelectorAll('.Player-section, .Enemy-section, .Neutral-section');
    let sectionNames = [];
    for (let searchIndex = 0; searchIndex < theSections.length; searchIndex++){
        const section = theSections[searchIndex];
        sectionNames.push(section.querySelector(".Playersection-text").textContent);
    }
    socket.emit('sort-Initiative',{
        theNames: sectionNames,
        theCampaign: campaignName,
    })
}