
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
const diceRollerInput = document.getElementById("dice-roller-input-id");
const diceRollerOutput = document.getElementById("diceResult");
const socket = io();
let campaignName = null;
let isUpdating = false;
let firstTIme = true;

let sectcont = 0;
let combatName = "";
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
        characterAdder(data.name, data.ac, data.hp, data.initiative, data.chrType);
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
            characterAdder(character.name,character.ac, character.hp, character.initiative, character.chrType);
        });
    } catch(error){
        console.error('Error loading character file: ', error);
    }
    firstTIme=false
};

resetInitiativebutton.addEventListener("click", ()=>{
    socket.emit('reset-initiative', campaignName);
})

addPlayerSectionButton.addEventListener("click", () => {
    cName = cmtName.value;
    cAC = acField.value;
    cHP = hpField.value;
    cINIT = parseInt(initField.value);
    characterAdder(cName,cAC,cHP,cINIT,"player");
})

addAntagonistSectionButton.addEventListener("click", () => {
    cName = cmtName.value;
    cAC = acField.value;
    cHP = hpField.value;
    cINIT = parseInt(initField.value);
    characterAdder(cName,cAC,cHP,cINIT,"antagonist");
})

addNPCSectionButton.addEventListener("click", () => {
    cName = cmtName.value;
    cAC = acField.value;
    cHP = hpField.value;
    cINIT = parseInt(initField.value);
    characterAdder(cName,cAC,cHP,cINIT,"npc");
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
}
function characterAdder(combatName, combatAC, combatHP, combatINIT,combatantType){
    relativeInitiative = 0;
    const existingSections = container.querySelectorAll('.Player-section');
    sectcont++;
    const NewSection = document.createElement("div");
    const combatantText = document.createElement("span");
    const ACBox = document.createElement("input");
    const HPBox = document.createElement("input");
    const hpModifier = document.createElement("input")
    const damagebutton = document.createElement("button");
    const healbutton = document.createElement("button");
    const removeChrbutton = document.createElement("button");
    const HPText = document.createElement("span");
    const ACText = document.createElement("span");
    const initText = document.createElement("input");
    const ModifierText = document.createElement("span");
    const spacer = document.createElement("div");

    const cornerTL = document.createElement("div");
    const cornerTR = document.createElement("div");
    const cornerBL = document.createElement("div");
    const cornerBR = document.createElement("div");

    if (combatantType == "player"){
        NewSection.classList.add("Player-section");
    }else if(combatantType == "antagonist"){
        NewSection.classList.add("Enemy-section");
    }else if (combatantType == "npc"){
        NewSection.classList.add("Neutral-section");
    }
    NewSection.id = sectcont;
    combatantText.textContent = `${combatName}`;
    combatantText.classList.add("Playersection-text");
    HPText.classList.add("section-text");
    ACText.classList.add("section-text");
    initText.classList.add("initstattext-box");
    ModifierText.classList.add("modifier-text");

    HPText.textContent = "HP:";
    ACText.textContent = "AC:";
    initText.placeholder = combatINIT;
    ModifierText.textContent = "Apply Healing/Damage:"

    ACBox.type = "text";
    ACBox.placeholder = combatAC || "AC";
    ACBox.classList.add("acstattext-box");
    ACBox.id = "AC";

    HPBox.type = "text";
    HPBox.placeholder = combatHP || "HP";
    HPBox.classList.add("hpstattext-box");
    HPBox.id = "HP"

    hpModifier.type = "text";
    hpModifier.placeholder = 0;
    hpModifier.classList.add("healdamstattext-box");
    hpModifier.id = "modifier";

    damagebutton.textContent = "-";
    damagebutton.classList.add("damage-button"); 
    damagebutton.id = "dmgbtn";

    healbutton.textContent = "+";
    healbutton.classList.add("heal-button"); 
    healbutton.id = "hlbtn";

    removeChrbutton.textContent = "Remove";
    removeChrbutton.classList.add("removecharacterbutton");
    removeChrbutton.id = "rmvBtn";

    // Configure spacer to push button to the right
    spacer.classList.add("spacer");
    spacer.style.flexGrow = "1";

    cornerTL.classList.add("corner-decoration", "corner-tl");
    cornerTR.classList.add("corner-decoration", "corner-tr");
    cornerBL.classList.add("corner-decoration", "corner-bl");
    cornerBR.classList.add("corner-decoration", "corner-br");

    NewSection.appendChild(initText);
    NewSection.appendChild(combatantText);
    NewSection.appendChild(spacer);
    NewSection.appendChild(ACText);
    NewSection.appendChild(ACBox);
    NewSection.appendChild(HPText);
    NewSection.appendChild(HPBox);
    NewSection.appendChild(ModifierText);
    NewSection.appendChild(hpModifier);
    NewSection.appendChild(healbutton);
    NewSection.appendChild(damagebutton);
    NewSection.appendChild(removeChrbutton);

    NewSection.appendChild(cornerTL);
    NewSection.appendChild(cornerTR);
    NewSection.appendChild(cornerBL);
    NewSection.appendChild(cornerBR);

    placeFinder(existingSections,combatINIT, NewSection);
    if(isUpdating || firstTIme){
        return;
    }
    socket.emit('new-combatant', {
        campaign: campaignName,
        name: combatName,
        ac:combatAC, 
        hp:combatHP, 
        initiative:combatINIT,    
        chrType: combatantType       
    });
}

diceRollerButton.addEventListener("click", () => {
        try {
            const diceNotation = diceRollerInput.value.trim();
            const roll = new rpgDiceRoller.DiceRoll(diceNotation);
            
            diceRollerOutput.textContent = `Result: ${roll.total} (${roll.output})`;
            diceRollerOutput.style.color = '#4CAF50';
            
        } catch (error) {
            diceRollerOutput.textContent = `Error: Invalid dice notation`;
            diceRollerOutput.style.color = '#f44336';
        }
})

container.addEventListener("click", (event) => {
    if (event.target.classList.contains("damage-button")) {
        DamageHP(event.target);
    }
});
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
function placeFinder(theSections, combatantINIT,NewSect){
    let insertpos = null;
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
}

function DamageHP(button){

    const theID = button.parentElement.id;
    const theSection = button.parentElement;
    const thehpBox = theSection.querySelector("input#HP");
    const themodifierBox = theSection.querySelector("input#modifier");
    const combatantHP = parseInt(thehpBox.value || parseInt(thehpBox.placeholder));
    const theDamage = parseInt(themodifierBox.value || 0);
    const combatAC = theSection.querySelector("input#AC").placeholder || section.querySelector("input#AC").value;
    const combatName = theSection.querySelector(".Playersection-text").textContent;
    const combatINIT = theSection.querySelector("input.initstattext-box").value || theSection.querySelector("input.initstattext-box").placeholder;
    if (theSection.classList.contains('Player-section')){
        combatantType = "player";
    }else if(theSection.classList.contains('Enemy-section')){
        combatantType = "antagonist"
    }else if(theSection.classList.contains('Neutral-section')){
        combatantType = "npc"
    }
    newHPs = combatantHP - theDamage;
    thehpBox.value = newHPs;
    if (isUpdating) return;
    socket.emit('hp-change', {
        campaign: campaignName,
        name: combatName,
        ac:combatAC, 
        newHP: newHPs,
        hp: newHPs,
        initiative:combatINIT,
        sectionId: theID,
        chrType: combatantType 
    });
}
container.addEventListener("click", (event) => {
    if (event.target.classList.contains("heal-button")) {
        HealHP(event.target);
    }
});
function HealHP(button){

    const theID = button.parentElement.id;
    const theSection = button.parentElement;
    const thehpBox = theSection.querySelector("input#HP");
    const themodifierBox = theSection.querySelector("input#modifier");
    const combatantHP = parseInt(thehpBox.value || parseInt(thehpBox.placeholder));
    const combatAC = theSection.querySelector("input#AC").placeholder || section.querySelector("input#AC").value;
    const combatName = theSection.querySelector(".Playersection-text").textContent;
    const combatINIT = theSection.querySelector("input.initstattext-box").value || theSection.querySelector("input.initstattext-box").placeholder;
    const theHeal = parseInt(themodifierBox.value || 0);
    if (theSection.classList.contains('Player-section')){
        combatantType = "player";
    }else if(theSection.classList.contains('Enemy-section')){
        combatantType = "antagonist"
    }else if(theSection.classList.contains('Neutral-section')){
        combatantType = "npc"
    }
    newHPs = combatantHP + theHeal;
    thehpBox.value = newHPs;
    if(isUpdating) return;
    socket.emit('hp-change', {
        campaign: campaignName,
        name: combatName,
        ac:combatAC, 
        initiative:combatINIT, 
        sectionId: theID,
        newHP: newHPs,
        hp: newHPs,
        chrType: combatantType 
    });
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
    
});