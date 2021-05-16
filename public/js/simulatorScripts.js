var resourceJson =[];
var buildingsJson =[];
var buildingSlots =0;
var map = [];
var productionSpeed = 0;
const abundanceBuildings = ['M','Q','O'];


async function getResources(){
    const resourceResponse = await fetch('/resources');
    resourceJson = await resourceResponse.json();
    console.log(resourceJson);
    // let resourceSelection = document.getElementById('productSelect');
    // resourceJson.forEach((resource) => {
    //     let opt = document.createElement("option");
    //     opt.innerHTML = resource.name;
    //     opt.value = resource.db_letter;
    //     resourceSelection.appendChild(opt);
    // });

    //console.log(resourceJson);
}
async function getBuildings(){
    const buildingsResponse = await fetch('/buildings');
    buildingsJson = await buildingsResponse.json();
    console.log(buildingsJson);
    //console.log(resourceJson);
}

function delChildren(domElement){
    while (domElement.firstChild) {
        domElement.removeChild(domElement.firstChild);
    }
}

document.getElementById('createMap').onclick = function() {
    leftPanel = document.getElementById("leftContainer");
    rightPanel = document.getElementById("rightContainer");
    centerPanel = document.getElementById("centerContainer");
    leftPanel.hidden = false;
    rightPanel.hidden = false;
    centerPanel.hidden = false;

    productionSpeed = document.getElementById('productionSpeed').value;
    if(productionSpeed<0){productionSpeed = 0;}
    addBuildingSlots();

}

function addBuildingSlots(){
    buildingSlots = document.getElementById('buildingSlots').value;
    parentDom = document.getElementById('leftContainer');
    if(parentDom.firstChild){
        delChildren(parentDom);
    }
    for (var i = 0; i < buildingSlots; i++) {
        createBuildingDiv(parentDom,i);
    }
    submitBuildingButton = document.createElement('button');
    submitBuildingButton.id = "submitBuildings";
    submitBuildingButton.textContent = "Submit Buildings";
    submitBuildingButton.className = "button";
    submitBuildingButton.onclick = function () {
        submitBuildings();
    }
    parentDom.appendChild(submitBuildingButton);
}

function createBuildingDiv(parentDom, slotNumber){
    if (!parentDom){console.log('Missing Inputs'); return}
    buildingDiv = document.createElement('div');
    buildingDiv.id = `building${slotNumber}Div`
    buildingDiv.name = "buildingDiv";
    selectorBuildingLabel = document.createElement('label');
    selectorBuildingLabel.for = `building${slotNumber}`;
    selectorBuildingLabel.textContent = `Select Building:`;
    selectorBuilding = document.createElement('select');
    selectorBuilding.id = `building${slotNumber}select`;
    selectorBuilding.name = `buildings`;


    buildingsJson.forEach((building, i) => {
        if(building.category == 'production' || building.category == 'research'){
            opt = document.createElement("option");
            opt.innerHTML = building.name;
            opt.value = building.db_letter;
            selectorBuilding.appendChild(opt);
        }
    });

    selectButton = document.createElement('button');
    selectButton.className = 'button';
    selectButton.id = `building${slotNumber}submit`;
    selectButton.textContent = `Select Building`
    selectButton.onclick = function (){
        updateBuilding(slotNumber);
    };
    buildingDiv.appendChild(selectorBuildingLabel);
    buildingDiv.appendChild(selectorBuilding);
    buildingDiv.appendChild(selectButton);
    parentDom.appendChild(buildingDiv);
    parentDom.appendChild(document.createElement('hr'));

}

