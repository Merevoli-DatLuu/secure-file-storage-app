var fs = require('fs')

var map = {}

map.folders = {
    "000000": {
        name: "/",
        parent: "",
        create_date: "17/03/2020"
    }
}

map.files = {}

map.last_submission = String(Date.now())

fs.writeFileSync('test-map.json', JSON.stringify(map))