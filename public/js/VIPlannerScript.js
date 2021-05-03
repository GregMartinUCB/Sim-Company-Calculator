
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

function findProductGetData(selection){
    productData = {
        productID : 0,
        ingredients : [],
        productJson : [],
    };
    productData.productID = selection.value;
    resourceJson.forEach((item) => {
        if(item.db_letter == productData.productID){
            productData.productJson = item;
            productData.ingredients = item.ingredients;
            productData.baseSalary = item.baseSalary;
            productData.producedPerHour = item.producedPerHour;
            console.log(item);
        }
    });
    return productData;
}

document.getElementById("determineBuildings").onclick = function() {

    sel = document.getElementById('productSelect');
    buildLevel = document.getElementById('determineBuildings').value;

    if(buildLevel<1){buildLevel = 1;}

    let productInfo = findProductGetData(sel);

    const productSelectForm = document.getElementById('productForm');
    if (document.getElementById('imageDiv')){
        document.getElementById('imageDiv').remove();
    }
    const imageDiv = document.createElement('div');
    imageDiv.className = 'icon';
    imageDiv.id = 'imageDiv';
    const image = document.createElement('img');
    image.src = `/images/${productInfo.productJson.name}.png`;

    imageDiv.appendChild(image)
    productSelectForm.append(imageDiv);

}