function updateBuilding(slotNumber){
     build = document.getElementById(`building${slotNumber}Div`);
     buildingSelector = document.getElementById(`building${slotNumber}select`)
     if(document.getElementById(`building${slotNumber}product`)){
         document.getElementById(`building${slotNumber}product`).remove();
         document.getElementById(`building${slotNumber}productLabel`).remove();
         document.getElementById(`building${slotNumber}Level`).remove();
         document.getElementById(`building${slotNumber}LevelLabel`).remove();
         try{
             document.getElementById(`building${slotNumber}abundance`).remove();
             document.getElementById(`building${slotNumber}abundanceLabel`).remove();
         }catch{

         }
     }
     productLabel = document.createElement('label');
     productLabel.id = `building${slotNumber}productLabel`;
     productLabel.for = `building${slotNumber}product`;
     productLabel.textContent = `Production:`;
     productSelector = document.createElement('select');
     productSelector.id = `building${slotNumber}product`;
     productSelector.name = "product";
     populateProductSelector(buildingSelector,productSelector,slotNumber);

     buildLevelLabel = document.createElement('label');
     buildLevelLabel.id = `building${slotNumber}LevelLabel`;
     buildLevelLabel.for = `building${slotNumber}Level`;
     buildLevelLabel.textContent = `Building Level:`;
     buildLevelInput = document.createElement('input');
     buildLevelInput.id = `building${slotNumber}Level`;
     buildLevelInput.type = 'number';
     buildLevelInput.required = true;
     buildLevelInput.name = "level";

     build.appendChild(productLabel);
     build.appendChild(productSelector);
     build.appendChild(buildLevelLabel);
     build.appendChild(buildLevelInput);
}

function populateProductSelector(buildingSelector, productSelector,slotNumber){
    buildingName = buildingSelector.value;
    const building = buildingsJson.find(build => build.db_letter == buildingName);
    building.doesProduce.forEach((possibleProduct, i) => {
        opt = document.createElement('option');
        opt.textContent = possibleProduct.name;
        opt.value = possibleProduct.db_letter;
        productSelector.appendChild(opt);
    });
    if(abundanceBuildings.find(abunBuild => abunBuild == building.db_letter)){
        abundanceInput = document.createElement('input');
        abundanceInput.id = `building${slotNumber}abundance`;
        abundanceInput.type = 'number';
        abundanceInput.required = true;
        abundanceInput.name = 'abundance';
        abundanceInputLabel = document.createElement('label');
        abundanceInputLabel.id = `building${slotNumber}abundanceLabel`;
        abundanceInputLabel.for = `building${slotNumber}abundance`;
        abundanceInputLabel.textContent = "Abundance:"
        parent = buildingSelector.parentNode;
        parent.appendChild(abundanceInputLabel);
        parent.appendChild(abundanceInput);
    }


}

function submitBuildings(){
    levelDoms = document.getElementsByName('level');
    abundanceDoms = document.getElementsByName('abundance');
    buildingDoms = document.getElementsByName('buildings');
    productDoms = document.getElementsByName('product');

    if(buildingDoms.length != productDoms.length){return}
    map = [];
    abundanceCount = 0;
    buildingDoms.forEach((buildingSlot, i) => {

        buildingJSON = buildingsJson.find(
                        build => build.db_letter == buildingSlot.value);
        productJSON = resourceJson.find(
                        resource => resource.db_letter == productDoms[i].value);
        if(abundanceBuildings.find(abunBuild => abunBuild == buildingJSON.db_letter)){
            console.log(abundanceDoms);
            if(abundanceDoms.length>1){

                abundance = abundanceDoms[abundanceCount].value;
                abundanceCount += 1;
            }
            else{
                abundance = abundanceDoms.value;
                abundanceDoms = null;
            }

        }else{
            abundance = undefined;
        }
        if (levelDoms[i].value < 1) {
            level = 1
        }
        else{
            level = Number(levelDoms[i].value);
        }
        build = createBuildSlotObject(buildingJSON,abundance,productJSON,level);
        map.push(build);
    });
    //console.log(map);
    createCenterPanel();
}

function createBuildSlotObject(buildJSON,abundance,product,level){

    building = {};
    building.level = level;
    building.producing = product;
    building.name = buildJSON.name;
    building.costUnits = buildJSON.costUnits;
    building.buildTime = buildJSON.hours;
    if(abundance){
        building.abundance = abundance;
        building.producedPerHour = product.producedPerHour *
                                        (1+(productionSpeed/100))*
                                        (Number(abundance)/100)*
                                        level;
    }else{
        building.producedPerHour = product.producedPerHour *
                                        (1+(productionSpeed/100))*
                                        level;
    }

    return building;
}

