var resourceJson =[];
var playerData = {};
var adminOverheadDisplayed = 0;

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

    console.log(resourceJson);
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

function removeIngredientInputs(parentDOM){
    while (parentDOM.firstChild) {
    parentDOM.removeChild(parentDOM.lastChild);
  }
}

function addIngredientDiv(parentDOM, prodData ){

    prodData.ingredients.forEach((ingredient, i) => {
        console.log(ingredient);
        let ingDiv = document.createElement('div');

        let ingCost = document.createElement("input");
        ingCost.title = "sourceCost"
        ingCost.id = `sourceCost${ingredient.resource.db_letter}`
        ingCost.type = "number";
        ingCost.label = "cost";

        let title = document.createElement('p');
        title.innerHTML = `${ingredient.resource.name} x ${ingredient.amount}`;


        ingDiv.appendChild(title);
        ingDiv.appendChild(ingCost);
        parentDOM.appendChild(ingDiv);
        parentDOM.appendChild(document.createElement("BR"))
    });
}

const sel = document.getElementById('productSelect');
document.getElementById("selectProduct").onclick = function() {
    let productData = {
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
            //console.log(ingredients);
            //console.log(ingredients.length);
        }
    });
    const ingListDiv = document.getElementById("ingredientList")
    removeIngredientInputs(ingListDiv)
    addIngredientDiv(ingListDiv,productData);

}

document.getElementById("submitName").onclick = async function () {
    await getPlayerData(document.getElementById("playerName").value);
    adminOverheadDisplayed = parseFloat((playerData.adminOverhead - 1) * 100).toFixed(3);
    document.getElementById("adminOverhead").value = adminOverheadDisplayed;
    document.getElementById("productionSpeed").value = playerData.productionModifier;

}
