var resourceJson =[];
var buildingsJson =[];
var buildingSlots =0;
var map = [];
var toBuyGlobal = [];
var toSellGlobal = [];
var uniqueProducedGlobal = [];
var uniqueIngredientsGlobal =[];
var productionSpeed = 0;
const abundanceBuildings = ['M','Q','O'];


async function getResources(){
    const resourceResponse = await fetch('/resources');
    resourceJson = await resourceResponse.json();
    // let resourceSelection = document.getElementById('productSelect');
    // resourceJson.forEach((resource) => {
    //     let opt = document.createElement("option");
    //     opt.innerHTML = resource.name;
    //     opt.value = resource.db_letter;
    //     resourceSelection.appendChild(opt);
    // });

}
async function getBuildings(){
    const buildingsResponse = await fetch('/buildings');
    buildingsJson = await buildingsResponse.json();
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
    createExchangeorContractSelect(leftPanel);
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
    adminInput.required = true;
    adminValue = calculateAdminValue();
    adminInput.value = (adminValue*100).toFixed(3);


    panel.appendChild(adminLabel);
    panel.appendChild(adminInput);

    panel.appendChild(document.createElement('hr'));
    uniqueProduced = reduceProducedList();
    uniqueProducedGlobal = JSON.parse(JSON.stringify(uniqueProduced));
    uniqueIngredients = reducedIngredientList(uniqueProduced);
    uniqueIngredientsGlobal = JSON.parse(JSON.stringify(uniqueIngredients));

    // populateTotalProduced(panel,uniqueProduced);
    // panel.appendChild(document.createElement('hr'));
    // populateTotalConsumed(panel,uniqueIngredients);
    // panel.appendChild(document.createElement('hr'));
    [toBuyGlobal,toSellGlobal] = populateNetProducts(panel,uniqueProduced,
                                                        uniqueIngredients);

    submitPricesButton = document.createElement('button');
    submitPricesButton.id = "submitBuildings";
    submitPricesButton.textContent = "Submit Prices";
    submitPricesButton.className = "button";
    submitPricesButton.onclick = function () {
        createRightPanel();
    }
    panel.appendChild(submitPricesButton);

}

function createRightPanel(){
    rightPanel = document.getElementById('rightContainer');
    delChildren(rightPanel);
    addPriceToBuySell();

    revenues = determineRevenues();
    ingredientExpenses = determineIngredientExpenses();
    [totalWorkerCost, totalAdminCost] = determineTotalLaborCost();


    totalProfitLabel = document.createElement('h3');
    totalProfitLabel.textContent=`Total Profit: `;
    rightPanel.appendChild(totalProfitLabel);
    populateProfitTable(rightPanel);

    totalRevenueLabel = document.createElement('h3');
    totalRevenueLabel.textContent= `Revenues: `;
    rightPanel.appendChild(totalRevenueLabel);
    populateRevenuesTable(rightPanel,revenues);

    totalExpenseLabel = document.createElement('h3');
    totalExpenseLabel.textContent=`Expenses: `;
    rightPanel.appendChild(totalExpenseLabel);
    populateExpensesTable(rightPanel,ingredientExpenses,totalWorkerCost, totalAdminCost);

}

