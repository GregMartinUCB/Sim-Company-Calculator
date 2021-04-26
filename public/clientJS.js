
async function getResources(){
    const resourceResponse = await fetch('../resources');
    const resourceJson = await resourceResponse.json();

    let resourceSelection = document.getElementById('productSelect');
    resourceJson.forEach((resource) => {
        let opt = document.createElement("option");
        opt.innerHTML = resource.name;
        resourceSelection.appendChild(opt);
    });

    console.log(resourceJson);
}
