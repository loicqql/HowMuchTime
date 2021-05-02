//getTabData - managerData

let currentDomain = null;

browser.tabs.onActivated.addListener(getActiveTab);
browser.windows.onRemoved.addListener(() => {storeTab(null)});
getActiveTab();

function getActiveTab() {
    var querying = browser.tabs.query({active: true, currentWindow: true});
    querying.then(function(tabs) {
        tabs.forEach(tab => {
            if(tab.url.startsWith('https://') || tab.url.startsWith('http://')) {
                let domain = tab.url.replace('http://','').replace('https://','').split(/[/?#]/)[0];;
                if(domain != currentDomain) {
                    storeTab(domain);
                }
            }else {
                //stop tracking on currentDomain
                console.log("Stop: " + currentDomain);
                if(currentDomain != null) {
                    storageManager(currentDomain, false, () => {});
                }
                
                currentDomain = null;
            }
        });
    },
    function(e) {
        console.log(`Error: ${e}`);
    });
}

function storeTab(domain) {

    //stop tracking on currentDomain
    console.log("Stop: " + currentDomain);
    if(currentDomain != null) {
        storageManager(currentDomain, false, () => {
            //Wait for end of storageManager

            currentDomain = domain;

            //add tracking on currentDomain
            console.log("Start: " + currentDomain);
            if(currentDomain != null) {
                storageManager(currentDomain, true, () => {});
            }

        });
    }else {

        currentDomain = domain;

        //add tracking on currentDomain
        console.log("Start: " + currentDomain);
        if(currentDomain != null) {
            storageManager(currentDomain, true, () => {});
        }
    }
        
    currentDomain = domain;

}

function storageManager(domain, isStart, callback) {

    browser.storage.local.get([KEY]).then((e) => {
        if(!e.hasOwnProperty(KEY)) {
            browser.storage.local.set({
                [KEY] : defaultStorage
            }).then(() => {
                action(() => {callback()});
            });
        }else {
            action(() => {callback()});
        }
    });

    const action = (callback) => {
        browser.storage.local.get([KEY]).then((e) => {
            data = e[KEY];
            newEntry = true;

            

            let blockedWebsite = false;
            data[0]['blockedWebsites'].forEach((e) => {

                const getDomainName = (e) => {let frags = domain.split('.'); return frags[frags.length-2]+"."+frags[frags.length-1];}
                
                if(getDomainName(e.domain) == getDomainName(domain)) {

                    if(e.subdomains) {
                        if(domain.includes(e.domain)) {
                            console.log('Blocked website');
                            blockedWebsite = true;
                        }
                    }else {
                        if(domain == e.domain) {
                            console.log('Blocked website');
                            blockedWebsite = true;
                        }
                    }
                }
            })

            if(!blockedWebsite) {

                data.forEach(el => {
                    var key = Object.keys(el);
                    if(key[0] == domain) {
                        //domain found
                        newEntry = false;
    
                        if(isStart) {
                            
                            let push = {
                                "start" : Date.now(), "end" : null
                            }
            
                            el[key[0]].push(push);
    
                        }else {
                            tabDomain = el[key[0]];
                            lastRow = tabDomain.pop();
                            
                            let push = {
                                "start" : lastRow["start"], "end" : Date.now()
                            }
        
                            tabDomain.push(push);
                        }
                    }
                });
    
                if(newEntry) {
                    //domain not found -> add new entry
    
                    let push = {
                        [domain] : [
                            {"start" : Date.now(), "end" : null}
                        ]
                    }
    
                    data.push(push);
                }
    
                browser.storage.local.set({
                    [KEY] : data
                });
            }

            browser.storage.local.get([KEY]).then((e) => {
                console.log(e);
            });

            callback();

        });
    }
}