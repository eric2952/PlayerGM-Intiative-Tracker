const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const http = require('http');
const socketIo = require('socket.io');

// Middleware
app.use(express.json());
app.use(express.static('.')); // Serve your HTML/CSS/JS files

// Ensure Campaigns directory exists
const campaignsDir = path.join(__dirname, 'Campaigns');
if (!fs.existsSync(campaignsDir)) {
    fs.mkdirSync(campaignsDir);
}

// Create HTTP server and Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});



// Handle socket connections
io.on('connection', (socket) => {

    console.log('User connected:', socket.id);
    
    // Join a campaign room
    socket.on('join-campaign', (campaignName) => {
        socket.join(campaignName);
        console.log(`User ${socket.id} joined campaign: ${campaignName}`);
        gatherPlayers(campaignName);
    });
    
    // Handle HP changes
    socket.on('hp-change', (data) => {
        socket.to(data.campaign).emit('hp-change', data);
        socket.to(data.campaign).emit('player-hp-change', data)
        console.log(`HP Change from ${data.campaign}`);
        console.log(`HP Change from ${socket.id}`);
        const campaignPath = path.join(campaignsDir, data.campaign);
        const initFile = path.join(campaignPath, 'ActiveInitiative/InitiativeOrder.txt');
        addToInitiativeFile(data, initFile);
    });
    
    // Handle initiative changes
    socket.on('initiative-change', (data) => {
        socket.to(data.campaign).emit('initiative-updated', data);
        const campaignPath = path.join(campaignsDir, data.campaign);
        const initFile = path.join(campaignPath, 'ActiveInitiative/InitiativeOrder.txt');
        console.log(`There's an initiative change`)
        addToInitiativeFile(data, initFile);
        socket.to(data.campaign).emit('player-initiative-change', data);
    });
    
    // Handle new combatant added
    socket.on('new-combatant', (data) => {
        console.log("New combatant:", data);
        const campaignPath = path.join(campaignsDir, data.campaign);
        const initFile = path.join(campaignPath, 'ActiveInitiative/InitiativeOrder.txt');
        addToInitiativeFile(data, initFile);
        socket.to(data.campaign).emit('new-combatant', data);
        socket.to(data.campaign).emit('player-new-combatant', data);
    });
    
    socket.on('next-up',(data) => {
        console.log("Next in line", data);
        socket.to(data.campaign).emit('next-up', data);
        socket.to(data.campaign).emit('carousel-next');
    });
    socket.on('character-remove', (data) =>{
        console.log(`Character removed: ${data.name}`);
        const campaignPath = path.join(campaignsDir, data.campaign);
        const initFile = path.join(campaignPath, 'ActiveInitiative/InitiativeOrder.txt');
        RemoveCharacter(data, initFile);
        socket.to(data.campaign).emit('player-character-remove', data);
    })
    socket.on('reset-initiative', (campaignName) =>{
        ResetTheInitiative(campaignName);
        socket.to(campaignName).emit('player-reset-initiative');
    })
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

});

// API endpoint to create campaign
app.post('/api/create-campaign', (req, res) => {
    try {
        const { campaignName, characters } = req.body;
        
        // Create campaign directory
        const campaignPath = path.join(campaignsDir, campaignName);
        const initiativePath = path.join(campaignsDir, campaignName, "ActiveInitiative");
        
        if (fs.existsSync(campaignPath)) {
            return res.status(400).json({ error: 'Campaign already exists' });
        }
        
        fs.mkdirSync(campaignPath);
        fs.mkdirSync(initiativePath);
        
        // Create Players.txt with character data
        const playersFile = path.join(campaignPath, 'Players.txt');
        const initiativeFile = path.join(initiativePath, 'InitiativeOrder.txt');
        let playerData = '';
        let playerData2 = '';
        
        characters.forEach(character => {
            playerData += `${character.name}; ${character.ac}; ${character.hp}\n`;
            playerData2 += `${character.name}; ${character.ac}; ${character.hp}; 0; ${character.chrType}\n`;
        });
        
        fs.writeFileSync(playersFile, playerData);
        fs.writeFileSync(initiativeFile, playerData2);
        
        res.json({ success: true, message: 'Campaign created successfully' });
        
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(500).json({ error: 'Failed to create campaign' });
    }
});

// API endpoint to get all campaigns
app.get('/api/campaigns', (req, res) => {
    try {
        const campaigns = fs.readdirSync(campaignsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read campaigns' });
    }
});

// Serve home page as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Home.html'));
});

// Serve campaign creation page
app.get('/campaign-creation', (req, res) => {
    res.sendFile(path.join(__dirname, 'campaignCreation.html'));
});