function populateProfitTable(parentDom){

    adminPercent = Number(document.getElementById('adminInput').value);
    var exchange = document.getElementById('sellToExchange');

    var tableData = [];
    var headings = [`Product`,
                    `Source Cost`,
                    'Selling Costs',
                    `Profit Per Unit`,
                    `Profit Per Hour`,
                    `Profit Per Day`];
    tableData.push(headings);
    var totalProfitPerHour = 0;
    toSellGlobal.forEach((soldItem, i) => {
        var totalCostToMake = 0;
        var profitPerUnit =0;
        //Adding Transport Cost
        var transportCost =0;
        var totalSellingCost = 0;
        productionData = uniqueProducedGlobal.find(product =>
                                            product.producing.name == soldItem.name)

        if(productionData.producing.ingredients.length){
            console.log(productionData.producing);
            totalIngCost = getTotalIngredientCost(productionData.producing.ingredients);
            totalCostToMake = totalIngCost + getUnitLaborCost(productionData,adminPercent);
        }
        else{
            totalCostToMake = getUnitLaborCost(productionData,adminPercent);
        }
        console.log(toSellGlobal);
        transportCost = getTransportCost(soldItem);
        if(!exchange.checked){
            console.log('in Contract');
            totalSellingCost = transportCost;
        }
        else{
            totalSellingCost = soldItem.price*0.03 + transportCost;
        }

        profitPerUnit = Number(soldItem.price) - totalCostToMake-totalSellingCost;
        totalProfitPerHour += profitPerUnit*soldItem.amount;

        var rowData =  [`${soldItem.name}`,
                        totalCostToMake.toFixed(3),
                        totalSellingCost.toFixed(3),
                        profitPerUnit.toFixed(3),
                        (profitPerUnit*soldItem.amount).toFixed(2),
                        (profitPerUnit*soldItem.amount*24).toFixed(2)];
        tableData.push(rowData)

    });
    sumRow = [
        `Total`,
        '',
        '',
        '',
        totalProfitPerHour.toFixed(2),
        (totalProfitPerHour*24).toFixed(2)
    ]
    tableData.push(sumRow);
    createTable(parentDom,tableData);
}

function getTransportCost(itemToSell){
    var adminPercent = Number(document.getElementById('adminInput').value);
    var contract = document.getElementById('sellToContract')
    var producingTransportation = uniqueProducedGlobal.find(
        product => product.producing.name == 'Transport'
    )
    var transportationUnitCost = 0;
    var transportationPerItem = 0;

    if(producingTransportation){
        console.log('Should not be here 382');
        var totalIngCost = getTotalIngredientCost(producingTransportation.producing.ingredients);
        transportationUnitCost = totalIngCost + getUnitLaborCost(producingTransportation,adminPercent);
    }
    else{
        var buyTrans = toBuyGlobal.find(buying => buying.name == 'Transport');
        if(!buyTrans){
            console.log('No Purchase Price for ');
            transportationUnitCost=0
        }
        transportationUnitCost = buyTrans.price;
    }
    if(contract.checked){
        transportationPerItem = itemToSell.transportation /2;
        console.log(`Trans unit cost:${transportationUnitCost}`);
        console.log(itemToSell);
    }
    else{
        transportationPerItem = itemToSell.transportation;
    }
    console.log(`Trans per item:${transportationPerItem}`);

    return transportationPerItem * transportationUnitCost
}

function createTable(parentDom, tableData){
    const table = document.createElement('table');
    const tableHead = document.createElement('tr');
    tableData[0].forEach((heading, i) => {
        colHeading = document.createElement('th');
        colHeading.textContent = `${heading}`;
        tableHead.appendChild(colHeading);
    });
    table.appendChild(tableHead)
    tableData.forEach((row, i) => {
        if(i!=0){
            tableRow= document.createElement('tr');
            row.forEach((cell, i) => {
                cellDom =  document.createElement('td');
                cellDom.textContent = `${cell}`;
                tableRow.appendChild(cellDom);
            });
            table.appendChild(tableRow);
        }
    });

    parentDom.appendChild(table);
}

function getUnitLaborCost(productionData, adminPercent){
    unitWorkerCost = (productionData.producing.baseSalary*productionData.level)/
                                        productionData.producedPerHour;
    unitLaborCost = unitWorkerCost * (1+adminPercent/100);

    return unitLaborCost
}

