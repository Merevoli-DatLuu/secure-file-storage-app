const key = '14189dc35ae35e75ff31d7502e245cd9';
const iv = '35e75ff31d7502e2';
var fileUploadQueue = []
var maxFileID = 0
var list_showed_file = []
var watcher_manager = {}

// Modified File
var last_modified = {}


$(document).ready(setTimeout(() => handleFileManager(), 0));

function handleFileManager() {

    // Init & Loading
    loadFileList();
    updateMaxFileID();

    // Upload Files
    handleFileUploader()

    // Remove Files
    $("#submit-upload-file").click(handleFileStore);
    $("#delete-files").click(handleRemoveFiles);
    $("#download-files").click(handleDownloadFiles);

    // Files in sub-sidebar
    $('#file-type-user-folder').click(loadFileList);
    $('#file-type-photo').click(() => loadFileListByType('photo'));
    $('#file-type-video').click(() => loadFileListByType('video'));
    $('#file-type-music').click(() => loadFileListByType('music'));
    $('#file-type-document').click(() => loadFileListByType('document'));
    $('#file-type-zip').click(() => loadFileListByType('zip'));

    // Searching
    var input = document.getElementById("search-input");

    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        searchFiles();
      }
    });
    
}

function updateMaxFileID() {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    tree_file = JSON.parse(data);

    if (JSON.stringify(tree_file.files) != JSON.stringify({})) {
        for (fileid in tree_file.files) {
            maxFileID = Math.max(maxFileID, parseInt(fileid))
        }
    }
    maxFileID++;
}

function handleFileUploader() {
    initFileUploader("#zdrop");

    function initFileUploader(target) {
        var previewNode = document.querySelector("#zdrop-template");
        previewNode.id = "";
        var previewTemplate = previewNode.parentNode.innerHTML;
        previewNode.parentNode.removeChild(previewNode);

        var zdrop = new Dropzone.Dropzone(target, {
            url: '/UploadFile',
            maxFilesize: 20,
            previewTemplate: previewTemplate,
            autoQueue: true,
            previewsContainer: "#previews",
            clickable: "#upload-label"
        });

        zdrop.on("addedfile", function (file, fromData) {
            $('.preview-container').css('visibility', 'visible');
        });

        zdrop.on("sending", function (file, xhr, formData) {
            console.log(file)
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (evt) {
                fileUploadQueue.push({
                    file_id: (fileUploadQueue.length == 0) ? 1 : fileUploadQueue[fileUploadQueue.length - 1].file_id + 1,
                    file_name: file.name,
                    file_data: evt.target.result,
                    file_obj: file
                });
            }
            reader.onerror = function (evt) {
                console.log("error reading file");
            }
        });

        zdrop.on("removedfile", function (file) {
            for (let ind in fileUploadQueue) {
                if (fileUploadQueue[ind].file_obj == file) {
                    fileUploadQueue.splice(ind, 1);
                    break;
                }
            }

            fileUploadQueue.forEach(item => { console.log(item.file_id, item.file_name) })
        });


        zdrop.on("totaluploadprogress", function (progress) {
            var progr = document.querySelector(".progress .determinate");
            if (progr === undefined || progr === null)
                return;

            progr.style.width = progress + "%";
        });

        zdrop.on('dragenter', function () {
            $('.fileuploader').addClass("active");
        });

        zdrop.on('dragleave', function () {
            $('.fileuploader').removeClass("active");
        });

        zdrop.on('drop', function () {
            $('.fileuploader').removeClass("active");
        });

        var toggle = true;
        /* Preview controller of hide / show */
        $('#controller').click(function () {
            if (toggle) {
                $('#previews').css('visibility', 'hidden');
                $('#submit-upload-file').css('visibility', 'hidden');
                $('#controller').html("keyboard_arrow_up");
                $('#previews').css('height', '0px');
                $('#submit-upload-file').css('height', '0px');
                toggle = false;
            } else {
                $('#previews').css('visibility', 'visible');
                $('#submit-upload-file').css('visibility', 'visible');
                $('#controller').html("keyboard_arrow_down");
                $('#previews').css('height', 'initial');
                $('#submit-upload-file').css('height', 'initial');
                toggle = true;
            }
        });
    }

}

function toFileID(id) {
    fileID = "";
    for (let i = 1; i <= 6 - String(id).length; i++) {
        fileID += "0";
    }
    return fileID + String(id);
}

