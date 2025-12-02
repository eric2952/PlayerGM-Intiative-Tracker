diceRollerButton.addEventListener("click", () => {
        try {
            const diceNotation1 = diceRollerInput1.value.trim();
            const diceNotation2 = diceRollerInput2.value.trim();
            const diceNotation3 = "+"+diceRollerInput3.value.trim();
            // Build the dice notation string
            let diceNotation = diceNotation1 + "d" + diceNotation2;
            if(diceNotation3 !== "+") {
                diceNotation +=  diceNotation3;
            }

            const roll = new rpgDiceRoller.DiceRoll(diceNotation);

            diceRollerOutput.textContent = `Result: ${roll.total} (${roll.output})`;
            diceRollerOutput.style.color = '#4CAF50';
            showDiceApplicationButtons(roll.total);
            
        } catch (error) {
            diceRollerOutput.textContent = `Error: Invalid dice notation`;
            diceRollerOutput.style.color = '#f44336';
        }
})

function showDiceApplicationButtons(result) {
    lastDiceResult = result;
    document.getElementById('diceDamageButton').style.display = 'inline-block';
    document.getElementById('diceHealButton').style.display = 'inline-block';
}

function hideDiceApplicationButtons() {
    document.getElementById('diceDamageButton').style.display = 'none';
    document.getElementById('diceHealButton').style.display = 'none';
    diceApplicationMode = null;
    document.body.style.cursor = 'default';
}

document.getElementById('diceDamageButton').addEventListener('click', function() {
    diceApplicationMode = 'damage';
    document.body.style.cursor = 'url("scripts/icons/attack_32x32.png"), pointer';
});

document.getElementById('diceHealButton').addEventListener('click', function() {
    diceApplicationMode = 'heal';
    document.body.style.cursor = 'url("./scripts/icons/healing_32x32.png"), pointer';
});

document.addEventListener('click', function(event) {
    if (diceApplicationMode && 
        !event.target.closest('#diceDetails') && 
        !event.target.closest('.Player-section, .Enemy-section, .Neutral-section')) {
        hideDiceApplicationButtons();
    }
});

document.addEventListener('click', function(event) {
    const theSection = event.target.closest('.Player-section, .Enemy-section, .Neutral-section');
    if (diceApplicationMode && theSection) {
        const theID = theSection.id;
        const combatAC = theSection.querySelector("input#AC").placeholder || section.querySelector("input#AC").value;
        const combatName = theSection.querySelector(".Playersection-text").textContent;
        const combatINIT = theSection.querySelector("input.initstattext-box").value || theSection.querySelector("input.initstattext-box").placeholder;
        const combatantHPInput = theSection.querySelector("input#HP");
        if (theSection.classList.contains('Player-section')){
            combatantType = "player";
        }else if(theSection.classList.contains('Enemy-section')){
            combatantType = "antagonist"
        }else if(theSection.classList.contains('Neutral-section')){
            combatantType = "npc"
        }
        if (combatantHPInput) {
            let currentHP = parseInt(combatantHPInput.value) || parseInt(theSection.querySelector("input#HP").placeholder);
            
            if (diceApplicationMode === 'damage') {
                currentHP -= lastDiceResult;
            } else if (diceApplicationMode === 'heal') {
                currentHP += lastDiceResult;
            }
            currentHP = Math.max(0, currentHP)
            combatantHPInput.value = currentHP; 
            hideDiceApplicationButtons();
        }
        newHPs = parseInt(combatantHPInput.value)
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
});

document.getElementById('diceToggle').addEventListener('click', function(){
    const diceDetails = document.getElementById('diceDetails');
    const diceInputGroup = diceDetails.querySelector('.dice-roller-input-group');
    const diceResultDiv = diceInputGroup.nextElementSibling; // The div with diceResult and buttons

    if (isDiceMenuCollapsed){
        diceInputGroup.style.display = 'block';
        diceResultDiv.style.display = 'block';
        isDiceMenuCollapsed = false;
    }else{
        diceInputGroup.style.display = 'none';
        diceResultDiv.style.display = 'none';
        isDiceMenuCollapsed = true;        
    }
})

document.getElementById('addCombatantMenu').addEventListener('click', function(){
    const combatantDetails = document.getElementById('CombatantDetails');


    if (isCombatantMenuCollapsed){
        combatantDetails.style.display = 'block';
        isCombatantMenuCollapsed = false;
    }else{
        combatantDetails.style.display = 'none';
        isCombatantMenuCollapsed = true;        
    }
})