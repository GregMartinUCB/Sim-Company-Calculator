
var resourceJson =[];
const abundanceBuildings = ['M','Q','O'];

async function getResources(){
    const resourceResponse = await fetch('/resources');
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

//Currently working on this one.
function getProductData(selection,buildingsLevel,abundance){
    ingLayers= [];

    resourceJson.forEach((item, i) => {
        if(item.db_letter == selection.value){
            ingLayers[0] = getBuildingLevel(item, buildingsLevel, abundance);

        }
    });

    for(layer = 0; layer <10; layer++){
        if(ingLayers[layer]){
            ingLayers[layer].forEach((resource, i) => {
                if(i !=0){
                    resourceJson.forEach((item, i) => {
                        if(item.name == resource.resource){
                            ingLayers[layer+1] = getBuildingLevel(item, resource.level,abundance);
                        }
                    });
                }
            });
        }
    }
    //console.log(ingLayers);
    uniqueReasources = reduceIngList(ingLayers);



    //console.log(uniqueReasources);
    return uniqueReasources

}

function reduceIngList(ingredientLayers){
    const tempingredient = JSON.parse(JSON.stringify(ingredientLayers))
    condensedList= [];
    condensedList[0] = tempingredient[0][0]
    tempingredient.forEach((layer, layerIndex) => {
        layer.forEach((resource, index) => {
            if(index != 0){
                foundIndex = condensedList.findIndex(uniqueReasorce =>
                    uniqueReasorce.resource === resource.resource);
                if(condensedList[foundIndex]){
                    condensedList[foundIndex].level += resource.level;
                }
                else{
                    condensedList.push(resource);
                }
            }
        });

    });

    //console.log(condensedList);



    return condensedList;
}

function getBuildingLevel(entry, desiredBuildLevel, abundance){
    buildings = [];
    productBuilding = {
        resource: entry.name,
        imageURL:entry.imageURL,
        level: desiredBuildLevel,
        baseSalary:entry.baseSalary,
        producedPerHour:entry.producedPerHour,
        producedAt:entry.producedAt
    }


    buildings.push(productBuilding);

    productPerHour = desiredBuildLevel * entry.producedPerHour;

    entry.ingredients.forEach((item, i) => {
        building = {
            resource: '',
            level: 0,
            baseSalary: 0,
            producedPerHour:0
        }
        building.resource = item.resource.name;
        amountIng = item.amount;
        resourceJson.forEach((resource, i) => {
            if(item.resource.db_letter == resource.db_letter){
                building.level = productPerHour * amountIng / resource.producedPerHour;
                building.baseSalary = resource.baseSalary;
                building.producedPerHour = resource.producedPerHour;
                building.producedAt = resource.producedAt;
                building.imageURL = resource.imageURL;
                abunBuild = abundanceBuildings.find(build =>
                    build == resource.producedAt.buildingLetter);
                if(abunBuild){
                    building.level = building.level /(abundance/100);
                }
            }

        });

        buildings.push(building);
    });

    return buildings
}

function addImage(ing){
    const productSelectForm = document.getElementById('resultBox');

    imageDivTemp = document.createElement('div');
    imageDivTemp.className='icon';
    imageDivTemp.id = `${ing.resource}Image`;
    imageTemp = document.createElement('img');
    imageTemp.src = `/images/${ing.resource}.png`;
    imageDivTemp.appendChild(imageTemp);
    productSelectForm.append(imageDivTemp);

    return imageDivTemp
}

function addTextProduct(ing,div){
    resultDiv = document.createElement('div');
    resultDiv.className = 'buildingResult';
    resultDiv.id = `${ing.resource}Result`;

    exactLvls = document.createElement('p');
    exactLvls.id =  `${ing.resource}Level`;
    exactLvls.textContent = `Desired Building Level: ${ing.level}`

    amountRequiredPerHour = document.createElement('p');
    amountRequiredPerHour.id =  `${ing.resource}AmountPerHour`;
    amountRequiredPerHour.textContent = `Amount Created Per Hour:
                                    ${(ing.level*ing.producedPerHour).toFixed(1)}`;

    amountMadePerDay = document.createElement('p');
    amountMadePerDay.id =  `${ing.resource}AmountPerDay`;
    amountMadePerDay.textContent = `Amount Created Per Day:
                            ${(ing.level*ing.producedPerHour*24).toFixed(1)}`;

    resultDiv.appendChild(exactLvls);
    resultDiv.appendChild(amountRequiredPerHour);
    resultDiv.appendChild(amountMadePerDay);

    div.appendChild(resultDiv);

}

function addText(ing,div){
    resultDiv = document.createElement('div');
    resultDiv.className = 'buildingResult';
    resultDiv.id = `${ing.resource}Result`;

    exactLvls = document.createElement('p');
    exactLvls.id =  `${ing.resource}Level`;
    exactLvls.textContent = `Exact Building Levels Needed: ${ing.level.toFixed(3)}`

    roundedLvls = document.createElement('p');
    roundedLvls.id =  `${ing.resource}RoundedLevel`;
    roundedLvls.textContent = `Whole Building Levels Needed: ${Math.ceil(ing.level)}`

    amountRequiredPerHour = document.createElement('p');
    amountRequiredPerHour.id =  `${ing.resource}AmountPerHour`;
    amountRequiredPerHour.textContent = `Amount Needed Per Hour:
                                    ${(ing.level*ing.producedPerHour).toFixed(1)}`;

    amountReqPerDay = document.createElement('p');
    amountReqPerDay.id =  `${ing.resource}AmountPerDay`;
    amountReqPerDay.textContent = `Amount Needed Per Day:
                            ${(ing.level*ing.producedPerHour*24).toFixed(1)}`;

    resultDiv.appendChild(exactLvls);
    resultDiv.appendChild(roundedLvls);
    resultDiv.appendChild(amountRequiredPerHour);
    resultDiv.appendChild(amountReqPerDay);

    div.appendChild(resultDiv);
}

function addIngResults(ingInformation){
    const productSelectForm = document.getElementById('productForm');
    if (document.getElementById('resultBox')){
        document.getElementById('resultBox').remove();
    }
    resultDiv = document.createElement('div');
    resultDiv.id = 'resultBox';
    productSelectForm.appendChild(resultDiv);


    ingInformation.forEach((item, i) => {
        resultDiv = addImage(item);
        if(i===0){
            addTextProduct(item,resultDiv)
        }else {
            addText(item,resultDiv);
        }

        resultDiv.appendChild(document.createElement('hr'));

    });
}


document.getElementById("determineBuildings").onclick = function() {

    sel = document.getElementById('productSelect');
    buildLevel = Number(document.getElementById('desiredBuildLevel').value).toFixed(1);
    abundance = Number(document.getElementById('abundance').value);

    if(abundance>100){abundance = 100}
    if(abundance<1){abundance = 1}
    if(buildLevel<1){buildLevel = 1;}

    let productInfo = getProductData(sel, buildLevel, abundance);

    addIngResults(productInfo);

}