function getHashFile(filePath) {
    let hash = crypto.createHash('md5');
    var data = fs.readFileSync(filePath)
    hash.update(data);
    var result = result = hash.digest('hex')
    console.log(`${result} ${filePath}`);

    return result
}

function checkIntenet(callback) {
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        }
        else {
            callback()
        }
    });
}

async function uploadFilesToServer(fileID) {
    checkIntenet(() => { uploadFiles(fileID) })
}

function uploadFiles(fileID) {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let file = tree_file.files[fileID]
    filePath = path.resolve(__dirname, "..\\app-data\\data\\" + fileID + file.name + '.aes');

    // Post the form, just make sure to set the 'Content-Type' header
    const res = (async (data) => await axios.post('http://127.0.0.1:8000/api/file', {
        data: data,
        name: file['name'] + '.aes'
        //...file
    },
    {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    }).then(e => console.log(e.data)).catch(e => console.log(e)));

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        res(data)
    })
}

function downloadFiles(fileID) {
    const res = (async (data) => await axios.get('http://127.0.0.1:8000/api/file/' + fileID)
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
}

async function handleFileStore() {
    let mapPath = path.resolve(__dirname, "..\\app-data\\map.json")
    let data = fs.readFileSync(mapPath, 'utf8')
    var tree_file = JSON.parse(data);

    var numFile = fileUploadQueue.length
    var numUploadedFile = 0

    fileUploadQueue.forEach(file => {
        //encrypt(file);
        //Storage(file);
        //fs.writeFileSync(path.resolve(__dirname, "..\\app-data\\data\\" + file.file_name), file.file_data);
        var fileID = toFileID(maxFileID)
        filePath = path.resolve(__dirname, "..\\app-data\\data\\" + toFileID(maxFileID) + file.file_name);
        if (!fs.existsSync(filePath)) {
            fs.copyFileSync(file.file_obj.path, filePath);
        }

        file_store = {
            "name": file.file_name,
            "parent": "000000",
            "size": file.file_obj.size,
            "create_date": String(Date.now()),
            'check_sum': getHashFile(filePath)
        }

        tree_file.files[toFileID(maxFileID++)] = file_store
        list_showed_file[toFileID(maxFileID -1)] = file_store

        $('#demo-mail-list').append(
            genItem(
                toFileID(maxFileID - 1),
                file_store.name,
                file_store.create_date,
                file_store.size
            )
        );
        popupMenu(toFileID(maxFileID - 1))

        var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        var input = fs.createReadStream(filePath);
        var output = fs.createWriteStream(filePath + ".aes");
        input.pipe(cipher).pipe(output);

        output.on('finish', async function () {
            console.log('Encrypted file written to disk!');

            // Remove plain file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                numUploadedFile += 1
                if (numUploadedFile == numFile){
                    showAlert("success", `${numUploadedFile} file(s) upload successful`, "success")
                }
            }
            else {
                showAlert("error", `file ${filePath} upload failed`, "danger")
            }

            //uploadFilesToServer(fileID)
            /*await input.close();
            await output.close();

            input = fs.createReadStream(filePath + ".aes");
            let output_plain = fs.createWriteStream("plain" + filePath)
            input.pipe(decrypt).pipe(output);
            output_plain.on('finish', function() {
                console.log('Encrypted file written to disk!');
            });*/
        });

    })
    tree_file.last_submission = String(Date.now())
    fs.writeFileSync(mapPath, JSON.stringify(tree_file));
    $('#previews').empty()
    $('.preview-container').css('visibility', 'hidden');
    $('#upload-file').modal('hide');

    fileUploadQueue = []

}

/*
    + Watcher 
- max_time (last modified): 10 minutes -> delete temp file & close watcher & alert to user "Your time to watch is end"
- modified -> (wait) 30s -> request API

"You have 10 minutes to View/Modified the File. When overtime, it will not save the modified"
*/

