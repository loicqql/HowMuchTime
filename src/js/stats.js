
displayData();
document.getElementById("export").addEventListener("click", exportData);
document.getElementById("import").addEventListener("click", importData);

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

function importData() {

}