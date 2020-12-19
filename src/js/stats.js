
displayData();
document.getElementById("export").addEventListener("click", exportData);
document.getElementById("importInput").addEventListener("change", importData);

function displayData() {
    getAllData((data) => {

        data.shift();

        data.sort((a, b) => {
            return getTimeByWebsite(popKey(b)) - getTimeByWebsite(popKey(a));
        });
        
        data.forEach(row => {
            var node = document.getElementById('model').cloneNode(true);
            node.id = "";
            node.classList.add('vignette');
            document.querySelector('main').append(node);

            let key = Object.keys(row);

            row = row[key[0]];

            insertDataInHtml(".nameWebsite", key);
            insertDataInHtml(".visits", row.length);
            insertDataInHtml(".time", formatTime(getTimeByWebsite(row)));
            insertDataInHtml(".average", getAverageTime(row));
        });
    });
}

function insertDataInHtml(selector, text) {
    let elements = document.querySelectorAll(".vignette "+selector);
    elements[elements.length -1 ].textContent = text;
}

function popKey(row) {
    let key = Object.keys(row);
    return row[key[0]];
}

function getTimeByWebsite(rows) {

    let times = 0;

    rows.forEach(row => {
        if((row['start'] != null) && (row['end'] != null)) {
            let time = row['end'] - row['start'];
            if(time > TOLERANCE) {
                times  = times + time;
            }
        }
    });

    return times;
}

function exportData() {
    browser.storage.local.get([KEY]).then((e) => {
        if(e.hasOwnProperty(KEY)) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:application/JSON;charset=utf-8,' + encodeURIComponent(JSON.stringify(e)));
            element.setAttribute('download', KEY+'.json');
              
            element.style.display = 'none';
            document.body.appendChild(element);
              
            element.click();
              
            document.body.removeChild(element);              
        }
    },
    function(e) {
        console.log(`Error: ${e}`);
    });
}

function importData(e) {
    let fileJson = document.getElementById("importInput").files[0];

    const fr = new FileReader();

    fr.addEventListener("load", e => {
        //try
        console.log(checkJsonData(JSON.parse(fr.result)));
    });

    fr.readAsText(fileJson);
}

function checkJsonData(json) {

    try {

        if(!json.hasOwnProperty(KEY)) {
            return false;
        }
    
        data = json[KEY];

        let valid = true;

        for (let i = 1; i < data.length; i++) {
            const el = data[i];
            
            let key = Object.keys(el);

            key = key[0];
            
            let row = el[key];
            console.log(row);

            row.forEach(time => {

                console.log(time);

                if(time.hasOwnProperty("start") && time.hasOwnProperty("end")) {
                    let start = time['start'];
                    let end = time['end'];

                    if(Number.isInteger(start) && Number.isInteger(end)) {
                        if(start >= end) {
                            console.log('cc');
                            valid = false;
                        }
                    }else {
                        if(!Number.isInteger(start)) {
                            console.log('cc');
                            valid = false;
                        }
                    }

                }else {
                    console.log('cc');
                    valid = false;
                }
            });
        }

        return valid;

    } catch(error) {
        console.log(error);

        return false;
    }
}