var resourceJson =[];

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






const sel = document.getElementById('productSelect');
document.getElementById("selectProduct").onclick = function() {
    let productData = {
        let productID = 0,
        let ingredients = [],
        let productJson = [],
    }
    //console.log(sel.value);
    productData.productID = sel.value;
    resourceJson.forEach((item) => {
        if(item.db_letter == productID){
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

function removeIngredientInputs(parentDOM){
    while (parentDOM.firstChild) {
    parentDOM.removeChild(parentDOM.lastChild);
  }
}

function addIngredientDiv(parentDOM, prodData ){

    ingredients.forEach((ingredient, i) => {
        let ing = document.createElement("input");
        ing.type = "number";
        ingListDiv.appendChild(ing);
        ingListDiv.appendChild(document.createElement("BR"))
    });
}
