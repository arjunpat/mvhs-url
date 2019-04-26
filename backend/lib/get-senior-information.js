const fetch = require('node-fetch');

module.exports = async () => {
    let res = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1H1kVNidtWjO9ytxCcpzFnM6AaCkJ2YsNKQ-EnjTnQeU/values/Sheet1?key=' + process.env.SHEETS_API_KEY);
    res = await res.json();
    res = res.values;

    let data = {};

    console.time('parse-time');

    for (let i = 0; i < res.length; i++) {

        // loops through all the data in arr and trims it
        for (let j = 0; j < res[i].length; j++) {
            res[i][j] = res[i][j].trim();
        }

        res[i][4] = res[i][4].toLowerCase();

        // grabs the key which is the stu id number
        // also swaps the 10-digit with the 5 digit stu id #'s
        let key = res[i][0];

        // adds to the gobal array var
        data[key] = res[i].splice(1);
    }

    console.timeEnd('parse-time');

    return data;
}