function getTotalIngredientCost (ingredients){
    const adminPercent = Number(document.getElementById('adminInput').value);
    var totalingCost = 0;
    ingredients.forEach((ing, i) => {
        const makingItOurself = uniqueProducedGlobal.find(product =>
                                            product.producing.name == ing.resource.name)

        //Case where we are not making the ingredient ourself
        //All cost comes from buying it
        if(!makingItOurself){
            const ingFromBuyListData = toBuyGlobal.find(globalBuy=>
                                                ing.resource.name == globalBuy.name)
            totalingCost += ingFromBuyListData.price * ing.amount;

            console.log(ing.resource.name);
            console.log(`Sourcing Cost: ${totalingCost}`);

        }
        //Case where the ingredient does not have ingredients
        //All cost comes from labor
        else if(!makingItOurself.producing.ingredients.length){
            totalingCost += getUnitLaborCost(makingItOurself,adminPercent)
        }
        //Case where we are making it and this ingredient has ingredients.
        //Cost comes from either producing 100% of our demand.
        //or a mix of buying and our own production line costs.
        else{
            console.log(ing.resource.name);
            var totalProduced = makingItOurself.producedPerHour;
            var consumedIngredient = uniqueIngredientsGlobal.find(ingredient =>
                                        ingredient.name == makingItOurself.producing.name);
            if(!consumedIngredient){throw(new Error('Consumed ingredient not found.'))}

            var totalConsumed = consumedIngredient.amountPerHour ? consumedIngredient.amountPerHour : 1;
            var percentBought = (totalConsumed-totalProduced)/totalConsumed;
            var laborCost = getUnitLaborCost(makingItOurself,adminPercent);
            var sourcingCost = getTotalIngredientCost(makingItOurself.producing.ingredients)
            sourcingCost = sourcingCost * ing.amount;
            laborCost = laborCost * ing.amount;
            console.log(`Sourcing Cost: ${sourcingCost}`);
            console.log(`Labor Cost:${laborCost}`);
            if(percentBought >= 0){
                console.log(percentBought);

                //case where we need to buy some to suppliment our consumption
                const ingFromBuyListData = toBuyGlobal.find(globalBuy=>
                                                    ing.resource.name == globalBuy.name)
                totalingCost += percentBought*(ingFromBuyListData.price*ing.amount)+
                        (1-percentBought)*sourcingCost;

                totalingCost += laborCost;
            }
            //case where we are making more than we consume.
            //All cost comes from our production.
            if(percentBought < 0){
                console.log(percentBought);
                totalingCost += sourcingCost + laborCost;
            }
        }
    });
    return totalingCost
}

function populateRevenuesTable(parentDom,revenues){
    revenuesTable = document.createElement('table');
    tableHead = document.createElement('tr');
    productNameCol = document.createElement('th');
    productNameCol.textContent = `Product`;
    tableHead.appendChild(productNameCol);

    perHourCol = document.createElement('th');
    perHourCol.textContent = `Revenue /hour:`;
    tableHead.appendChild(perHourCol);

    perDayCol = document.createElement('th');
    perDayCol.textContent = `Revenue /day:`;
    tableHead.appendChild(perDayCol);
    revenuesTable.appendChild(tableHead);

    var totalRevenue = 0;
    revenues.forEach((revSource, i) => {
        row = document.createElement('tr');
        prodNameDom =  document.createElement('td');
        prodNameDom.textContent = `${revSource.name}`;
        row.appendChild(prodNameDom);

        perHourDom =  document.createElement('td');
        perHourDom.textContent = `$${revSource.revenue.toFixed(2)}`;
        row.appendChild(perHourDom);

        perDayDom =  document.createElement('td');
        perDayDom.textContent = `$${(revSource.revenue*24).toFixed(2)}`;
        row.appendChild(perDayDom);
        revenuesTable.appendChild(row);
        totalRevenue += revSource.revenue;
    });

    sumRow = document.createElement('tr');
    sumLabel = document.createElement('td');
    sumLabel.textContent = `TOTAL`;
    sumRow.appendChild(sumLabel);
    sumHour = document.createElement('td');
    sumHour.textContent = `$${(totalRevenue).toFixed(2)}`;
    sumRow.appendChild(sumHour);
    sumDay = document.createElement('td');
    sumDay.textContent = `$${(totalRevenue*24).toFixed(2)}`;
    sumRow.appendChild(sumDay);
    revenuesTable.appendChild(sumRow);
    parentDom.appendChild(revenuesTable);

}