function createCenterPanel(){
    panel = document.getElementById("centerContainer");
    delChildren(panel);
    adminLabel = document.createElement('label');
    adminLabel.id = 'adminLabel';
    adminLabel.for = 'adminInput';
    adminLabel.textContent = 'Admin Overhead:';
    adminInput = document.createElement('input');
    adminInput.id = 'adminInput';
    adminInput.type = 'number';
    adminValue = calculateAdminValue();
    adminInput.value = (adminValue*100).toFixed(3);

    panel.appendChild(adminLabel);
    panel.appendChild(adminInput);

    panel.appendChild(document.createElement('hr'));
    uniqueProduced = reduceProducedList();
    uniqueIngredients = reducedIngredientList(uniqueProduced);

    // populateTotalProduced(panel,uniqueProduced);
    // panel.appendChild(document.createElement('hr'));
    // populateTotalConsumed(panel,uniqueIngredients);
    // panel.appendChild(document.createElement('hr'));
    populateNetProducts(panel,uniqueProduced,uniqueIngredients);

    submitPricesButton = document.createElement('button');
    submitPricesButton.id = "submitBuildings";
    submitPricesButton.textContent = "Submit Prices";
    submitPricesButton.className = "button";
    submitPricesButton.onclick = function () {
        createRightPanel();
    }

}

function createRightPanel(){
    //left off here.
}

function populateNetProducts(parentDom,uniqueProduced,uniqueIngredients){

    const [toBuy, toSell] = determineBuyandSell(uniqueProduced,uniqueIngredients);
    populateToSellTable(parentDom,toSell);
    populateToBuyTable(parentDom,toBuy);

}

function populateToBuyTable(parentDom, toBuy){
    toBuySection = document.createElement('h2');
    toBuySection.textContent = "Products to Buy:";
    parentDom.appendChild(toBuySection);

    toBuyTable = document.createElement('table');
    tableHead = document.createElement('tr');
    productNameCol = document.createElement('th');
    productNameCol.textContent = `Product`;
    tableHead.appendChild(productNameCol);

    perHourCol = document.createElement('th');
    perHourCol.textContent = `Buy Per Hour`;
    tableHead.appendChild(perHourCol);

    perDayCol = document.createElement('th');
    perDayCol.textContent = `Buy Per Day`;
    tableHead.appendChild(perDayCol);

    buyForCol = document.createElement('th');
    buyForCol.textContent = `Buy Price`;
    tableHead.appendChild(buyForCol);
    toBuyTable.appendChild(tableHead);

    toBuy.forEach((ingToBuy) => {
        row = document.createElement('tr');
        prodNameDom =  document.createElement('td');
        prodNameDom.textContent = `${ingToBuy.name}`;
        row.appendChild(prodNameDom);

        perHourDom =  document.createElement('td');
        perHourDom.textContent = `${ingToBuy.amountToBuy.toFixed(2)}`;
        row.appendChild(perHourDom);

        perDayDom =  document.createElement('td');
        perDayDom.textContent = `${(ingToBuy.amountToBuy*24).toFixed(2)}`;
        row.appendChild(perDayDom);

        buyFor =  document.createElement('td');
        currencySign = document.createElement('span');
        currencySign.textContent = '$';
        buyFor.appendChild(currencySign);
        input = document.createElement('input');
        input.type = 'number';
        input.id = `${ingToBuy.name}BuyPrice`;
        input.name = `buyPrice`;
        buyFor.appendChild(input);
        row.appendChild(buyFor);

        toBuyTable.appendChild(row);
    });
    parentDom.appendChild(toBuyTable);
}