async function watchModifiedFile(watcher, filePath, id){
    max_time = 1
    current_modified = new Date().getTime()
    if (current_modified - last_modified[id] > max_time*60*1000){ 
        last_modified[id] = 0

        // Write file
        var cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
        var input = fs.createReadStream(filePath);
        console.log(filePath)
        var output = fs.createWriteStream(filePath.substr(0,filePath.lastIndexOf('\\')) + '\\..\\' + filePath.split('\\')[filePath.split('\\').length - 1] + ".aes");
        input.pipe(cipher).pipe(output);

        output.on('finish', async function () {

            // Change hash file 
            let mapPath = path.resolve(__dirname, "..\\app-data\\map.json")
            var data = fs.readFileSync(mapPath, 'utf8')
            let tree_file = JSON.parse(data);

            tree_file.files[id].check_sum = getHashFile(filePath)

            tree_file.last_submission = String(Date.now())
            fs.writeFileSync(mapPath, JSON.stringify(tree_file));

            // delete temp file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            else {
                console.log(`file ${filePath} not found`)
            }

            // close the watcher
            watcher.close();

            // alert 
            showAlert("Warning", " It's overtime. Any change after this time will not be saved", 'warning', 5000)
            console.log('timeout')

            // Clear the interval
            clearIntervalModifiedFile(id)

        });
    }
}

function clearIntervalModifiedFile(idInterval){
    // set interval is map - global
    // set id 
    // call this in watchModified...()

    clearInterval(watcher_manager[idInterval])
    delete watcher_manager[idInterval]
    delete last_modified[idInterval]

}

async function handleOpenFile(filePath, id, type) {
    if (fs.existsSync(filePath)) {
        console.log(filePath)
        
        if (type == "edit"){
            const watcher = fs.watch(filePath, (eventType, filename) => {
                console.log(eventType)
                last_modified[id] = new Date().getTime()
                console.log('change')
            });
            
            last_modified[id] = new Date().getTime()

            watcher_manager[id] = setInterval(() => {watchModifiedFile(watcher, filePath, id)}, 5000)
        }
        // Can't Fix - solution: use timeout
        const result = await open(filePath)
        await new Promise(resolve => setTimeout(resolve, 30000));
        if (type == "open"){
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            else {
                console.log(`file ${filePath} not found`)
            }
        }
        //watcher.close();
        //fs.unlinkSync(filePath)
    }
}

function showAlert(action_message, content_message, type, timeout = 2000) {
    $('#alert-open-file').empty()
    $('#alert-open-file').append(`
        <div style="padding: 5px;">
            <div class="alert alert-${type}" id="success-alert" style='margin: 0 auto;' >
                <button type="button" class="close" data-dismiss="alert">x</button>
                <strong>${action_message} </strong> ${content_message}.
            </div>
        </div>
    `)

    $("#success-alert").fadeTo(timeout, 500).fadeOut(500, function () {
        $("#success-alert").fadeOut(500);
    });
}

async function viewFile(id, type = "open") {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let file = tree_file.files[id]

    filePath = path.resolve(__dirname, "..\\app-data\\data\\" + id + file.name);
    filePathOutput = path.resolve(__dirname, "..\\app-data\\data\\temp\\" + id + file.name);

    // Alert
    if (type == "edit"){
        showAlert("Openning to edit", ` File: ${file.name}`, 'success')
    }
    else{
        showAlert("Openning", ` File: ${file.name}`, 'success')
        filePathOutput = path.resolve(__dirname, "..\\app-data\\data\\temp\\" + id + ".open." + file.name);
    }

    var decrypt = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let input = fs.createReadStream(filePath + ".aes");
    let output = fs.createWriteStream(filePathOutput)
    input.pipe(decrypt).pipe(output);
    output.on('finish', () => {
        output.end()
        handleOpenFile(filePathOutput, id, type);
    })
}

function removeFile(id) {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);

    let file = tree_file.files[id];

    // remove file
    filePath = path.resolve(__dirname, "..\\app-data\\data\\" + id + file.name + ".aes");
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    else {
        console.log(`file ${filePath} not found`)
    }

    // update map.json
    let mapPath = path.resolve(__dirname, "..\\app-data\\map.json")
    delete tree_file.files[id];
    tree_file.last_submission = String(Date.now())
    fs.writeFileSync(mapPath, JSON.stringify(tree_file));

    // update UI
    let nodeID = "#file-" + id;
    $(nodeID).remove()
}

function handleRemoveFile(id) {
    if (confirm("Are you sure you want to delete this file?")) {
        removeFile(id)
    }
}

function handleRemoveFiles() {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);

    let fileIDs = Object.keys(tree_file.files)
    fileIDs = fileIDs.filter(e => { return document.getElementById(`file-list-${e}`).checked })
    if (fileIDs.length > 0){
        if (confirm("Are you sure you want to delete this file?")) {
            console.log(fileIDs)
            fileIDs.forEach(e => removeFile(e))
        }
    }
    else{
        showAlert("Info", " No files selected", "primary")
    }
}