function populateExpensesTable(parentDom,ingredientExpenses,totalWorkerCost, totalAdminCost){
    expensesTable = document.createElement('table');
    tableHead = document.createElement('tr');
    productNameCol = document.createElement('th');
    productNameCol.textContent = `Source`;
    tableHead.appendChild(productNameCol);

    perHourCol = document.createElement('th');
    perHourCol.textContent = `Expense /hour:`;
    tableHead.appendChild(perHourCol);

    perDayCol = document.createElement('th');
    perDayCol.textContent = `Expense /day:`;
    tableHead.appendChild(perDayCol);
    expensesTable.appendChild(tableHead);

    totalExpense=0;

    ingredientExpenses.forEach((ing, i) => {
        row = document.createElement('tr');
        prodNameDom =  document.createElement('td');
        prodNameDom.textContent = `${ing.name}`;
        row.appendChild(prodNameDom);

        perHourDom =  document.createElement('td');
        perHourDom.textContent = `$${ing.expense.toFixed(2)}`;
        row.appendChild(perHourDom);

        perDayDom =  document.createElement('td');
        perDayDom.textContent = `$${(ing.expense*24).toFixed(2)}`;
        row.appendChild(perDayDom);
        expensesTable.appendChild(row);
        totalExpense += ing.expense;
    });

    workerCostRow = document.createElement('tr');
    workerCostLabel = document.createElement('td');
    workerCostLabel.textContent = `Workers`;
    workerCostRow.appendChild(workerCostLabel);
    workerCostHour = document.createElement('td');
    workerCostHour.textContent = `$${(totalWorkerCost).toFixed(2)}`;
    workerCostRow.appendChild(workerCostHour);
    workerCostDay = document.createElement('td');
    workerCostDay.textContent = `$${(totalWorkerCost*24).toFixed(2)}`;
    workerCostRow.appendChild(workerCostDay);
    expensesTable.appendChild(workerCostRow);

    adminCostRow = document.createElement('tr');
    adminCostLabel = document.createElement('td');
    adminCostLabel.textContent = `Admin`;
    adminCostRow.appendChild(adminCostLabel);
    adminCostHour = document.createElement('td');
    adminCostHour.textContent = `$${(totalAdminCost).toFixed(2)}`;
    adminCostRow.appendChild(adminCostHour);
    adminCostDay = document.createElement('td');
    adminCostDay.textContent = `$${(totalAdminCost*24).toFixed(2)}`;
    adminCostRow.appendChild(adminCostDay);
    expensesTable.appendChild(adminCostRow);

    totalExpense += totalWorkerCost + totalAdminCost;
    sumRow = document.createElement('tr');
    sumLabel = document.createElement('td');
    sumLabel.textContent = `TOTAL`;
    sumRow.appendChild(sumLabel);
    sumHour = document.createElement('td');
    sumHour.textContent = `$${(totalExpense).toFixed(2)}`;
    sumRow.appendChild(sumHour);
    sumDay = document.createElement('td');
    sumDay.textContent = `$${(totalExpense*24).toFixed(2)}`;
    sumRow.appendChild(sumDay);
    expensesTable.appendChild(sumRow);

    parentDom.appendChild(expensesTable);
}

function determineRevenues(){
    revenue = {};
    revenues = [];
    toSellGlobal.forEach((productToSell, i) => {
        revenue = {
            name:productToSell.name,
            db_letter:productToSell.db_letter,
            revenue:productToSell.amount * productToSell.price,
        }
        revenues.push(revenue);
    });
    return revenues
}

function determineIngredientExpenses(){
    ingredientExpense = {};
    ingredientExpenses = [];
    toBuyGlobal.forEach((productToBuy, i) => {
        ingredientExpense = {
            name:productToBuy.name,
            db_letter:productToBuy.db_letter,
            expense:productToBuy.amount * productToBuy.price,
        }
        ingredientExpenses.push(ingredientExpense);
    });
    return ingredientExpenses
}

