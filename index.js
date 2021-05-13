const express = require('express');
const path = require('path');
const DataStore = require('nedb');
const fetch = require('node-fetch');
const fs = require('fs');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const dir = path.join(__dirname, 'public');
const date = new Date();

app.listen(port, () => {
    console.log('Server Started');
});
app.use(express.static(dir));
app.use(express.json({
    limit: '1mb'
}));
app.set('view engine', 'ejs');

//URLs
const resourceBaseURL = `https://www.simcompanies.com/api/v3/en/encyclopedia/resources/0/`;
const imagesAPIURL = `https://d1fxy698ilbz6u.cloudfront.net/static/`;
const buildingsAPIURL = `https://www.simcompanies.com/api/v2/encyclopedia/buildings/`;

//Database inits
const resourceDatabase = new DataStore('resourceDatabase.db');
const marketData = new DataStore('marketDatabase.db');
marketData.ensureIndex({fieldName: "id",unique:true});
marketData.persistence.compactDatafile();
const buildingData = new DataStore('buildingData.db');

buildingData.persistence.compactDatafile();

//const resourceBaseURL = `https://www.simcompanies.com/api/v3/en/encyclopedia/resources/0/`;
//const imagesAPIURL = `https://d1fxy698ilbz6u.cloudfront.net/static/`;

/* Removes encyclopedia database entries that are a result of not being able to
    find the resource. getEncyclopediaData loops through 120 items and there
    is a gap in there where some resource numbers do not have a page.*/

const cleanResourceDatabase = () => {
    resourceDatabase.loadDatabase();
    resourceDatabase.remove({
            message: "Could not find such resource"
        }, {
            multi: true
        },
        function(err, numRemoved) {
            console.log(`Removed ${numRemoved} erroneous entries.`);
        });
    resourceDatabase.persistence.compactDatafile();
}

/********************************
Setup
*********************************/

function setup() {
    cleanResourceDatabase();
    //refreshEncycData();
    //updateAllResourceMarketData();
    //getAllBuildings()
}

setup();


/********************************
Routes
*********************************/

app.get("/", (req, res) => {
    res.render('calc');
});

app.get('/buildings', (req, res) =>{
    buildingData.find({}, (err, data) =>{
        if (err){
            response.end();
            return;
        }
        res.json(data);
    })
})

app.get('/resources', (request, response) => {
    resourceDatabase.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }

        let dataForClient = [];
        data.forEach((item) => {
            //console.log(item);
            tempJson = {
                name: item.name,
                imageURL: imagesAPIURL + item.image,
                transportation: item.transportation,
                db_letter: item.db_letter,
                ingredients: item.producedFrom,
                producedPerHour: item.producedAnHour,
                baseSalary: item.baseSalary,
                producedAt: {
                    buildingLetter: item.producedAt.db_letter,
                    buildingImg: imagesAPIURL + item.producedAt.image,
                    buildingName: item.producedAt.name,
                    buildingCost: item.producedAt.cost
                }
            };
            dataForClient.push(tempJson);
            //console.log(tempJson);
            //console.log(tempJson.ingredients);
        });

        dataForClient = sortResourcesAlphabetically(dataForClient);
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

app.get('/VIPlanner', (req, res) =>{
    res.render('VIPlanner');
})

app.get('/VIHI', (req, res) =>{
    res.render('VIHI');
})

app.use(function(req, res, next) {
    res.status(404).render('404');
});

/********************************
Custom functions for handling data
*********************************/

function sortResourcesAlphabetically(jsonArrayOfResources) {
    jsonArrayOfResources.sort((a, b) => {
        return compareStrings(a.name, b.name)
    });
    return jsonArrayOfResources
}

function compareStrings(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return (a < b) ? -1 : (a > b) ? 1 : 0;
}

async function getPlayerData(companyName) {
    const correctCompanyName = companyName.split(' ').join('-');
    const companyURL = `https://www.simcompanies.com/api/v2/players-by-company/${correctCompanyName}/`
    const playerDataResponse = await fetch(companyURL);
    const playerDataJson = await playerDataResponse.json();

    let playerDataJsonToSend = {};
    playerDataJsonToSend.adminOverhead = playerDataJson.player.administrationOverhead;
    playerDataJsonToSend.productionModifier = playerDataJson.player.productionModifier;

    return playerDataJsonToSend;
}

/*
This function will update the encyclopedia resource entries. Only needs to be
updated if the resources base information changes.
*/
function refreshEncycData() {
    currentResource = 1;
    const encycInterval = setInterval(() => {
        getEncyclopediaData(currentResource)
        if (currentResource >= 120) {
            cleanResourceDatabase();
            clearInterval(encycInterval);
            return;
        }
    }, 2000);
}

const getEncyclopediaData = async (resourceNumber) => {
    const encycResponse = await fetch(resourceBaseURL + resourceNumber.toString());
    const encycJson = await encycResponse.json();

    //downloading image and saving as a file. Gives path to add to database.
    const resourcePNGPath = await downloadReasourcePNG(encycJson.image, encycJson.name);
    try {
        const resourceName = await encycJson.name;
        console.log(resourceName);
        resourceDatabase.loadDatabase();
        resourceDatabase.update({
                name: resourceName
            },
            encycJson, {
                upsert: true
            }, (err, num) => {

            });
        resourceDatabase.persistence.compactDatafile();
    } catch (err) {
        console.log(err);
    }
    currentResource += 1
    if (currentResource >= 120) {
        currentResource = 1;
        cleanResourceDatabase();
    }
};

const downloadReasourcePNG = async (partialImageURL, name) => {
    const imageResponse = await fetch(imagesAPIURL + partialImageURL);
    const buffer = await imageResponse.buffer();
    fs.writeFile(`./public/images/${name}.png`, buffer, () =>
        console.log(`Downloaded ${name}`));
    return `./public/images/${name}.png`
}

async function updateMarketData(resource){
    //tickerAPIURL = `https://www.simcompanies.com/api/v1/market-ticker/${date.toISOString()}`
    //console.log(tickerAPIURL);
    exchangeResourceAPIURLBase = 'https://www.simcompanies.com/api/v2/market/'
    const testExchangeResponse = await fetch(exchangeResourceAPIURLBase + resource);
    const testExchangeJson = await testExchangeResponse.json();
    console.log(testExchangeJson);
    if(testExchangeJson == null){
        return
    }else {
        marketData.loadDatabase();
        marketData.insert(testExchangeJson);
        marketData.persistence.compactDatafile();
    }

}

function updateAllResourceMarketData(){
    marketIntervalCounter = 1;
    const marketDataInterval = setInterval(() => {
        updateMarketData(1);
        marketIntervalCounter += 1;
        if(marketIntervalCounter > 115){
            marketIntervalCounter = 1;
        }

    },20000)
}

const getBuildingData = async (buildingLetter) => {
    const buildingResponse = await fetch(buildingsAPIURL + buildingLetter);
    const buildingJSON = await buildingResponse.json();

    if(buildingJSON.message){ return }
    //console.log(buildingLetter);
    //console.log(buildingJSON);
    return buildingJSON

}

function getAllBuildings(){
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    letterCount = 0;
    const buildingInterval = setInterval(()=>{
        try{
            getBuildingData(letters[letterCount])
            .then((building)=>{
                if (building){
                    buildingData.loadDatabase();
                    buildingData.insert(building);
                    buildingData.persistence.compactDatafile();
                }
                console.log(building);
                letterCount += 1;
            })
        }
        catch(err){
            console.log(err);
            return
        }
    }, 10000)

}

/*
Get data from the marketplace-
add later
*/
