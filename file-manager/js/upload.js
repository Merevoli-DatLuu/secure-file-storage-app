const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')


access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjIwNDYzMDA0LCJqdGkiOiJkNDJmNGM4YTIxOTM0OTE4YjkwYTA1ZGJlYmU5YmFiMiIsInVzZXJfaWQiOjh9.dTDCxwpmYgJ5Jp1fyjtdJ1iMbeTSyZlSElwLDQpNLOY"

function uploadFiles(fileID) {

    // Post the form, just make sure to set the 'Content-Type' header
    const res = (async (data) => await axios.post('http://127.0.0.1:8000/api/sync_file', {
        data: data,
        name: "map.json"
    },
    {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    }).then(e => console.log(e.data)).catch(e => console.log(e)));

    fs.readFile(path.resolve(__dirname, "..\\..\\app-data\\map.json"), (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        res(data)
    })
}

uploadFiles()