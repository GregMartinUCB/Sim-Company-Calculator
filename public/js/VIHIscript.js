var resourceJson =[];
var buildingJson =[];
var productData;
const abundanceBuildings = ['M','Q','O'];


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

async function getBuildings(){
    const buildingResponse = await fetch('../buildings');
    buildingJson = await buildingResponse.json();


}

document.getElementById("selectProduct").onclick = function() {
    viPanel = document.getElementById("leftContainer");
    hiPanel = document.getElementById("rightContainer");
    viPanel.hidden = false;
    hiPanel.hidden = false;
    sel = document.getElementById("productSelect").value;

    product = resourceJson.find(resource => resource.db_letter === Number(sel));
    console.log(product);

    if(!document.getElementById("hiForm")){
        hiForm = document.createElement('form');
        hiForm.method = "post";
        hiForm.id = "hiForm";
        hiPanel.appendChild(hiForm);
    }else {
        hiForm = document.getElementById("hiForm");
    }

    delChildren(hiForm);

    if(product.ingredients.length > 0){
        product.ingredients.forEach((ingredient) => {
         addHIIngredient(ingredient,hiForm);
        })

        submitHIForm = document.createElement('button');
        submitHIForm.type = 'button';
        submitHIForm.className = 'button';
        submitHIForm.id = 'submitHI';
        submitHIForm.textContent = 'Submit'
        hiForm.appendChild(submitHIForm)
    }
}

function delChildren(domElement){
    while (domElement.firstChild) {
        domElement.removeChild(domElement.firstChild);
    }
}

function addHIIngredient(ingredient, parent){
    if(!ingredient || !parent){
        console.log("undifined given to addIcon function");
        return
    }
    imageDivTemp = document.createElement('div');
    imageDivTemp.className='iconInline';
    imageDivTemp.id = `${ingredient.resource.name}HiImageDiv`;

    inputDiv = document.createElement('div');
    imageTemp = document.createElement('img');
    imageTemp.src = `/images/${ingredient.resource.name}.png`;
    imageTemp.className = 'icon'

    labelInput = document.createElement('label');
    labelInput.for = `${ingredient.resource.name}hiSourceCost`;
    labelInput.textContent = `${ingredient.resource.name} Sorce Cost:`;
    inputCost = document.createElement('input');
    inputCost.id = `${ingredient.resource.name}hiSourceCost`;
    inputCost.type = 'number';



    imageDivTemp.appendChild(imageTemp);
    inputDiv.appendChild(labelInput);
    inputDiv.appendChild(inputCost);
    parent.appendChild(imageDivTemp);
    parent.appendChild(inputDiv);

}
