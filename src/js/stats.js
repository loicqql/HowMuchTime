
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

            let key = Object.keys(row);

            row = row[key[0]];
            
            var tr = document.createElement('tr');

            tr.appendChild(createTd(key));
            tr.appendChild(createTd(row.length));
            tr.appendChild(createTd(formatTime(getTimeByWebsite(row))));
            tr.appendChild(createTd(getAverageTime(row)));

            var tbody = document.querySelector('tbody');
            tbody.appendChild(tr);
        });
    });
}

function createTd(text) {
    var td = document.createElement("td");
    td.textContent = text;
    return td;
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
        try {
            let json = JSON.parse(fr.result);
            if(checkJsonData(json)) {
                updateData(json);
            }else {
                displayMessage('An error has occurred');
            }
        }catch(e) {
            displayMessage('An error has occurred');
        }
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

            row.forEach(time => {

                if(time.hasOwnProperty("start") && time.hasOwnProperty("end")) {
                    let start = time['start'];
                    let end = time['end'];

                    if(Number.isInteger(start) && Number.isInteger(end)) {
                        if(start >= end) {
                            valid = false;
                        }
                    }else {
                        if(!Number.isInteger(start)) {
                            valid = false;
                        }
                    }

                }else {
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

function updateData(json) {
    console.log(json);
    displayMessage('Data has been updated');
}

function displayMessage(e) {
    console.log(e)
}