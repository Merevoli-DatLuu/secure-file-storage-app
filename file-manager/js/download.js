const fs = require('fs')
const axios = require('axios')

const res = (async (data) => await axios.get('http://127.0.0.1:8000/api/test/0007')
    .then(e => {
        data = e.data
        //data = JSON.parse(data)
        fs.writeFile('test.txt', Buffer.from(data['message']['data']), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    })
    .catch(e => console.log(e)));

res()