window.openFolderDialog = (callback, file, id) => {
    ipcRenderer.invoke('app:on-folder-dialog-open').then((data) => {
        callback(data[0], file, id)
    });
}

function downloadFileToFolder(download_dir, file, id) {
    filePath = path.resolve(__dirname, "..\\app-data\\data\\" + id + file.name);
    filePathOutput = download_dir + '/' + file.name;

    var decrypt = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let input = fs.createReadStream(filePath + ".aes");
    let output = fs.createWriteStream(filePathOutput)
    input.pipe(decrypt).pipe(output);
    output.on('finish', () => {
        console.log(filePathOutput)
        output.end()
        showAlert("Download", "file " + file.name + " successfully", 'success')
    })
}

function downloadFilesToFolder(download_dir, files, ids) {
    for (var i = 0; i < ids.length; i++) {
        file = files[i]
        id = ids[i]
        filePath = path.resolve(__dirname, "..\\app-data\\data\\" + id + file.name);
        filePathOutput = download_dir + '/' + file.name;

        var decrypt = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let input = fs.createReadStream(filePath + ".aes");
        let output = fs.createWriteStream(filePathOutput)
        input.pipe(decrypt).pipe(output);
        output.on('finish', () => {
            console.log(filePathOutput)
            output.end()
        })
    }
    showAlert("Download", "file " + file.name + " successfully", "success")

    ids.forEach(e => { document.getElementById(`file-list-${e}`).checked = false })
}

async function downloadFile(id) {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);

    let file = tree_file.files[id];

    openFolderDialog(downloadFileToFolder, file, id)

}

function handleDownloadFiles() {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);

    let fileIDs = Object.keys(tree_file.files)
    fileIDs = fileIDs.filter(e => { return document.getElementById(`file-list-${e}`).checked })
    console.log(fileIDs)
    files = fileIDs.map(e => tree_file.files[e])

    openFolderDialog(downloadFilesToFolder, files, fileIDs)

}

function popupMenu(id) {
    test_menu = {
        id: id,
        data: [
            {
                header: 'Actions'
            },
            {
                icon: 'glyphicon-eye-open',
                text: '  View',
                action: function (e, selector) { viewFile(id) }
            },
            {
                icon: 'glyphicon-edit',
                text: '  Edit',
                action: function (e, selector) { viewFile(id, "edit") }
            },
            {
                icon: 'glyphicon glyphicon-download',
                text: '  Download',
                action: function (e, selector) { downloadFile(id) }
            },
            {
                divider: true
            },
            {
                icon: 'glyphicon-trash',
                text: '  Delete',
                action: function (e, selector) { handleRemoveFile(id) }
            }
        ]
    };
    context.init({ preventDoubleContext: false });
    context.attach('#file-setting-' + id, test_menu);

    // Open file by clicking
    $('#file-' + id).children('a').dblclick(() => viewFile(id));

}

function loadFiles(files){
    $('#demo-mail-list').empty()
    $('#demo-mail-list').append(
        `
        <!--File list item-->
        <li>
            <div class="file-control">
                <input id="file-list-1" class="magic-checkbox" type="checkbox">
                <label for="file-list-1"></label>
            </div>
            <div class="file-attach-icon"></div>
            <a href="#" class="file-details">
                <div class="media-block">
                    <div class="media-left"><i class="demo-psi-folder"></i></div>
                    <div class="media-body">
                        <p class="file-name single-line">...</p>
                    </div>
                </div>
            </a>
        </li>`
    );

    for (file_id in files) {

        $('#demo-mail-list').append(
            genItem(
                file_id,
                files[file_id].name,
                files[file_id].create_date,
                files[file_id].size
            )
        );
        popupMenu(file_id)
    }
}