function determineTotalLaborCost(){
    var totalWorkerCost = 0;
    uniqueProducedGlobal.forEach((product, i) => {
        var workerCost = product.producing.baseSalary * product.level;
        totalWorkerCost += workerCost;
    });
    var adminPercent = Number(document.getElementById('adminInput').value);
    var adminCost = totalWorkerCost * adminPercent/100;

    return [totalWorkerCost, adminCost]
}

function addPriceToBuySell(){
    sellPrices = document.getElementsByName('sellPrice');
    buyPrices = document.getElementsByName('buyPrice');
    toSellGlobal.forEach((sellable, i) => {
        sellable.price = Number(sellPrices[i].value);
    });

    toBuyGlobal.forEach((ingredient, i) => {
        ingredient.price = Number(buyPrices[i].value);
    });
}

function populateNetProducts(parentDom,uniqueProduced,uniqueIngredients){

    [toBuy, toSell] = determineBuyandSell(uniqueProduced,uniqueIngredients);
    populateToSellTable(parentDom,toSell);
    populateToBuyTable(parentDom,toBuy);

    return [toBuy, toSell]
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
        perHourDom.textContent = `${ingToBuy.amount.toFixed(2)}`;
        row.appendChild(perHourDom);

        perDayDom =  document.createElement('td');
        perDayDom.textContent = `${(ingToBuy.amount*24).toFixed(2)}`;
        row.appendChild(perDayDom);

        buyFor =  document.createElement('td');
        currencySign = document.createElement('span');
        currencySign.textContent = '$';
        buyFor.appendChild(currencySign);
        input = document.createElement('input');
        input.type = 'number';
        input.required = true;
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
        perHourDom.textContent = `${sellable.amount.toFixed(2)}`;
        row.appendChild(perHourDom);

        perDayDom =  document.createElement('td');
        perDayDom.textContent = `${(sellable.amount*24).toFixed(2)}`;
        row.appendChild(perDayDom);

        sellFor =  document.createElement('td');
        currencySign = document.createElement('span');
        currencySign.textContent = '$';
        sellFor.appendChild(currencySign);
        input = document.createElement('input');
        input.type = 'number';
        input.required = true;
        input.id = `${sellable.name}SellPrice`;
        input.name = `sellPrice`;
        sellFor.appendChild(input);
        row.appendChild(sellFor);

        toSellTable.appendChild(row);
    });
    parentDom.appendChild(toSellTable);
}

function determineBuyandSell(uniqueProduced,uniqueIngredients){
    var toSell = [];
    var toBuy = [];
    uniqueIngredients.forEach((ingredient) => {
        console.log(JSON.parse(JSON.stringify(ingredient)));
        var buy = {};
        var sell = {};
        const productThatisIngredient = uniqueProduced.find(product =>
            ingredient.db_letter == product.producing.db_letter);
        if(productThatisIngredient){
            net = productThatisIngredient.producedPerHour - ingredient.amountPerHour;
            if(net < 0){
                buy = {
                    name:ingredient.name,
                    db_letter:ingredient.db_letter,
                    amount: Math.abs(net),
                    transportation:ingredient.transportation,
                }
                toBuy.push(buy);
            }else{
                sell = {
                    name:ingredient.name,
                    db_letter:ingredient.db_letter,
                    amount: net,
                    transportation:ingredient.transportation,
                }
                toSell.push(sell);
            }
        }
        else{
            buy = {
                name:ingredient.name,
                db_letter:ingredient.db_letter,
                amount: ingredient.amountPerHour,
                transportation:ingredient.transportation,
            }
            if(buy!={}){
                toBuy.push(buy);
            }
        }
    });
    uniqueProduced.forEach((product) => {
        var alreadyIntoSell = toSell.find( sell =>
                    product.producing.db_letter == sell.db_letter)
        var alreadyIntoBuy = toBuy.find( buy =>
                    product.producing.db_letter == buy.db_letter)
        if(!alreadyIntoSell && !alreadyIntoBuy){
            sell = {
                name:product.producing.name,
                db_letter:product.producing.db_letter,
                amount: product.producedPerHour,
                transportation:product.producing.transportation,
            }
            toSell.push(sell);
        }
    });

    [toBuy, toSell] = determineTransportRequired(toBuy,toSell);

    return [toBuy, toSell]
}

