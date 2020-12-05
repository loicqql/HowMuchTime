let data;

let currentDomain = null;

getActiveTab();

function getActiveTab() {
    var querying = browser.tabs.query({active: true, currentWindow: true});
    querying.then(function(tabs) {
        tabs.forEach(tab => {
            if(tab.url.startsWith('https://') || tab.url.startsWith('http://')) {
                domain = tab.url.replace('http://','').replace('https://','').split(/[/?#]/)[0];;   
                if(domain != currentDomain) {
                    currentDomain = domain;
                    getData(() => {
                        showStatsWebsite();
                    })
                }
            }else {
                hideStatsWebsite();
            }
        });
    },
    function(e) {
        console.log(`Error: ${e}`);
    });
}

function front() {
    getData(() => {
        showStatsWebsite();
    })
}

function showStatsWebsite() {

    document.getElementById("stats").setAttribute('href', browser.runtime.getURL("./stats.html"));

    document.getElementById("currentDomain").textContent = "On " + currentDomain;
    document.getElementById("visits").textContent = data.length;

    document.getElementById("sessionTime").textContent = getSessionTime(data[data.length-1]);
    setInterval(() => {document.getElementById("sessionTime").textContent = getSessionTime(data[data.length-1]);},1000);

    document.getElementById("averageTimeSession").textContent = getAverageTime(data);

    getTotalTime((result) => {
        document.getElementById("total").textContent = result;
    });

    getWebsites((result) => {
        document.getElementById("websites").textContent = result;
    });

    setInterval(() => {
        getTotalTime((result) => {
            document.getElementById("total").textContent = result;
        });
    }, 1000);
}

function hideStatsWebsite() {

}

function getData(callback) {
    browser.storage.local.get([KEY]).then((e) => {
        if(e.hasOwnProperty(KEY)) {
            let row = e[KEY].find(el =>  {
                var key = Object.keys(el);
                if(key[0] == currentDomain) {
                    return el
                }
            });

            data = row[currentDomain];

            callback()
        }else {
            hideStatsWebsite();
        }
    },
    function(e) {
        console.log(`Error: ${e}`);
    });

}

function getSessionTime(row) {
    let sessionTime = Date.now() - row['start'];

    let result = sessionTime;

    result = formatTime(sessionTime);

    return result;
}

function getTotalTime(callback) {

    getAllData((rows) => {
        let times = 0;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            let key = Object.keys(row);
            
            let sessions = row[key[0]];

            sessions.forEach(session => {
                if((session['start'] != null) && (session['end'] != null)) {
                    let time = session['end'] - session['start'];
                    if(time > TOLERANCE) {
                        times = times + time;
                    }
                }
            });
        }

        let sessionTime = Date.now() - data[data.length-1]['start'];
        callback(formatTime(times + sessionTime));
    })
}