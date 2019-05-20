const fetch = require('node-fetch');

module.exports = async () => {
    let res = await fetch('https://sheets.googleapis.com/v4/spreadsheets/1gZLCM0n2FzMVeQujhtBx_B8zvbLlwJkHRz7K_OifdhU/values/Sheet1?key=' + process.env.SHEETS_API_KEY);
    res = await res.json();
    res = res.values;

    let data = {};

    console.time('parse-time');

    for (let i = 0; i < res.length; i++) {
        // grabs the key which is the stu id number
        // also swaps the 10-digit with the 5 digit stu id #'s
        let key = res[i][0];

        // adds to the gobal array var
        data[key] = res[i].splice(1);
    }

    console.timeEnd('parse-time');

    return data;
}