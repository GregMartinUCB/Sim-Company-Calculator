const express = require('express');
const DataStore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, ()=>{console.log('Server Started');});
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

const resourceDatabase = new DataStore('resourceDatabase.db');

const resourceBaseURL = `https://www.simcompanies.com/api/v3/en/encyclopedia/resources/0/`;
const imagesAPIURL = `https://d1fxy698ilbz6u.cloudfront.net/static/`;

/* Removes encyclopedia database entries that are a result of not being able to
    find the resource. getEncyclopediaData loops through 120 items and there
    is a gap in there where some resource numbers do not have a page.*/

const cleanResourceDatabase = () => {
    resourceDatabase.loadDatabase();
    resourceDatabase.remove({message:"Could not find such resource"},{multi:true},
        function(err,numRemoved){
                console.log(`Removed ${numRemoved} erroneous entries.`);
    });
    resourceDatabase.persistence.compactDatafile();
}

/********************************
Setup
*********************************/

function setup(){
    cleanResourceDatabase();
    //refreshEncycData();
}

setup();


/********************************
Routes
*********************************/

app.get('/resources',(request, response) => {
    resourceDatabase.find({}, (err, data)=> {
        if (err){
            response.end();
            return;
        }

        const dataForClient = [];
        data.forEach(( item ) => {
        //    console.log(item);
            tempJson = {
                name:item.name,
                image:item.image,
                transportation:item.transportation,
                db_letter:item.db_letter,
                ingredients:item.producedFrom,
                producedPerHour:item.producedAnHour,
                baseSalary:item.baseSalary,
            };
            dataForClient.push(tempJson);
        });
        dataForClient.push({imagesBaseURL:imagesAPIURL})
        //console.log(dataForClient);

        response.json(dataForClient);
    });
});

/*
Recieves Post request for company name, then returns relevant company data
*/
app.post('/playerData', async (request, response) => {
    //Disabled to avoid spamming server.
    //console.log(request.body);
    //await response.setHeader('Content-Type', 'application/json');
    //const playerJsonToSend = await getPlayerData(request.body.name);
    //await response.json(playerJsonToSend);
    response.end();
});

/********************************
Custom functions for handling data
*********************************/

function alphabetSortResources (resource){
    
}

async function getPlayerData(companyName){
    const correctCompanyName = companyName.split(' ').join('-');
    const companyURL = `https://www.simcompanies.com/api/v2/players-by-company/${correctCompanyName}/`
    const playerDataResponse = await fetch(companyURL);
    const playerDataJson = await playerDataResponse.json();
    //console.log(playerDataJson);

    let playerDataJsonToSend = {};
    playerDataJsonToSend.adminOverhead = playerDataJson.player.administrationOverhead;
    playerDataJsonToSend.productionModifier = playerDataJson.player.productionModifier;
    //console.log(playerDataJsonToSend);

    return playerDataJsonToSend;
}

/*
This function will update the encyclopedia resource entries. Only needs to be
updated if the resources base information changes.
*/
function refreshEncycData(){
    currentResource = 1;
    const encycInterval = setInterval( () => {
        getEncyclopediaData(currentResource)
        if (currentResource >= 120){
            cleanResourceDatabase();
            clearInterval(encycInterval);
            return;
        }
    }, 2000);
}

const getEncyclopediaData = async (resourceNumber) => {
    const encycResponse = await fetch(resourceBaseURL+resourceNumber.toString());
    const encycJson = await encycResponse.json();
    try{
        const resourceName = await encycJson.name;
        console.log(resourceName);
        resourceDatabase.loadDatabase();
        resourceDatabase.update({name:resourceName},encycJson,{ upsert: true }, (err, num) => {

        });
        resourceDatabase.persistence.compactDatafile();
    }
    catch(err){
        console.log(err);
    }
    currentResource += 1
    if (currentResource >= 120){
        currentResource = 1;
        cleanResourceDatabase();
    }
};



/*
Get data from the marketplace-
add later
*/
