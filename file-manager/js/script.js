// Move file

const fs = window.require('fs');
const Dropzone = require(__dirname + "\\plugins\\dropzone\\dropzone.js")
const path = require("path");

var fileUploadQueue = []

$(document).ready(handleFileUploader());

$("#submit-upload-file").click(handleFileStore);

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
            console.log(FormData)
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
                    file_obj: file                      // This is so useless
                });
                console.log(evt.target.result)
                // fileUploadQueue.forEach(item => { console.log(item.file_id, item.file_name, item.file_data) })
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

async function handleFileStore() {
    fileUploadQueue.forEach(file => {
        //encrypt(file);
        //Storage(file);
        //fs.writeFileSync(path.resolve(__dirname, "..\\app-data\\data\\" + file.file_name), file.file_data);
        
        filePath = path.resolve(__dirname, "..\\app-data\\data\\" + file.file_name);
        if(!fs.existsSync(filePath)) {
            fs.copyFileSync(file.file_obj.path, filePath);
        }
        /*
        var data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
        tree_file = JSON.parse(data);
        console.log(tree_file)
        */
    })
}

function genItem(title, type, modified_date = "", file_size = "") {
    return html`
    <li>
        <div class="file-control">
            <input id="file-list-2" class="magic-checkbox" type="checkbox">
            <label for="file-list-2"></label>
        </div>
        <div class="file-settings"><a href="#"><i class="pci-ver-dots"></i></a>
        </div>
        <div class="file-attach-icon"></div>
        <a href="#" class="file-details">
            <div class="media-block">
                <div class="media-left"><i class="demo-psi-folder"></i></div>
                <div class="media-body">
                    <p class="file-name">${title}</p>
                    <small>${modified_date} | ${file_size}</small>
                </div>
            </div>
        </a>
    </li>`;
}