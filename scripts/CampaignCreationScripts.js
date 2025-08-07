const addPlayerButton = document.getElementById("addCharacterbtn");
const createCampaignbtn = document.getElementById("createCampaignbtn")
const container = document.getElementById("Character");
const chrName = document.getElementById("characterName");
const chrAC = document.getElementById("characterAC");
const chrHP = document.getElementById("characterHP");
const campaignName = document.getElementById("campaignName");


let sectcont = 0;


addPlayerButton.addEventListener("click", async () =>{
    sectcont++;
    Charactername = chrName.value;
    CharacterAC = chrAC.value;
    CharacterHP = chrHP.value;

    const imageFile = document.getElementById('imageUpload').files[0];
    let imagePath = null;
    
    // Upload image if selected
    if (imageFile) {
        imagePath = await uploadImage(imageFile, Charactername);
    }

    const NewSection = document.createElement("div");
    const playerText = document.createElement("span");
    const playerHP = document.createElement("span");
    const playerAC = document.createElement("span");
    const spacer = document.createElement("div");
    const removeCharacterbutton = document.createElement("button");

    const cornerTL = document.createElement("div");
    const cornerTR = document.createElement("div");
    const cornerBL = document.createElement("div");
    const cornerBR = document.createElement("div");

    NewSection.classList.add("Player-section");
    NewSection.id = sectcont;

    if (imagePath) {
        NewSection.setAttribute('data-image-path', imagePath);
    }
    
    playerText.textContent = `${Charactername}`;
    playerText.classList.add("section-text");

    playerHP.textContent = `HP: ${CharacterHP}`;
    playerAC.textContent = `AC: ${CharacterAC}`;
    playerHP.classList.add("section-text");
    playerAC.classList.add("section-text");

    removeCharacterbutton.textContent = "Remove Character";
    removeCharacterbutton.classList.add("removeCharacterbutton");
    removeCharacterbutton.id = "removeCharacterbutton";

    cornerTL.classList.add("corner-decoration", "corner-tl");
    cornerTR.classList.add("corner-decoration", "corner-tr");
    cornerBL.classList.add("corner-decoration", "corner-bl");
    cornerBR.classList.add("corner-decoration", "corner-br");

    if (imagePath) {
        const imagePreview = document.createElement("img");
        imagePreview.src = imagePath;
        imagePreview.style.width = "50px";
        imagePreview.style.height = "50px";
        imagePreview.style.objectFit = "cover";
        imagePreview.style.borderRadius = "5px";
        imagePreview.classList.add("character-image-preview");
        NewSection.appendChild(imagePreview);
    }

    // Configure spacer to push button to the right
    spacer.classList.add("spacer");
    spacer.style.flexGrow = "1";

    NewSection.appendChild(playerText);
    //NewSection.appendChild(spacer);
    NewSection.appendChild(playerAC);
    NewSection.appendChild(playerHP);
    NewSection.appendChild(removeCharacterbutton)

    NewSection.appendChild(cornerTL);
    NewSection.appendChild(cornerTR);
    NewSection.appendChild(cornerBL);
    NewSection.appendChild(cornerBR);

    container.appendChild(NewSection);
})

container.addEventListener("click", (event) => {
    if (event.target.classList.contains("removeCharacterbutton")){
        RemoveCharacter(event.target);
    }
})

function RemoveCharacter(button){
    const theSection = button.parentElement;
    theSection.remove();
}

if (typeof Sortable === 'undefined') {
    console.error('Sortable.js not loaded!');
} else {
    console.log('Sortable.js is loaded');
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

createCampaignbtn.addEventListener("click", async () =>{
    const campaignNameVal = campaignName.value.trim()
    const characters = [];
    const characterSections = document.querySelectorAll('.Player-section');

    characterSections.forEach(section=>{
        const name = section.querySelector('.section-text').textContent;
        const theAC = section.children[2].textContent.replace('AC: ', '');
        const theHP = section.children[3].textContent.replace('HP: ', '');
        const imagePath = section.getAttribute('data-image-path') || null;

        characters.push({name, ac: theAC, hp: theHP, chrType: "player", imagePath: imagePath});        
    });
    if (!campaignNameVal){
        alert('Please enter a campaign name.');
        return;
    }
    try {
        const response = await fetch('/api/create-campaign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                campaignName: campaignNameVal,
                characters: characters
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Campaign created successfully!');
            // Optionally clear the form
            campaignName.value = '';
            container.innerHTML = '';
        } else {
            alert(result.error || 'Failed to create campaign response error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to create campaign top error');
    }    
}
);

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