function searchFiles() {
    var search_string = document.getElementById('search-input').value.toLowerCase()
    var pass = searchFiles == "";
    var is_regex = search_string[0] == '/'
    var patt
    if (is_regex){
        try {
            patt = new RegExp(search_string.substr(1));
        }
        catch{
            showAlert("Warning", "Invalid regular expression", 'warning')
            return false;
        }
    }

    $('#demo-mail-list').empty()
    $('#demo-mail-list').append(
        `
        <!--File list item-->
        <li>
            <div class="file-control">
                <input id="file-list-1" class="magic-checkbox" type="checkbox">
                <label for="file-list-1"></label>
            </div>
            <div class="file-attach-icon"></div>
            <a href="#" class="file-details">
                <div class="media-block">
                    <div class="media-left"><i class="demo-psi-folder"></i></div>
                    <div class="media-body">
                        <p class="file-name single-line">...</p>
                    </div>
                </div>
            </a>
        </li>`
    );

    _renderFileSidebar("user-folder")
    $('#sort_file').val("create_date-0")
    

    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let files = tree_file.files;

    list_showed_file = files
    for (file_id in files) {
        if (is_regex){
            if (patt.test(files[file_id].name.toLowerCase())){
                $('#demo-mail-list').append(
                    genItem(
                        file_id,
                        files[file_id].name,
                        files[file_id].create_date,
                        files[file_id].size
                    )
                );
                popupMenu(file_id)
            }
        }
        else{
            if (files[file_id].name.toLowerCase().includes(search_string) || pass){
                $('#demo-mail-list').append(
                    genItem(
                        file_id,
                        files[file_id].name,
                        files[file_id].create_date,
                        files[file_id].size
                    )
                );
                popupMenu(file_id)
            }
        }
    }
}

function sortFiles(){
    id_type = $('#sort_file').val()

    var info_name = id_type.split('-')[0]
    var sort_type = id_type.split('-')[1]

    var sorted_files = []
    for (file_id in list_showed_file){
        sorted_files.push({'id': file_id, ...list_showed_file[file_id]})   
    }

    sorted_files.sort((a, b) => {
        if (sort_type == '0'){
            return (a[info_name] > b[info_name])?1:-1
        }
        else{
            return (a[info_name] < b[info_name])?1:-1
        }
    })

    console.log(sorted_files)
    
    $('#demo-mail-list').empty()
    $('#demo-mail-list').append(
        `
        <!--File list item-->
        <li>
            <div class="file-control">
                <input id="file-list-1" class="magic-checkbox" type="checkbox">
                <label for="file-list-1"></label>
            </div>
            <div class="file-attach-icon"></div>
            <a href="#" class="file-details">
                <div class="media-block">
                    <div class="media-left"><i class="demo-psi-folder"></i></div>
                    <div class="media-body">
                        <p class="file-name single-line">...</p>
                    </div>
                </div>
            </a>
        </li>`
    );



    for (f of sorted_files) {

        $('#demo-mail-list').append(
            genItem(
                f['id'],
                f['name'],
                f['create_date'],
                f['size']
            )
        );
        popupMenu(f['id'])
    }


}

function loadFileList() {
    $('#demo-mail-list').empty()
    $('#demo-mail-list').append(
        `
        <!--File list item-->
        <li>
            <div class="file-control">
                <input id="file-list-1" class="magic-checkbox" type="checkbox">
                <label for="file-list-1"></label>
            </div>
            <div class="file-attach-icon"></div>
            <a href="#" class="file-details">
                <div class="media-block">
                    <div class="media-left"><i class="demo-psi-folder"></i></div>
                    <div class="media-body">
                        <p class="file-name single-line">...</p>
                    </div>
                </div>
            </a>
        </li>`
    );

    _renderFileSidebar("user-folder")
    $('#sort_file').val("create_date-0")

    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let files = tree_file.files;
    list_showed_file = files
    for (file_id in files) {

        $('#demo-mail-list').append(
            genItem(
                file_id,
                files[file_id].name,
                files[file_id].create_date,
                files[file_id].size
            )
        );
        popupMenu(file_id)
    }
}

function _renderFileSidebar(type){
    $('#file-type-user-folder').css({
        "font-weight": "400",
        "color": "rgb(122, 135, 142)"
    })
    $('#file-type-photo').css({
        "font-weight": "400",
        "color": "rgb(122, 135, 142)"
    })
    $('#file-type-video').css({
        "font-weight": "400",
        "color": "rgb(122, 135, 142)"
    })
    $('#file-type-music').css({
        "font-weight": "400",
        "color": "rgb(122, 135, 142)"
    })
    $('#file-type-document').css({
        "font-weight": "400",
        "color": "rgb(122, 135, 142)"
    })
    $('#file-type-zip').css({
        "font-weight": "400",
        "color": "rgb(122, 135, 142)"
    })

    $('#file-type-' + type).css({
        "font-weight": "bold",
        "color": "#4d627b"
    })
}