function populateToSellTable(parentDom, toSell){
    titleToSellSection = document.createElement('h2');
    titleToSellSection.textContent = "Products to Sell:";
    parentDom.appendChild(titleToSellSection);

    toSellTable = document.createElement('table');
    tableHead = document.createElement('tr');
    productNameCol = document.createElement('th');
    productNameCol.textContent = `Product`;
    tableHead.appendChild(productNameCol);

    perHourCol = document.createElement('th');
    perHourCol.textContent = `Sell Per Hour`;
    tableHead.appendChild(perHourCol);

    perDayCol = document.createElement('th');
    perDayCol.textContent = `Sell Per Day`;
    tableHead.appendChild(perDayCol);

    sellForCol = document.createElement('th');
    sellForCol.textContent = `Sell Price`;
    tableHead.appendChild(sellForCol);
    toSellTable.appendChild(tableHead);

    toSell.forEach((sellable) => {
        row = document.createElement('tr');
        prodNameDom =  document.createElement('td');
        prodNameDom.textContent = `${sellable.name}`;
        row.appendChild(prodNameDom);

        perHourDom =  document.createElement('td');
        perHourDom.textContent = `${sellable.amountToSell.toFixed(2)}`;
        row.appendChild(perHourDom);

        perDayDom =  document.createElement('td');
        perDayDom.textContent = `${(sellable.amountToSell*24).toFixed(2)}`;
        row.appendChild(perDayDom);

        sellFor =  document.createElement('td');
        currencySign = document.createElement('span');
        currencySign.textContent = '$';
        sellFor.appendChild(currencySign);
        input = document.createElement('input');
        input.type = 'number';
        input.id = `${sellable.name}SellPrice`;
        input.name = `sellPrice`;
        sellFor.appendChild(input);
        row.appendChild(sellFor);

        toSellTable.appendChild(row);
    });
    parentDom.appendChild(toSellTable);
}

function determineBuyandSell(uniqueProduced,uniqueIngredients){
    toSell = [];
    toBuy = [];
    uniqueIngredients.forEach((ingredient) => {
        buy = {};
        sell = {};
        productThatisIngredient = uniqueProduced.find(product =>
            ingredient.db_letter == product.producing.db_letter);
        if(productThatisIngredient){
            net = productThatisIngredient.producedPerHour - ingredient.amountPerHour;
            if(net < 0){
                buy = {
                    name:ingredient.name,
                    db_letter:ingredient.db_letter,
                    amountToBuy: Math.abs(net),
                }
                toBuy.push(buy);
            }else{
                sell = {
                    name:ingredient.name,
                    db_letter:ingredient.db_letter,
                    amountToSell: net,
                }
                toSell.push(sell);
            }
        }
        else{
            console.log(ingredient);
            buy = {
                name:ingredient.name,
                db_letter:ingredient.db_letter,
                amountToBuy: ingredient.amountPerHour,
            }
            if(buy!={}){
                toBuy.push(buy);
            }
        }
    });
    uniqueProduced.forEach((product) => {
        alreadyIntoSell = toSell.find( sell =>
                    product.producing.db_letter == sell.db_letter)
        alreadyIntoBuy = toBuy.find( buy =>
                    product.producing.db_letter == buy.db_letter)
        if(!alreadyIntoSell && !alreadyIntoBuy){
            sell = {
                name:product.producing.name,
                db_letter:product.producing.db_letter,
                amountToSell: product.producedPerHour,
            }
            toSell.push(sell);
        }
    });

    return [toBuy, toSell]
}

function populateTotalProduced(parentDom, uniqueProduced){
    titleProducedSection = document.createElement('h2');
    titleProducedSection.textContent = "Produced:";
    parentDom.appendChild(titleProducedSection);

    producedTable = document.createElement('table');
    tableHead = document.createElement('tr');
    productNameCol = document.createElement('th');
    productNameCol.textContent = `Product`;
    tableHead.appendChild(productNameCol);

    perHourCol = document.createElement('th');
    perHourCol.textContent = `Produced Per Hour`;
    tableHead.appendChild(perHourCol);

    perDayCol = document.createElement('th');
    perDayCol.textContent = `Produced Per Day`;
    tableHead.appendChild(perDayCol);

    producedTable.appendChild(tableHead);

    uniqueProduced.forEach((product, i) => {
            row = document.createElement('tr');
            prodNameDom =  document.createElement('td');
            prodNameDom.textContent = `${product.producing.name}`;
            row.appendChild(prodNameDom);

            perHourDom =  document.createElement('td');
            perHourDom.textContent = `${product.producedPerHour.toFixed(2)}`;
            row.appendChild(perHourDom);

            perDayDom =  document.createElement('td');
            perDayDom.textContent = `${(product.producedPerHour*24).toFixed(2)}`;
            row.appendChild(perDayDom);
            producedTable.appendChild(row);
    });
    parentDom.appendChild(producedTable);

}

