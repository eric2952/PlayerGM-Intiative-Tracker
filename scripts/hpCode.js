container.addEventListener("click", (event) => {
    if (event.target.classList.contains("damage-button")) {
        DamageHP(event.target);
    }
});

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
};

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
    const unmodifiedHP = parseInt(theSection.querySelector("#unmodifiedHP").textContent.replace('/',''));

    if (theSection.classList.contains('Player-section')){
        combatantType = "player";
    }else if(theSection.classList.contains('Enemy-section')){
        combatantType = "antagonist"
    }else if(theSection.classList.contains('Neutral-section')){
        combatantType = "npc"
    }
    newHPs = combatantHP + theHeal;
    if(newHPs > unmodifiedHP){
        newHPs = unmodifiedHP;
    }
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