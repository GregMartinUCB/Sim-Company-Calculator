
var resourceJson =[];

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

    console.log(resourceJson);
}

//Currently working on this one.
function getProductData(selection,buildingsLevel){
    productData = {
        name:'',
        productID : 0,
        ingredients : [],
        baseSalary : 0,
        producedPerHour: 0
    };
    productData.productID = selection.value;

    resourceJson.forEach((item, i) => {
        if(item.db_letter == productData.productID){
            productData.name = item.name;
            productIngLevels = getBuildingLevel(item, buildingsLevel);

        }
    });

    productIngLevels.forEach((resource, i) => {
        if(i !=0){
            resourceJson.forEach((item, i) => {
                if(item.name == resource.resource){
                    if(item.ingredients.length != 0){

                        subIngLevel = getBuildingLevel(item, resource.level);
                    }
                }
            });

        }
    });


    return productData

}

function getBuildingLevel(entry, desiredBuildLevel = 1){
    buildings = [];
    productBuilding = {
        resource: entry.name,
        level: desiredBuildLevel
    }


    buildings.push(productBuilding);
    console.log(buildings);

    productPerHour = desiredBuildLevel * entry.producedPerHour;

    entry.ingredients.forEach((item, i) => {
        building = {
            resource: '',
            level: 0
        }
        building.resource = item.resource.name;
        amountIng = item.amount;
        resourceJson.forEach((resource, i) => {
            if(item.resource.db_letter == resource.db_letter){
                building.level = productPerHour * amountIng / resource.producedPerHour;
            }
        });
        buildings.push(building);
    });
    return buildings
}


document.getElementById("determineBuildings").onclick = function() {

    sel = document.getElementById('productSelect');
    buildLevel = document.getElementById('determineBuildings').value;

    if(buildLevel<1){buildLevel = 1;}

    let productInfo = getProductData(sel, buildLevel);

    const productSelectForm = document.getElementById('productForm');
    if (document.getElementById('imageDiv')){
        document.getElementById('imageDiv').remove();
    }
    const imageDiv = document.createElement('div');
    imageDiv.className = 'icon';
    imageDiv.id = 'imageDiv';
    const image = document.createElement('img');
    image.src = `/images/${productInfo.name}.png`;

    imageDiv.appendChild(image)
    productSelectForm.append(imageDiv);

}