function populateTotalConsumed(parentDom, uniqueIngredients){
    titleConsumedSection = document.createElement('h2');
    titleConsumedSection.textContent = "Consumed:";
    parentDom.appendChild(titleConsumedSection);

    consumedTable = document.createElement('table');
    tableHead = document.createElement('tr');
    ingredientNameCol = document.createElement('th');
    ingredientNameCol.textContent = `Product`;
    tableHead.appendChild(ingredientNameCol);

    perHourCol = document.createElement('th');
    perHourCol.textContent = `Consumed Per Hour`;
    tableHead.appendChild(perHourCol);

    perDayCol = document.createElement('th');
    perDayCol.textContent = `Consumed Per Day`;
    tableHead.appendChild(perDayCol);
    consumedTable.appendChild(tableHead);

    uniqueIngredients.forEach((ingredient, i) => {
        row = document.createElement('tr');
        ingredientNameDom =  document.createElement('td');
        ingredientNameDom.textContent = `${ingredient.name}`;
        row.appendChild(ingredientNameDom);

        perHourDom =  document.createElement('td');
        perHourDom.textContent = `${ingredient.amountPerHour.toFixed(2)}`;
        row.appendChild(perHourDom);

        perDayDom =  document.createElement('td');
        perDayDom.textContent = `${(ingredient.amountPerHour*24).toFixed(2)}`;
        row.appendChild(perDayDom);
        consumedTable.appendChild(row);
    });
    parentDom.appendChild(consumedTable)
}

function calculateAdminValue(){
    levels = [];
    map.forEach((product, i) => {
        levels.push(product.level);
    });
    totalLevels = levels.reduce((a,b)=>a+b,0);
    admin = (totalLevels-1)/170;
    return admin
}

function reduceProducedList(){
    reducedProduced = [];
    recorded = false;
    //looping through all produced items trying to find duplicates
    map.forEach((produced, i) => {
        duplicateProduced = [];
        duplicateProduced = map.filter(entry =>
            entry.producing.db_letter == produced.producing.db_letter);
        //Checks for the entry in the unique list.
        if(reducedProduced.find(produce =>
            produce.producing.db_letter == produced.producing.db_letter)){
            recorded = true;
        }
        //If duplicate found and not recorded
        if(duplicateProduced.length>1 && !recorded){
            totalProduced = 0;
            //adding up the total produced per hour
            duplicateProduced.forEach((prod, i) => {
                totalProduced += prod.producedPerHour;
            });
            producedToPushDuplicate = JSON.parse(JSON.stringify(produced));
            producedToPushDuplicate.producedPerHour = totalProduced;
            reducedProduced.push(producedToPushDuplicate);

            recorded = true;
        }if(!recorded){
            reducedProduced.push(produced);
            recorded = true;
        }
        recorded=false;
    });
    console.log(reducedProduced);
    return reducedProduced
}

function reducedIngredientList(uniqueProduced){
    ingredients = [];
    uniqueProduced.forEach((product, i) => {

        if(product.producing.ingredients.length){
            product.producing.ingredients.forEach((ing) => {
                dupIngredient = ingredients.find(ingred => ing.resource.db_letter ==
                                                ingred.db_letter);
                if(dupIngredient){
                    dupIngredient.amountPerHour += product.producedPerHour*ing.amount;

                }else{
                    tempIng ={
                        name : ing.resource.name,
                        db_letter : ing.resource.db_letter,
                        amountPerHour : product.producedPerHour*ing.amount
                    };
                    ingredients.push(tempIng);

                }
            });
            console.log(JSON.parse(JSON.stringify(ingredients)));
        }
    });

    return ingredients

}
