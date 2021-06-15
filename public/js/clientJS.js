var resourceJson =[];
var playerData = {};
var adminOverheadDisplayed = 0;
var productData = {};
var ingData = [];

async function getResources(){
    const resourceResponse = await fetch('../resources');
    resourceJson = await resourceResponse.json();

    let resourceSelection = document.getElementById('productSelect');
    resourceJson.forEach((resource) => {
        let opt = document.createElement("option");
        opt.innerHTML = resource.name;
        opt.value = resource.db_letter;
        resourceSelection.appendChild(opt);
    });

    //console.log(resourceJson);
}

async function getPlayerData(playerName){
    playerNameToJson = {name:playerName};
    const playerDataResponse = await fetch('/playerData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerNameToJson),
    });
    playerData = await playerDataResponse.json();
    await console.log(playerData);

}

function removeAllChild(parentDOM){
    while (parentDOM.firstChild) {
    parentDOM.removeChild(parentDOM.lastChild);
  }
}

function addIngredientDiv(parentDOM, prodData ){
    ingData = [];
    prodData.ingredients.forEach((ingredient, i) => {
        let ingDataElement = {};
        console.log(ingredient);
        let ingDiv = document.createElement('div');

        let ingInputSourceCost = document.createElement("input");
        ingInputSourceCost.title = "sourceCost";
        ingInputSourceCost.id = `sourceCost${ingredient.resource.db_letter}`;
        ingInputSourceCost.type = "number";
        ingInputSourceCost.name = "ingCost";
        ingInputSourceCost.required = true;
        ingDataElement.id = ingredient.resource.db_letter;

        let imageHTML = `<img class="iconInline" src= "/images/${ingredient.resource.name}.png" />`;

        let title = document.createElement('label');
        title.for = `sourceCost${ingredient.resource.db_letter}`;
        title.innerHTML = `${ingredient.resource.name} x ${ingredient.amount}${imageHTML}`;
        ingDataElement.name = ingredient.resource.name;
        ingDataElement.amount = ingredient.amount;


        let ingInputTitle = document.createElement('p');
        ingInputTitle.innerHTML = 'Sourcing cost per unit';


        ingDiv.appendChild(title);
        ingDiv.appendChild(ingInputTitle);
        ingDiv.appendChild(ingInputSourceCost);

        parentDOM.appendChild(ingDiv);
        //parentDOM.appendChild(document.createElement("BR"));


        ingData.push(ingDataElement);
    });
    const calculateButton = document.createElement('button');
    calculateButton.id = 'calculateProfitButton';
    calculateButton.textContent = 'Calculate Profit';
    calculateButton.className = 'button';
    parentDOM.appendChild(calculateButton);
}


// document.getElementById("submitName").onclick = async function() {
//     /*
//     Currently disabled getting user information to avoid spamming sim companies
//     servers.
//     */
//     //await getPlayerData(document.getElementById("playerName").value);
//     //adminOverheadDisplayed = parseFloat((playerData.adminOverhead - 1) * 100).toFixed(3);
//     //document.getElementById("adminOverhead").value = adminOverheadDisplayed;
//     //document.getElementById("productionSpeed").value = playerData.productionModifier;
//
// }

document.getElementById("selectProduct").onclick = function() {
    sel = document.getElementById('productSelect');
    inputForm = document.getElementById('infoFromUser');
    inputForm.hidden = false;
    ingredientsDiv = document.getElementById('ingredientsDiv');
    ingredientsDiv.hidden = false;

    productData = {
        productID : 0,
        ingredients : [],
        productJson : [],
    }
    //console.log(sel.value);
    productData.productID = sel.value;
    resourceJson.forEach((item) => {
        if(item.db_letter == productData.productID){
            productData.productJson = item;
            productData.ingredients = item.ingredients;
            productData.baseSalary = item.baseSalary;
            productData.producedPerHour = item.producedPerHour;
            productData.transportNeeded = item.transportation;
            //console.log(ingredients);
            //console.log(ingredients.length);
        }
    });
    const ingListDiv = document.getElementById("ingredientList");

    const productSelectForm = document.getElementById('productForm');
    if (document.getElementById('imageDiv')){
        document.getElementById('imageDiv').remove();
    }
    const imageDiv = document.createElement('div');
    imageDiv.className = 'iconInline';
    imageDiv.id = 'imageDiv';
    const image = document.createElement('img');
    image.src = `/images/${productData.productJson.name}.png`;

    imageDiv.appendChild(image)
    productSelectForm.append(imageDiv);

    removeAllChild(ingListDiv);
    addIngredientDiv(ingListDiv,productData);
    setUpCalcButton();

}