app.get('/api/campaign/:campaignName/PlayerList', (req, res) => {
    try {
        const campaignName = req.params.campaignName;
        const campaignPath = path.join(campaignsDir, campaignName);
        const playersFile = path.join(campaignPath, 'ActiveInitiative/InitiativeOrder.txt');
        
        if (!fs.existsSync(playersFile)) {
            return res.json([]); // Return empty array if file doesn't exist
        }
        
        const fileContent = fs.readFileSync(playersFile, 'utf8');
        const lines = fileContent.trim().split('\n').filter(line => line.trim());
        
        const characters = lines.map(line => {
            const parts = line.trim().split('; ');
            return {
                name: parts[0] || '',
                ac: parts[1] || '',
                hp: parts[2] || '',
                initiative: parts[3] || '',
                chrType: parts[4] || ''
            };
        });
        
        res.json(characters);
    } catch (error) {
        console.error('Error reading characters:', error);
        res.status(500).json({ error: 'Failed to read characters' });
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access from network: http://192.168.50.32:${PORT}`);
});

app.get('/api/campaign/:campaignName/ActiveInitiative', (req, res) => {
    try {
        const campaignName = req.params.campaignName;
        const campaignPath = path.join(campaignsDir, campaignName);
        const playersFile = path.join(campaignPath, 'ActiveInitiative/InitiativeOrder.txt');
        
        if (!fs.existsSync(playersFile)) {
            return res.json([]); // Return empty array if file doesn't exist
        }
        
        const fileContent = fs.readFileSync(playersFile, 'utf8');
        const lines = fileContent.trim().split('\n').filter(line => line.trim());
        
        const characters = lines.map(line => {
            const parts = line.trim().split('; ');
            return {
                name: parts[0] || '',
                ac: parts[1] || '',
                hp: parts[2] || '',
                initiative: parts[3] || '',
                chrType: parts[4] || ''
            };
        });
        
        res.json(characters);
    } catch (error) {
        console.error('Error reading characters:', error);
        res.status(500).json({ error: 'Failed to read characters' });
    }
});

async function gatherPlayers(theCampaignName) {
        const response = await fetch(`http://localhost:3000/api/campaign/${encodeURIComponent(theCampaignName)}/ActiveInitiative`);
        const characters =  await response.json();
        characters.forEach(character => {
            console.log(`Character: ${character.name} found.`);
        });    
        return characters;
}

function ResetTheInitiative(campaignName){
        const campaignPath = path.join(campaignsDir, campaignName);
        const playersFile = path.join(campaignPath, 'Players.txt');
        const initiativeFile = path.join(campaignPath, 'ActiveInitiative', 'InitiativeOrder.txt');
        
        // Read Players.txt
        const playersContent = fs.readFileSync(playersFile, 'utf8');
        const lines = playersContent.trim().split('\n').filter(line => line.trim());
        fs.writeFileSync(initiativeFile,'','utf-8');
        // Append 0 for initiative to each line
        const initiativeLines = lines.map(line => {
            const parts = line.split('; ');
            // Insert 0 as initiative (4th position: name; ac; hp; initiative; chrType)
            return `${parts[0]}; ${parts[1]}; ${parts[2]}; 0; player`;
        });
        
        // Write to InitiativeOrder.txt
        const initiativeContent = initiativeLines.join('\n') + '\n';
        fs.writeFileSync(initiativeFile, initiativeContent);
}

function addToInitiativeFile(thedata, theFile) {
    const {campaign, name, ac, hp, initiative, chrType} = thedata;
    const fileContent = fs.readFileSync(theFile, 'utf8');
    const lines = fileContent.trim().split('\n').filter(line => line.trim());
    var foundit = false;
    const updatedLines = lines.map(line => {
        const parts = line.trim().split('; ');
        const characterName = parts[0];
        console.log(`${characterName} and ${name}`)
        if (characterName === name){
            console.log(`new initiative: ${initiative} for ${name}`);
            foundit = true;
            return `${name}; ${ac}; ${hp}; ${initiative}; ${chrType}`;
        }
        return line;
    });
    if (!foundit) {
        console.log(`new initiative: ${initiative} for not found character`)
        updatedLines.push(`${name}; ${ac}; ${hp}; ${initiative}; ${chrType}`);
    }
    updatedLines.sort((a, b) => {
        //array value of the initiative value
        const aInitiative = parseInt(a.split('; ')[3]) || 0;
        const bInitiative = parseInt(b.split('; ')[3]) || 0;
        return bInitiative - aInitiative; // Descending order (highest first)
    });
    const updatedContent = updatedLines.join('\n')+ '\n';
    fs.writeFileSync(theFile, updatedContent);

}
function RemoveCharacter(thedata, theFile){
    const {campaign, name, ac, hp, initiative, chrType} = thedata;
    const fileContent = fs.readFileSync(theFile, 'utf8');
    const lines = fileContent.trim().split('\n').filter(line => line.trim());
    // Filter out the line that matches the character name
    const updatedLines = lines.filter(line => {
        const parts = line.trim().split('; ');
        const characterName = parts[0];
        console.log(`Checking ${characterName} against ${name}`);
        
        // Return false to remove the line, true to keep it
        return characterName !== name;
    });
    
    // Write the updated content back to the file
    const updatedContent = updatedLines.join('\n') + '\n';
    fs.writeFileSync(theFile, updatedContent);
}