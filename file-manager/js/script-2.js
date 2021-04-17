(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
var fs = require('fs');
var fileUploadQueue = []

$(document).ready(handleFileUploader());

$("#submit-upload-file").click(handleFileStore);

async function handleFileUploader() {

    initFileUploader("#zdrop");

    function initFileUploader(target) {
        var previewNode = document.querySelector("#zdrop-template");
        previewNode.id = "";
        var previewTemplate = previewNode.parentNode.innerHTML;
        previewNode.parentNode.removeChild(previewNode);


        var zdrop = new Dropzone(target, {
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
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                fileUploadQueue.push({
                    file_id: (fileUploadQueue.length == 0) ? 1 : fileUploadQueue[fileUploadQueue.length - 1].file_id + 1,
                    file_name: file.name,
                    file_data: evt.target.result,
                    file_obj: file                      // This is so useless
                });
                fileUploadQueue.forEach(item => { console.log(item.file_id, item.file_name) })
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
    console.log(1)
    fileUploadQueue.forEach(file => {
        //encrypt(file);
        //Storage(file);
        console.log(fs)
        var data = fs.readFileSync('../../app-data/map.json', 'utf8')
        tree_file = JSON.parse(data);
        console.log(tree_file)
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
},{"fs":1}]},{},[2]);