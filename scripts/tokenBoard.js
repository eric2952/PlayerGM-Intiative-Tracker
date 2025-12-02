//const socket = io();
let campaignName = null;
const opportunityTracker = document.getElementById("opportunityTracker");
const complicationTracker = document.getElementById("complicationTracker");

window.addEventListener('DOMContentLoaded', async () => {
    campaignName = getURLParameter('campaign');
    firstTIme = true;
    for (let i = 0; i <10; i++){
        const oppToken = document.createElement('button');
        const compToken = document. createElement('button');
        oppToken.className = 'opptoken-button';
        compToken.className = 'comptoken-button';
        oppToken.id = `opportunity-${i}`;
        compToken.id = `complication-${i}`;
        oppToken.onclick = function(){
            toggleToken(this);
        };
        compToken.onclick = function(){
            toggleToken(this);
        };
        opportunityTracker.appendChild(oppToken);
        complicationTracker.appendChild(compToken);
    }

});

function toggleToken(token){
    if(token.classList.contains('active')){
        token.classList.remove('active');
    } else{
        token.classList.add('active')
    }
}

function getURLParameter(name){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};