function loadFileListByType(type) {
    $('#demo-mail-list').empty()
    $('#demo-mail-list').append(
        `
        <!--File list item-->
        <li>
            <div class="file-control">
                <input id="file-list-1" class="magic-checkbox" type="checkbox">
                <label for="file-list-1"></label>
            </div>
            <div class="file-attach-icon"></div>
            <a href="#" class="file-details">
                <div class="media-block">
                    <div class="media-left"><i class="demo-psi-folder"></i></div>
                    <div class="media-body">
                        <p class="file-name single-line">...</p>
                    </div>
                </div>
            </a>
        </li>`
    );
    
    _renderFileSidebar(type)
    $('#sort_file').val("create_date-0")

    let photo_extensions = ['png', 'jpg', 'jpeg', 'gif'];
    let video_extensions = ['mp4', 'mov', 'wmv', 'flv', 'avi', 'webm'];
    let music_extensions = ['mp3', 'm4a', 'flac', 'wav', 'wma', 'aac'];
    let document_extensions = ['doc', 'docm', 'docx', 'dot', 'dotm', 'dotx', 'htm', 'html', 'mht', 'mhtml', 'odt', 'pdf', 'rtf', 'txt', 'wps', 'xml', 'xps'];
    let zip_extensions = ['zip', 'rar', 'tar']

    let file_extensions;
    if (type == 'photo') {
        file_extensions = photo_extensions;
    }
    else if (type == 'video') {
        file_extensions = video_extensions;
    }
    else if (type == 'music') {
        file_extensions = music_extensions;
    }
    else if (type == 'document') {
        file_extensions = document_extensions;
    }
    else if (type == 'zip') {
        file_extensions = zip_extensions;
    }

    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let files = tree_file.files;

    filtered_files = {}
    for (file_id in files){
        let file_name = files[file_id].name
        file_extension = file_name.split('.')[file_name.split('.').length - 1]
        if (file_extensions.includes(file_extension)) {
            filtered_files[file_id] = files[file_id]   
        }
    }    
    list_showed_file = filtered_files
    for (file_id in filtered_files) {
        $('#demo-mail-list').append(
            genItem(
                file_id,
                filtered_files[file_id].name,
                filtered_files[file_id].create_date,
                filtered_files[file_id].size
            )
        );
        popupMenu(file_id)
    }
}

function genItem(file_id, title, modified_date = "", file_size = "") {

    function getFileType(file_name) {
        file_map = {
            undefined: 'demo-pli-file',
            mp3: 'demo-pli-file-music',
            png: 'demo-pli-file-pictures',
            jpg: 'demo-pli-file-jpg',
            png: 'demo-pli-file-pictures',
            jpeg: 'demo-pli-file-pictures',
            gif: 'demo-pli-file-pictures',
            mp4: 'demo-pli-file-video',
            zip: 'demo-pli-file-zip',
            rar: 'demo-pli-file-zip',
            doc: 'demo-pli-file-word',
            docx: 'demo-pli-file-word',
            xls: 'demo-pli-file-excel',
            xlsx: 'demo-pli-file-excel',
            csv: 'demo-pli-file-csv',
            html: 'demo-pli-file-html',
            txt: 'demo-pli-file-txt'
        }
        file_extension = file_name.split('.')[file_name.split('.').length - 1]
        if (file_extension in file_map) {
            return file_map[file_extension];
        }
        else {
            return file_map['undefined'];
        }
    }

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    function toDate(timestamp) {
        var d = new Date(parseInt(timestamp));
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear()
    }

    return `
    <li id = "file-${file_id}">
        <div class="file-control">
            <input id="file-list-${file_id}" class="magic-checkbox" type="checkbox">
            <label for="file-list-${file_id}"></label>
        </div>
        <div class="file-settings"><a id = "file-setting-${file_id}" href="#" ><i class="pci-ver-dots"></i></a>
        </div>
        <div class="file-attach-icon"></div>
        <a role="button" class="file-details">
            <div class="media-block">
                <div class="media-left"><i class="${getFileType(title)}"></i></div>
                <div class="media-body">
                    <p class="file-name">${title}</p>
                    <small>${toDate(modified_date)} | ${bytesToSize(file_size)}</small>
                </div>
            </div>
        </a>
        <div class="dropdown-menu dropdown-menu-sm" id="context-menu">
          <a class="dropdown-item" href="#">Action</a>
          <a class="dropdown-item" href="#">Another action</a>
          <a class="dropdown-item" href="#">Something else here</a>
        </div>
    </li>`;
}
