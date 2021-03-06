//functions use in front.js, stats.js

function formatTime(time) {
    let result;

    if (time < 60000) {
        result = Math.floor(time / 1000) + "s";
    } else {

        const format = (k) => {
            if (k < 10) {
                return "0" + k;
            }
            else {
                return k;
            }
        }

        date = new Date(time);
        var hour = date.getUTCHours();
        var min = date.getUTCMinutes();
        var sec = date.getUTCSeconds();
        hour = format(hour);
        min = format(min);
        sec = format(sec);

        if (hour == "00") {
            result = min + " : " + sec;
        } else {
            result = hour + " : " + min + " : " + sec;
        }

    }

    return result;
}

function getAllData(callback) {
    browser.storage.local.get([KEY]).then((e) => {
        if (e.hasOwnProperty(KEY)) {
            callback(e[KEY])
        }
    },
        function (e) {
            console.log(`Error: ${e}`);
        });
}

function getAverageTime(rows, format) {

    let validRows = 0;
    let times = 0;

    if ((rows.length == 1) && rows[0]['end'] == null) {
        return 'N/A'
    }

    rows.forEach(row => {
        if ((row['start'] != null) && (row['end'] != null)) {
            let time = row['end'] - row['start'];
            if (time > TOLERANCE) {
                validRows++;
                times = times + time;
            }
        }
    });

    let average = Math.round(times / validRows);

    if (average) {
        if (format) {
            return formatTime(average);
        } else {
            return average;
        }

    } else {
        return 'N/A';
    }


}

function getWebsites(callback) {

    getAllData((rows) => {
        callback(rows.length - 1);
    })
}