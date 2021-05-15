var resourceJson =[];
var buildingsJson =[];
var buildingSlots =0;
var map = [];
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
    buildingDoms.forEach((buildingSlot, i) => {
        buildingJSON = buildingsJson.find(
                        build => build.db_letter == buildingSlot.value);
        productJSON = resourceJson.find(
                        resource => resource.db_letter == productDoms[i].value);
        if(abundanceBuildings.find(abunBuild => abunBuild == buildingJSON.db_letter)){
            abundance = abundanceDoms.shift().value;
        }else{
            abundance = undefined;
        }
        level = levelDoms[i].value;
        build = createBuildSlotObject(buildingJSON,abundance,productJSON,level);
        map.push(build);
    });
    console.log(map);
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
    }
    return building;
}