function setUpCalcButton(){
    button = document.getElementById('calculateProfitButton');
    button.onclick = function() {

        let sellWhere = document.getElementsByName('sellWhereButton');
        //console.log(sellWhere[1].checked);
        let tempSellPrice = 0;
        let tempTransCost = document.getElementById('transCost').value;
        let tempBuildingLevel = 1;
        let tempProduction = document.getElementById('productionSpeed').value;
        let tempAdminCost = document.getElementById('adminOverhead').value;
        let tempBaseSalary = productData.baseSalary;
        let tempTransportNeeded = productData.transportNeeded;
        let robotBoolean = document.getElementById('robots').checked;
        let totalIngCost = 0;

        ingData.forEach((ing, i) => {
            ing.sourceCost = document.getElementById(`sourceCost${ing.id}`).value;
            totalIngCost += ing.sourceCost*ing.amount;
        });

        tempSellPrice = document.getElementById('sellPrice').value;
        tempBuildingLevel = document.getElementById('buildingLevel').value;

        let unitsPerHour = productData.producedPerHour * (1+(tempProduction/100));
        if(robotBoolean){
            var workerCost = tempBaseSalary*0.97/unitsPerHour;
        }
        else {
            var workerCost = tempBaseSalary/unitsPerHour;
        }
        console.log(`Worker Cost: ${workerCost}`);
        let laborCost = workerCost * (1+tempAdminCost/100);
        let profitPerUnit;

        console.log(totalIngCost+laborCost);

        if(sellWhere[0].checked){
            profitPerUnit = tempSellPrice - (tempTransportNeeded*tempTransCost/2) -
                totalIngCost - laborCost;
        }
        else if (sellWhere[1].checked){
            profitPerUnit = tempSellPrice * 0.97 - (tempTransportNeeded*tempTransCost) -
                totalIngCost - laborCost;
        }
        else{
            profitPerUnit = tempSellPrice * 0.97 - (tempTransportNeeded*tempTransCost) -
                totalIngCost - laborCost;
        }

        let profitPerHour = profitPerUnit * unitsPerHour*tempBuildingLevel;
        let profitPerDay = profitPerHour *24;

        if (tempSellPrice == 0){
            let totalUnitCost = totalIngCost+laborCost;
            displaySourcingCost(totalUnitCost);
        }else{
            displayProfit(profitPerUnit,profitPerHour,profitPerDay);
        }


    }
}

function displayProfit(profUnit,profHour,profDay){
    profitDisplayDiv = document.getElementById('profitDisplayDiv');
    removeAllChild(profitDisplayDiv);

    const profitPerUnitText = document.createElement('p');
    profitPerUnitText.id = 'profitPerUnitID';
    profitPerUnitText.textContent = `Profit per unit: $${profUnit.toFixed(3)}`;
    const profitPerHourText = document.createElement('p');
    profitPerHourText.id = 'profitPerHourID';
    profitPerHourText.textContent = `Profit per hour: $${profHour.toFixed(2)}`;
    const profitPerDayText = document.createElement('p');
    profitPerDayText.id = 'profitPerDayID';
    profitPerDayText.textContent = `Profit per day: $${profDay.toFixed(2)}`;

    profitDisplayDiv.appendChild(profitPerUnitText);
    profitDisplayDiv.appendChild(profitPerHourText);
    profitDisplayDiv.appendChild(profitPerDayText);
}

function displaySourcingCost(costPerUnit){
    profitDisplayDiv = document.getElementById('profitDisplayDiv');
    removeAllChild(profitDisplayDiv);

    const sourcingCostUnit = document.createElement('p');
    sourcingCostUnit.id = 'sourcingCostPerUnit';
    sourcingCostUnit.textContent = `Unit Sourcing Cost: $${costPerUnit.toFixed(3)}`;

    profitDisplayDiv.appendChild(sourcingCostUnit);
}
