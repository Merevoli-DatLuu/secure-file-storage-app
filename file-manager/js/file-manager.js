const key = '14189dc35ae35e75ff31d7502e245cd9';
const iv = '35e75ff31d7502e2';
var fileUploadQueue = []
var maxFileID = 0

$(document).ready(handleFileManager());

function handleFileManager(){
    
    // Init & Loading
    loadFileList();
    updateMaxFileID();

    // Upload Files
    handleFileUploader()

    // Remove Files
    $("#submit-upload-file").click(handleFileStore);
    $("#delete-files").click(handleRemoveFiles);

    // Files in sub-sidebar
    $('#file-type-user-folder').click(loadFileList);
    $('#file-type-photo').click(() => loadFileListByType('photo'));
    $('#file-type-video').click(() => loadFileListByType('video'));
    $('#file-type-music').click(() => loadFileListByType('music'));
    $('#file-type-document').click(() => loadFileListByType('document'));
    $('#file-type-zip').click(() =>loadFileListByType('zip'));
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

async function handleFileStore() {
    let mapPath = path.resolve(__dirname, "..\\app-data\\map.json")
    let data = fs.readFileSync(mapPath, 'utf8')
    var tree_file = JSON.parse(data);

    fileUploadQueue.forEach(file => {
        //encrypt(file);
        //Storage(file);
        //fs.writeFileSync(path.resolve(__dirname, "..\\app-data\\data\\" + file.file_name), file.file_data);

        filePath = path.resolve(__dirname, "..\\app-data\\data\\" + maxFileID + file.file_name);
        if (!fs.existsSync(filePath)) {
            fs.copyFileSync(file.file_obj.path, filePath);
        }

        file_store = {
            "name": file.file_name,
            "parent": "000000",
            "size": file.file_obj.size,
            "create_date": String(Date.now())
        }

        tree_file.files[toFileID(maxFileID++)] = file_store

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

            /*
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            else{
                console.log(`file ${filePath} not found`)
            }
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
    fs.writeFileSync(mapPath, JSON.stringify(tree_file));
    $('#previews').empty()
    $('.preview-container').css('visibility', 'hidden');
    $('#upload-file').modal('hide');

    fileUploadQueue = []

}

async function handleOpenFile(filePath) {
    if (fs.existsSync(filePath)) {
        console.log(filePath)
        /*const watcher = fs.watch(filePath, (eventType, filename) => {
            console.log(eventType)
            console.log('ed');
        });*/
        // Can't Fix - solution: use timeout
        const result = await open(filePath)
        //watcher.close();
        //fs.unlinkSync(filePath)
    }
}

async function viewFile(id) {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let file = tree_file.files[id]

    // Alert

    $('#alert-open-file').empty()
    $('#alert-open-file').append(`
        <div style="padding: 5px;">
            <div class="alert alert-success" id="success-alert" style='margin: 0 auto;' >
                <button type="button" class="close" data-dismiss="alert">x</button>
                <strong>Openning </strong> File: ${file.name}.
            </div>
        </div>
    `)

    $("#success-alert").fadeTo(2000, 500).fadeOut(500, function(){
        $("#success-alert").fadeOut(500);
    });

    filePath = path.resolve(__dirname, "..\\app-data\\data\\" + parseInt(id) + file.name);
    filePathOutput = path.resolve(__dirname, "..\\app-data\\data\\temp\\" + parseInt(id) + file.name);
    var decrypt = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let input = fs.createReadStream(filePath + ".aes");
    let output = fs.createWriteStream(filePathOutput)
    input.pipe(decrypt).pipe(output);
    output.on('finish', () => {
        output.end()
        handleOpenFile(filePathOutput);
    })
}

function removeFile(id) {
    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);

    let file = tree_file.files[id];

    // remove file
    filePath = path.resolve(__dirname, "..\\app-data\\data\\" + parseInt(id) + file.name + ".aes");
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    else{
        console.log(`file ${filePath} not found`)
    }

    // update map.json
    let mapPath = path.resolve(__dirname, "..\\app-data\\map.json")
    delete tree_file.files[id];
    fs.writeFileSync(mapPath, JSON.stringify(tree_file));

    // update UI
    let nodeID = "#file-" + id;
    $(nodeID).remove()
}

function handleRemoveFile(id){
    if (confirm("Are you sure you want to delete this file?")) {
        removeFile(id)
    }
}

function handleRemoveFiles(){
    if (confirm("Are you sure you want to delete this file?")) {
        var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
        let tree_file = JSON.parse(data);
    
        let fileIDs = Object.keys(tree_file.files)
        fileIDs = fileIDs.filter(e => {return document.getElementById(`file-list-${e}`).checked})
        console.log(fileIDs)
        fileIDs.forEach(e => removeFile(e))
    }
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
                action: function (e, selector) { viewFile(id) }
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

    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let files = tree_file.files;
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
    console.log(type)

    let photo_extensions = ['png', 'jpg', 'jpeg', 'gif'];
    let video_extensions = ['mp4', 'mov', 'wmv', 'flv', 'avi', 'webm'];
    let music_extensions = ['mp3', 'm4a', 'flac', 'wav', 'wma', 'aac'];
    let document_extensions = ['doc','docm','docx','dot','dotm','dotx','htm','html','mht','mhtml','odt','pdf','rtf','txt','wps','xml','xps'];
    let zip_extensions = ['zip', 'rar', 'tar']   
    
    let file_extensions;
    if (type == 'photo'){
        file_extensions = photo_extensions;
    }
    else if (type == 'video'){
        file_extensions = video_extensions;
    }
    else if (type == 'music'){
        file_extensions = music_extensions;
    }    
    else if (type == 'document'){
        file_extensions = document_extensions;
    }
    else if (type == 'zip'){
        file_extensions = zip_extensions;
    }

    var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let files = tree_file.files;
    for (file_id in files) {
        let file_name = files[file_id].name
        file_extension = file_name.split('.')[file_name.split('.').length - 1]
        if (file_extensions.includes(file_extension)){
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
