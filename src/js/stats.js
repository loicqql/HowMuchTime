//display Data in stats page

displayData();
updateBlockedWebsites();

document.getElementById("export").addEventListener("click", exportData);
document.getElementById("importInput").addEventListener("change", importData);

document.getElementById("searchBar").addEventListener("input", searchBar);

document.getElementById('formWebsitesBlocked').addEventListener('submit', formWebsiteBlocked);

document.querySelector(".checkbox_dark").addEventListener('change', updateDark);

let lis = document.querySelectorAll('ul li');
lis.forEach(li => {
    li.addEventListener('click', navigation);
});

let ths = document.querySelectorAll('.index th');
ths.forEach(tr => {
    tr.addEventListener('click', selectTable);
});

document.querySelector('header img').addEventListener('click', () => {
    document.querySelector('header li:first-of-type').click();
});

function displayData() {
    let tbody = document.querySelector('.index tbody');
    tbody.innerHTML = "";

    getAllData((data) => {

        data.shift();

        data.sort((a, b) => {
            return getTimeByWebsite(popKey(b)) - getTimeByWebsite(popKey(a));
        });
        
        data.forEach(row => {

            let key = Object.keys(row);

            row = row[key[0]];
            
            let tr = document.createElement('tr');
            tr.dataset.domain = key;

            tr.appendChild(createTd(key, key));
            tr.appendChild(createTd(row.length, row.length));
            tr.appendChild(createTd(formatTime(getTimeByWebsite(row)), getTimeByWebsite(row)));
            tr.appendChild(createTd(getAverageTime(row, true), getAverageTime(row, false)));
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

function importData() {
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
        let ths = document.querySelectorAll('.index th');
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

    let trs = document.querySelectorAll('.index tbody tr');

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

    let tbody = document.querySelector('.index tbody');
    tbody.innerHTML = '';

    trs.forEach(tr => {
        tbody.appendChild(tr);
    });
    
}

function navigation() {

    let lis = document.querySelectorAll("ul li");
    for (let i = 0; i < lis.length; i++) {
        lis[i].classList.remove('active')
    }
    this.classList.add('active');

    let sections = document.querySelectorAll("section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].style.display = 'none';
    }
    
    let section = document.querySelector('.'+this.dataset.section);
    section.style.display = 'block';

    let func = new functions()
    func[this.dataset.section]();
}

function functions(){
    this.index = function(){displayData()};
    this.settings = function(){updateBlockedWebsites()};
    this.about = function(){};
}

function searchBar() {
    let input = this.value;

    let trs = document.querySelectorAll('tbody tr');
    trs.forEach(tr => {
        tr.style.display = 'table-row';

        if(input != "") {
                if(!(tr.dataset.domain.toLowerCase().includes(input.toLowerCase()))) {
                tr.style.display = "none";
            }
        }
        
    });    
}

function setBlockedWebsite(domain, subdomains, callback) {
    getAllData((data)=>{

        let updated = false;
        data[0]['blockedWebsites'].forEach(el => {
            if(el.domain === domain) {
                updated = true;
                el.subdomains = subdomains;
            }
        });

        if(!updated) {
            data[0]['blockedWebsites'].push({
                domain: domain,
                subdomains: subdomains
            });
        }
        
        browser.storage.local.set({
            [KEY] : data
        }).then(() => {
            updateBlockedWebsites();
            callback();
        });
    });
}

function updateBlockedWebsites() {
    getAllData((e)=>{
        let tbody = document.querySelector('.settings tbody');
        tbody.innerHTML = '';

        if(e[0]['blockedWebsites'].length == 0) {
            let td = document.createElement("td");
            td.textContent = 'No blocked websites';
            tbody.appendChild(td);
        }else {
            e[0]['blockedWebsites'].forEach(el => {
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                let p = document.createElement("p");
                
                if(el.subdomains) {
                    p.textContent = el.domain + ' with subdomains';
                }else {
                    p.textContent = el.domain;
                }
                
                let i = document.createElement("i");
                i.classList.add('fas', 'fa-trash-alt');
                i.dataset.raw = el.domain;

                i.addEventListener('click', (e) => {
                    deleteBlockedWebsite(e.target.dataset.raw);
                });

                p.appendChild(i);
                td.appendChild(p);
                tr.appendChild(td);
                tbody.appendChild(tr);
            });
        }
    });
}

function deleteBlockedWebsite(domain) {
    getAllData((data)=>{
        data[0]['blockedWebsites'] = data[0]['blockedWebsites'].filter(item => item.domain !== domain);

        browser.storage.local.set({
            [KEY] : data
        }).then(() => {
            updateBlockedWebsites();
        });
    });
}

function formWebsiteBlocked(e) {
    e.preventDefault();
    let domain = document.getElementById('inputWebsitesBlocked').value;

    domain = domain.toLowerCase();
    //verif
    //possibilité de bloquer des sous domaines sur une un domaine qui contient déja un sous domaine ?

    setBlockedWebsite(domain, document.getElementById('subdomains').checked, () => {
        if(document.getElementById('deleteData').checked) {
            deleteDataByWebsite(domain);
        }
    });   
}

function deleteDataByWebsite(website) {
    let deleteSubdomains = document.getElementById('subdomains').checked;

    getAllData((data) => {

        const getKey = (row) => {
            let key = Object.keys(row);
            if(key.length > 1) {
                key[0] = "How: "+Math.random()*10 //Never mind
            }
            return key[0];
        }

        if(deleteSubdomains) {
            data = data.filter(item => !getKey(item).includes(website));
        }else {
            data = data.filter(item => getKey(item) != website);
        }

        browser.storage.local.set({
            [KEY]: data
        }).then(() => {
            displayData();
        });
    });
}

function updateDark() {
    getAllData((data)=>{
        data[0]['is_dark'] = document.querySelector(".checkbox_dark").checked;
        browser.storage.local.set({
            [KEY] : data
        })
    });
}