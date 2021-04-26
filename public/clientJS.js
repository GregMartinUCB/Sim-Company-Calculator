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

productID = 0;
ingredients = [];
productJson = [];

const sel = document.getElementById('productSelect');
document.getElementById("selectProduct").onclick = function() {
    console.log(sel.value);
    productID = sel.value;
    resourceJson.forEach((item) => {
        if(item.db_letter == productID){
            productJson = item;
            ingredients = item.ingredients;
            //console.log(ingredients);
            //console.log(ingredients.length);
        }
    });
    ingredients.forEach((ingredient, i) => {
        let ing = document.createElement("input");
        ing.type = "number";
    });


}
