const axios = require('axios')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

var data = fs.readFileSync(path.resolve(__dirname, "..\\..\\app-data\\map.json"), 'utf8')
let tree_file = JSON.parse(data);
let file = tree_file.files["000012"]
filePath = path.resolve(__dirname, "..\\..\\app-data\\data\\" + "000012" + file.name);
const formData = new FormData()
formData.append(file.name, "fs.createReadStream(filePath)")


// Post the form, just make sure to set the 'Content-Type' header
const res = (async (data) => await axios.post('http://127.0.0.1:8000/api/file', {
    data: data,
    ...file
  }).then(e => console.log(e.data)).catch(e => console.log(e)));

  

fs.readFile(filePath, (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(data)
    res(data)
    //fs.writeFileSync(filePath + '2', data);
})

/*
, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
}
*/

function testFunction(a, b){
    return a + b;
}

testFunction(1, 3)