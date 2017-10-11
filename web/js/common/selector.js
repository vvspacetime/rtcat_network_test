/**
 * Created by spacetime on 9/18/17.
 */
// var config = {
//     x : {
//         display:"",
//         value:1,
//         options:[],
//     }
// };
const appendSelectorToHtml = function (configs) {
    for(let c in configs){
        if(configs.hasOwnProperty(c)){
            createContent(configs[c]);
        }
    }
};

const createContent = function (x) {
    let c = `
            <div class="col-md-2">
                <label for="${x["display"]}">${x["display"]}</label>
                <select id="${x["display"]}" class="form-control"></select>
            </div>
            `;

    sel("#sels").insertAdjacentHTML("beforeend",c);

    let s = sel(`#${x["display"]}`);

    for(let i in x["options"]){
        if (x["options"].hasOwnProperty(i)){
            let option = document.createElement("option");
            option.textContent = x["options"][i];
            s.appendChild(option);
        }
    }

    const onchange = () => {
        x["value"] = s.value;
        // s.labels[0].textContent = x["display"] + " : " + s.value;
        // s.textContent =
        log("sel on change",x["value"]);
    };

    onchange();
    s.addEventListener("change",event=>{
        onchange();
    });
};