function determineTransportRequired(toBuy, toSell){
    var buy = {};
    var transNeeded = 0;
    toSell.forEach((product, i) => {
        transNeeded += product.amount * product.transportation;
    });
    contractInput = document.getElementById('sellToContract');
    if(contractInput.checked){
        transNeeded /= 2;
    }
    producedTransport = toSell.find(sell => sell.db_letter == 13)
    if(producedTransport){
        netTrans = producedTransport.amount - transNeeded;
        if(netTrans < 0){
            buy = {
                name:producedTransport.name,
                db_letter:producedTransport.db_letter,
                amount: Math.abs(netTrans),
                transportation:producedTransport.transportation,
            }
            toBuy.push(buy);
            var transportationIndex = toSell.findIndex(itemtoSell =>
                            itemtoSell.db_letter == producedTransport.db_letter)
            toSell.splice(transportationIndex,1);
        }
        else{
            producedTransport.amount = netTrans
        }
    }
    else{
        var transportData = resourceJson.find(resource => resource.name == 'Transport');

        buy = {
            name:'Transport',
            db_letter:transportData.db_letter ? transportData.db_letter:13,
            amount: transNeeded,
            transportation:transportData.transportation ? transportData.transportation:0,
        }
        toBuy.push(buy)
    }
    return [toBuy,toSell]
}

function createExchangeorContractSelect(parentDom){
    contractOrExchangeLabel = document.createElement('label');
    contractOrExchangeLabel.for = `contractOrExchangeSelection`;
    parentDom.appendChild(contractOrExchangeLabel);

    contractOrExchangeDiv = document.createElement('div');
    contractOrExchangeDiv.className = 'row';

    contractDiv = document.createElement('div');
    exchangeDiv = document.createElement('div');
    contractDiv.className = 'column';
    exchangeDiv.className = 'column';

    contractLabel = document.createElement('label');
    contractLabel.for = 'sellToContract';
    contractLabel.textContent = 'Contract';
    contract =  document.createElement('input');
    contract.type = 'radio';
    contract.id = 'sellToContract';
    contract.name = 'sellWhereButton';
    contract.value = 'contract';
    contract.checked = true;

    exchangeLabel = document.createElement('label');
    exchangeLabel.for = 'sellToExchange';
    exchangeLabel.textContent = 'Exchange';
    exchange =  document.createElement('input');
    exchange.type = 'radio';
    exchange.id = 'sellToExchange';
    exchange.name = 'sellWhereButton';
    exchange.value = 'exchange';

    contractDiv.appendChild(contractLabel);
    contractDiv.appendChild(contract);
    exchangeDiv.appendChild(exchangeLabel);
    exchangeDiv.appendChild(exchange);
    contractOrExchangeDiv.appendChild(contractDiv);
    contractOrExchangeDiv.appendChild(exchangeDiv);
    parentDom.appendChild(contractOrExchangeDiv);
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
            totalLevel = 0;
            //adding up the total produced per hour
            duplicateProduced.forEach((prod, i) => {
                totalProduced += prod.producedPerHour;
                totalLevel += prod.level;
            });
            producedToPushDuplicate = JSON.parse(JSON.stringify(produced));
            producedToPushDuplicate.producedPerHour = totalProduced;
            producedToPushDuplicate.level = totalLevel;
            reducedProduced.push(producedToPushDuplicate);

            recorded = true;
        }if(!recorded){
            reducedProduced.push(produced);
            recorded = true;
        }
        recorded=false;
    });
    return reducedProduced
}

function reducedIngredientList(uniqueProduced){
    ingredients = [];
    uniqueProduced.forEach((product, i) => {
        console.log(product);
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
                        amountPerHour : product.producedPerHour*ing.amount,
                        transportation: ing.resource.transportation
                    };
                    ingredients.push(tempIng);

                }
            });
        }
    });

    return ingredients

}
