function characterAdder(combatName, combatAC, combatHP, combatINIT,combatantType,unmodifiedhp, imagePath,neworNot){
    relativeInitiative = 0;
    const existingSections = container.querySelectorAll('.Player-section, .Enemy-section, .Neutral-section');
    sectcont++;
    const NewSection = document.createElement("div");
    const combatantText = document.createElement("character-span");
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
    const unModHP = document.createElement("span");

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
    ModifierText.textContent = "Apply Healing/Damage:";
    unModHP.textContent = `/${unmodifiedhp}`;
    unModHP.id = "unmodifiedHP";

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

    cornerTL.classList.add("corner-decoration", "corner-tl");
    cornerTR.classList.add("corner-decoration", "corner-tr");
    cornerBL.classList.add("corner-decoration", "corner-bl");
    cornerBR.classList.add("corner-decoration", "corner-br");

    if (imagePath) {
        NewSection.setAttribute('data-image-path', imagePath);
        const imagePreview = document.createElement("img");
        imagePreview.src = imagePath;
        imagePreview.style.width = "50px";
        imagePreview.style.height = "50px";
        imagePreview.style.objectFit = "cover";
        imagePreview.style.borderRadius = "5px";
        imagePreview.classList.add("character-image-preview");
        imagePreview.style.margin = "5px";
        NewSection.appendChild(imagePreview);
    }

    NewSection.appendChild(initText);
    NewSection.appendChild(combatantText);
    NewSection.appendChild(ACText);
    NewSection.appendChild(ACBox);
    NewSection.appendChild(HPText);
    NewSection.appendChild(HPBox);
    NewSection.appendChild(unModHP);
    NewSection.appendChild(ModifierText);
    NewSection.appendChild(hpModifier);
    NewSection.appendChild(healbutton);
    NewSection.appendChild(damagebutton);
    NewSection.appendChild(removeChrbutton);

    NewSection.appendChild(cornerTL);
    NewSection.appendChild(cornerTR);
    NewSection.appendChild(cornerBL);
    NewSection.appendChild(cornerBR);

    placeFinder(existingSections,combatINIT, NewSection,neworNot);
    if(isUpdating || firstTIme){
        return;
    }
    socket.emit('new-combatant', {
        campaign: campaignName,
        name: combatName,
        ac:combatAC, 
        hp:combatHP, 
        initiative:combatINIT,    
        chrType: combatantType,
        unmodifiedhp: combatHP,
        imagePath: imagePath       
    });
}