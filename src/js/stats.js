
displayData();
document.getElementById("export").addEventListener("click", exportData);
document.getElementById("importInput").addEventListener("change", importData);

let ths = document.querySelectorAll('th');
ths.forEach(tr => {
    tr.addEventListener('click', selectTable);
});

function displayData() {
    getAllData((data) => {

        data.shift();

        data.sort((a, b) => {
            return getTimeByWebsite(popKey(b)) - getTimeByWebsite(popKey(a));
        });
        
        data.forEach(row => {

            let key = Object.keys(row);

            row = row[key[0]];
            
            let tr = document.createElement('tr');

            tr.appendChild(createTd(key, key));
            tr.appendChild(createTd(row.length, row.length));
            tr.appendChild(createTd(formatTime(getTimeByWebsite(row)), getTimeByWebsite(row)));
            tr.appendChild(createTd(getAverageTime(row, true), getAverageTime(row, false)));

            let tbody = document.querySelector('tbody');
            tbody.appendChild(tr);
        });
    });
}

function createTd(text, dataset) {
    var td = document.createElement("td");
    td.textContent = text;
    td.dataset.raw = dataset;
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


function selectTable() {
    if(this.classList.contains('select')) {

        let i = this.querySelector('i');
        if(i.classList.contains('fa-caret-up')) {
            i.classList.remove('fa-caret-up');
            i.classList.add('fa-caret-down');
        }else {
            i.classList.remove('fa-caret-down');
            i.classList.add('fa-caret-up');
        }

    }else {
        let ths = document.querySelectorAll('th');
        ths.forEach(tr => {
            tr.classList.remove('select');
        });

        this.classList.add('select');

        let i = this.querySelector('i');

        if(i.classList.contains('fa-caret-down')) {
            i.classList.remove('fa-caret-down');
            i.classList.add('fa-caret-up');
        }
    }

    let i = this.querySelector('i');
    if(i.classList.contains('fa-caret-down')) {
        sortTable(this.dataset.column, true);
    }else {
        sortTable(this.dataset.column, false);
    }

    
}

function sortTable(column, ASC) {

    const urlToNumber = (e) => {
        let tabUrl = e.split('.');
        let domain = tabUrl[tabUrl.length - 2];
        let fristLetter = domain.charAt(0);
        return fristLetter.charCodeAt(0) - 97;
    }

    const extractData = (e) => {
        if(column === "1") { //sort name of websites
            return urlToNumber(e.querySelector('td:nth-child('+column+')').dataset.raw);
        }else {
            return e.querySelector('td:nth-child('+column+')').dataset.raw;
        }
    }

    let trs = document.querySelectorAll('tbody tr');

    trs = Array.prototype.slice.call(trs, 0);

    if(ASC) {
        trs.sort((a, b) => {
            return extractData(a) - extractData(b);
        });
    }else {
        trs.sort((a, b) => {
            return extractData(b) - extractData(a);
        });
    }

    let tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    trs.forEach(tr => {
        tbody.appendChild(tr);
    });
    
}