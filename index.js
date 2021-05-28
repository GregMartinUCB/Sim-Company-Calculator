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
const resourceBaseURL = `https://www.simcompanies.com/api/v3/en/encyclopedia/resources/`;
const economyState = 0;
const imagesAPIURL = `https://d1fxy698ilbz6u.cloudfront.net/static/`;
const buildingsAPIURL = `https://www.simcompanies.com/api/v2/encyclopedia/buildings/`;

//Database inits
const resourceDatabase = new DataStore('resourceDatabase.db');
const resourceDatabaseRecession = new DataStore('resourceDatabaseRecession.db');
const resourceDatabaseBoom = new DataStore('resourceDatabaseBoom.db');
const marketData = new DataStore('marketDatabase.db');
marketData.ensureIndex({fieldName: "id",unique:true, expireAfterSeconds: 1814400});
marketData.persistence.compactDatafile();
const buildingData = new DataStore('buildingData.db');
buildingData.persistence.compactDatafile();

//const resourceBaseURL = `https://www.simcompanies.com/api/v3/en/encyclopedia/resources/0/`;
//const imagesAPIURL = `https://d1fxy698ilbz6u.cloudfront.net/static/`;

/* Removes encyclopedia database entries that are a result of not being able to
    find the resource. getEncyclopediaData loops through 120 items and there
    is a gap in there where some resource numbers do not have a page.*/

const cleanResourceDatabase = () => {
    var databasetoUse = null;
    switch (economyState) {
        case 0:
            databasetoUse = resourceDatabaseRecession;
            break;
        case 1:
            databasetoUse = resourceDatabase;
            break;
        case 2:
            databasetoUse = resourceDatabaseBoom;
    }
    databasetoUse.loadDatabase();
    databasetoUse.remove({
            message: "Could not find such resource"
        }, {
            multi: true
        },
        function(err, numRemoved) {
            console.log(`Removed ${numRemoved} erroneous entries.`);
        });
    databasetoUse.persistence.compactDatafile();
}

/********************************
Setup
*********************************/

function setup() {
    //Functions that are run manually to update databases. Not needed to run
    //again unless game changes.
    //refreshEncycData();
    //getAllBuildings()
    //cleanResourceDatabase();

    //updateAllResourceMarketData();

}

setup();


/********************************
Routes
*********************************/

app.get("/", (req, res) => {
    res.render('simulator');
});

app.get('/buildings', (req, res) =>{
    buildingData.loadDatabase();
    buildingData.find({}, (err, data) =>{
        if (err){
            response.end();
            return;
        }
        data = sortResourcesAlphabetically(data);
        res.json(data);
    })
})


app.get('/resources', (request, response) => {
    var databasetoUse = null;
    switch (economyState) {
        case 0:
            databasetoUse = resourceDatabaseRecession;
            break;
        case 1:
            databasetoUse = resourceDatabase;
            break;
        case 2:
            databasetoUse = resourceDatabaseBoom;
            break;
        default:
            databasetoUse = resourceDatabase;

    }
    databasetoUse.loadDatabase();
    databasetoUse.find({}, (err, data) => {
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
    databasetoUse.persistence.compactDatafile();
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

app.get('/profitCalc', (req,res) =>{
    res.render('calc');
})

app.get('/market',async (req, res) =>{
    const exchangeData = await getResourceExhangeData(2)
    await console.log('Right before');
    const splitDataResponse = await splitExchangeDataByQuality(exchangeData);

})

app.use(function(req, res, next) {
    res.status(404).render('404');
});

/********************************
Custom functions for handling data
*********************************/
function extractLowestExchangePost(){

}

async function splitExchangeDataByQuality(exchangeData){
    const qualities = [...new Set(exchangeData.map(item => item.quality))];
}

async function getResourceExhangeData(resource){
    marketData.loadDatabase();
    var resourceExchangeData = await marketData.find({kind:resource}, function(err, data){
        if(err){reject(err)}
        console.log(true);
        return data
    })
    await marketData.persistence.compactDatafile();
    console.log(resourceExchangeData);
    return resourceExchangeData

}

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
    const encycResponse = await fetch(resourceBaseURL+ `${economyState}/` +
                                                    resourceNumber.toString());
    const encycJson = await encycResponse.json();

    var databasetoUse = null;
    switch (economyState) {
        case 0:
            databasetoUse = resourceDatabaseRecession;
            break;
        case 1:
            databasetoUse = resourceDatabase;
            break;
        case 2:
            databasetoUse = resourceDatabaseBoom;
    }

    //downloading image and saving as a file. Gives path to add to database.
    const resourcePNGPath = await downloadReasourcePNG(encycJson.image, encycJson.name);
    try {
        const resourceName = await encycJson.name;
        console.log(resourceName);
        databasetoUse.loadDatabase();
        databasetoUse.update({
                name: resourceName
            },
            encycJson, {
                upsert: true
            }, (err, num) => {

            });
        databasetoUse.persistence.compactDatafile();
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

//Grabs the posts on the exchange for that resource indicated by a numbers
//number corresponds to db_letter in api.
async function updateMarketData(resourceNumber){
    exchangeResourceAPIURLBase = 'https://www.simcompanies.com/api/v2/market/'
    const testExchangeResponse = await fetch(exchangeResourceAPIURLBase + resourceNumber);
    const testExchangeJson = await testExchangeResponse.json();
    if(testExchangeJson == null){
        return
    }else {
        testExchangeJson.forEach((exchangeEntry, i) => {
            var dataToInsert = JSON.parse(JSON.stringify(exchangeEntry));
            marketData.insert(dataToInsert,function(err){
                if(err){console.log('Duplicate Entry');}
            });
        });
        console.log(`Resource ${resourceNumber} market data updated.`);
    }
}

//Working on this fuction to store market data.
function updateAllResourceMarketData(){
    marketData.loadDatabase();
    resourceDatabase.loadDatabase();
    var marketIntervalCounter = 0;
    getResourceData()
    .then((resourceList)=>{
        resourceDatabase.persistence.compactDatafile();
        const marketDataInterval = setInterval(() => {
            updateMarketData(resourceList[marketIntervalCounter].db_letter);
            marketIntervalCounter += 1;
            if(marketIntervalCounter >= resourceList.length){
                marketIntervalCounter = 0;
            }
        },10000)
    })
    .catch((err)=> console.error(err));
    marketData.persistence.compactDatafile();
}

const getBuildingData = async (buildingLetter) => {
    const buildingResponse = await fetch(buildingsAPIURL + buildingLetter);
    const buildingJSON = await buildingResponse.json();
    if(buildingJSON.message){ return }
    noSpaceName = buildingJSON.name.replace(/\s/g, '');
    const buildingImgPath = await getBuildingImg(buildingJSON.image,noSpaceName);
    buildingJSON.imgPath = buildingImgPath;
    return buildingJSON

}

function getAllBuildings(){
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
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

const getBuildingImg = async (partialImageURL, name) => {
    const buildingResponse = await fetch(imagesAPIURL + partialImageURL);
    const buffer = await buildingResponse.buffer();
    fs.writeFile(`./public/images/${name}.png`, buffer, () =>
        console.log(`Downloaded ${name}`));
    return `./public/images/${name}.png`
}

/*
Get data from the marketplace-
add later
*/
