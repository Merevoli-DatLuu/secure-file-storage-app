$(document).ready(loadingSidebar());

user_info = {
    email: "",
    first_name: "",
    last_name: ""
}

function loadingSidebar() {
    // Side bar
    $('#dashboard-sidebar').click(useDashboard);
    $('#filemanager-sidebar').click(useFilemanager);
    $('#favorites-sidebar').click(useFavorites);
    $('#appinfo-sidebar').click(useAppinfo);
    $('#view-profile').click(showProfile)
    setInterval(handleClientStatus, 1000);

    checkLogin()
    activityWatcher()
    showMoreDetails()
    setInterval(checkServerStatus, 5000)
}

function useDashboard() {
    console.log('useDashboard');
    $('#dashboard-sidebar').css('color', '#337ab7');
    $('#filemanager-sidebar').css('color', 'inherit');
    $('#favorites-sidebar').css('color', 'inherit');
    $('#appinfo-sidebar').css('color', 'inherit');

    // Using Component
}

function useFilemanager() {
    console.log('useFilemanager');
    $('#dashboard-sidebar').css('color', 'inherit');
    $('#filemanager-sidebar').css('color', '#337ab7');
    $('#favorites-sidebar').css('color', 'inherit');
    $('#appinfo-sidebar').css('color', 'inherit');
}

function useFavorites() {
    console.log('useFavorites');
    $('#dashboard-sidebar').css('color', 'inherit');
    $('#filemanager-sidebar').css('color', 'inherit');
    $('#favorites-sidebar').css('color', '#337ab7');
    $('#appinfo-sidebar').css('color', 'inherit');
}

function useAppinfo() {
    console.log('useAppinfo');
    $('#dashboard-sidebar').css('color', 'inherit');
    $('#filemanager-sidebar').css('color', 'inherit');
    $('#favorites-sidebar').css('color', 'inherit');
    $('#appinfo-sidebar').css('color', '#337ab7');
}

function handleClientStatus() {

    // CPU Usage
    os.cpuUsage(function (v) {
        v = parseInt(v * 100)
        $('#cpu-usage').html(`
            <span class="label label-primary pull-right">${v}%</span>
            <p>CPU Usage</p>
            <div class="progress progress-sm">
                <div class="progress-bar progress-bar-primary" style="width: ${v}%;">
                    <span class="sr-only">${v}%</span>
                </div>
            </div>
        `);
    });

    // Disk Usage 
    let maxSize = 200// Max Size 200MB 
    let data = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
    let tree_file = JSON.parse(data);
    let files = tree_file.files;
    let totalSize = 0;

    Object.keys(files).forEach(function (key) {
        totalSize += files[key]['size'];
    })

    totalDisk = parseInt(100 * totalSize / (maxSize * 1024 * 1024));

    setTimeout(() => {
        $('#disk-usage').html(`
            <span class="label label-purple pull-right">${totalDisk}%</span>
            <p>Disk Usage</p>
            <div class="progress progress-sm">
                <div class="progress-bar progress-bar-purple" style="width: ${totalDisk}%;">
                    <span class="sr-only">${totalDisk}%</span>
                </div>
            </div>`
        )
    }, 1000);

}

function loadUserInfo() {
    localStorage.setItem("email", user_info.email)
    localStorage.setItem("last_name", user_info.last_name)
    localStorage.setItem("first_name", user_info.first_name)
    document.getElementById('user_name').innerHTML = user_info.last_name + ' ' + user_info.first_name
    document.getElementById('user_email').innerHTML = user_info.email
}

function checkLogin() {
    access_token = localStorage.getItem('access_token')

    if (access_token == null) {
        // window.location.replace("./login.html");
    }
    axios.get('http://127.0.0.1:8000/api/user',
        {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        }
    )
    .then((res) => {
        data = res.data
        user_info.email = data['email']
        user_info.first_name = data['first_name']
        user_info.last_name = data['last_name']
        loadUserInfo()
    })
    .catch((error) => {
        console.error(error)
        // window.location.replace("./login.html");
    })

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

function activityWatcher() {

    //The number of seconds that have passed
    //since the user was active.
    var secondsSinceLastActivity = 0;

    //Five minutes. 60 x 5 = 300 seconds.
    var maxInactivity = (60 * 5);

    //Setup the setInterval method to run
    //every second. 1000 milliseconds = 1 second.
    setInterval(function () {
        secondsSinceLastActivity++;
        // console.log(secondsSinceLastActivity + ' seconds since the user was last active');
        //if the user has been inactive or idle for longer
        //then the seconds specified in maxInactivity
        if (secondsSinceLastActivity > maxInactivity) {
            // console.log('User has been inactive for more than ' + maxInactivity + ' seconds');
            //Redirect them to your logout.php page.
            location.href = './lock-screen.html';
        }
    }, 1000);

    //The function that will be called whenever a user is active
    function activity() {
        //reset the secondsSinceLastActivity variable
        //back to 0
        secondsSinceLastActivity = 0;
    }

    //An array of DOM events that should be interpreted as
    //user activity.
    var activityEvents = [
        'mousedown', 'keydown',
        'scroll', 'touchstart'
    ];

    //add these events to the document.
    //register the activity function as the listener parameter.
    activityEvents.forEach(function (eventName) {
        document.addEventListener(eventName, activity, true);
    });


}

function renderModalMoreDetals(data) {

    var show_data = ""
    let i = 0;
    for (let d of data){
        show_data += `
        <tr>
            <th scope="row">${i++}</th>
            <td>${d.ip}</td>
            <td>${d.device_info}</td>
            <td>${d.login_time}</td>
        </tr>
        `
    }

    show_data = `
    <table class="table">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">IP</th>
                <th scope="col">Device</th>
                <th scope="col">Login Time</th>
            </tr>
        </thead>
        <tbody>
            ${show_data}
        </tbody>
    </table>`

    show_data =  `
    <div class="modal fade" id="modal_details" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document" style = "width:800px">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel"> Device Infomations</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                        ${show_data}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>`

    var elem = document.createElement('div');
    elem.innerHTML = show_data
    document.body.appendChild(elem)
}

function showMoreDetails() {

    access_token = localStorage.getItem('access_token')

    if (access_token == null) {
        window.location.replace("./login.html");
    }
    axios.get('http://127.0.0.1:8000/api/login_history',
        {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        }
    )
    .then((res) => {
        data = res.data
        renderModalMoreDetals(data)
    })
    .catch((error) => {
        console.error(error)
        // window.location.replace("./login.html");
    })

}

function getNumFilesByType(type){
    let media_extensions = ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'wmv', 'flv', 'avi', 'webm', 'mp3', 'm4a', 'flac', 'wav', 'wma', 'aac'];
    let document_extensions = ['doc', 'docm', 'docx', 'dot', 'dotm', 'dotx', 'htm', 'html', 'mht', 'mhtml', 'odt', 'pdf', 'rtf', 'txt', 'wps', 'xml', 'xps'];
    let zip_extensions = ['zip', 'rar', 'tar']

    let file_extensions;
    if (type == 'media') {
        file_extensions = media_extensions;
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

    return Object.keys(filtered_files).length;
}

function showProfile(){
    axios.get('http://127.0.0.1:8000/api/login_history',
        {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        }
    )
    .then((res) => {
        let data = res.data 

        let maxSize = 200// Max Size 200MB 
        let datafile = fs.readFileSync(path.resolve(__dirname, "..\\app-data\\map.json"), 'utf8')
        let tree_file = JSON.parse(datafile);
        let files = tree_file.files;
        let totalSize = 0;
        Object.keys(files).forEach(function (key) {
            totalSize += files[key]['size'];
        })
        totalDisk = parseInt(100 * totalSize / (maxSize * 1024 * 1024));

        let profile_data = `
        <div class="card-container">
            <div class="upper-container">
                <div class="image-container">
                    <img class = "img-card" src="img/1.png">
                </div>
            </div>
            <div class="lower-container">
                <div>
                    <h3 class = "h3-card">${user_info.last_name} ${user_info.first_name}</h3>
                    <h4 class = "h4-card">${user_info.email}</h4>
                </div>  
                <div class="row-card" style = "font-size: 20px; font-weight: bold; padding-top: 12px; color: #2a9df4">
                    <div class="column-card-5">${Object.keys(files).length}</div>
                    <div class="column-card-5">${totalDisk}/500</div>
                </div>
                <div class="row-card" style = "font-size: 14px; color: dimgray">
                    <div class="column-card-5">Files</div>
                    <div class="column-card-5">MB</div>
                </div>
                <div class="row-card" style = "font-size: 20px; font-weight: bold; padding-top: 20px; color: #2a9df4">
                    <div class="column-card-3">${getNumFilesByType('document')}</div>
                    <div class="column-card-3">${getNumFilesByType('media')}</div>
                    <div class="column-card-3">${getNumFilesByType('zip')}</div>
                </div>
                <div class="row-card" style = "font-size: 14px; color: dimgray">
                    <div class="column-card-3">Docs</div>
                    <div class="column-card-3">Media</div>
                    <div class="column-card-3">Zips</div>
                </div>
                <div class="row-card" style = "font-size: 16px; font-weight: bold; padding-top: 25px; color: #2a9df4">
                    <div class="column-card-5">Login Time</div>
                    <div class="column-card-5">Device Name</div>
                </div>
                <div class="row-card" style = "font-size: 14px; color: gray">
                    <div class="column-card-5">${data[0].login_time}</div>
                    <div class="column-card-5">${data[0].device_info}</div>
                </div>
                <div style = "display : inline-flex;">
                    <a id = "change-password" class="btn">Change Password</a>
                    <a id = "close-profile" class="btn-exit">Close</a>
                </div>
            </div>
        </div>
        `

        if (document.getElementById("view-profiles")){
            document.getElementById("view-profiles").remove()
        }

        
        var elem = document.createElement('div');
        elem.id = "view-profiles"
        elem.innerHTML = profile_data
        elem.style = "top: 50%; left: 50%; position: fixed;"
        document.body.appendChild(elem)
        
        $('#close-profile').click(() => {
            if (document.getElementById("view-profiles")){
                document.getElementById("view-profiles").remove()
            }
        })
        $('#change-password').click(showChangePassword)
    })
    .catch((error) => {
        console.error(error)
        // window.location.replace("./login.html");
    })

}

function showChangePassword(){
    change_password_data = `
    <div class = "change-password-container">
        <form
            id="demo-bv-bsc-tabs"
            class="form-horizontal"
            action="#"
            method="post"
        >
            <div class="tab-content">
                <div class="tab-pane pad-btm fade in active" id="demo-bsc-tab-1">
                    <p class="text-main text-bold" style="
                        text-align: center;
                        padding-top: 20px;
                        font-size: 16px;
                    ">Change Password</p>
                    <a id = "exit-change-password" style="
                        right: 4%;
                        position: absolute;
                        font-size:  20px;
                        top: 6%;
                    " >✘</a>
                    <hr>
                    <div class="form-group">
                        <label class="col-lg-3 control-label">Old Password</label>
                        <div class="col-lg-7">
                            <input
                                type="text"
                                class="form-control"
                                id = "change_password_old_password"
                                name="old_password"
                                placeholder="old password"
                            >
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-lg-3 control-label">New Password</label>
                        <div class="col-lg-7">
                            <input
                                type="text"
                                class="form-control"
                                id = "change_password_password"
                                name="password"
                                placeholder="new password"
                            >
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-lg-3 control-label">New Password</label>
                        <div class="col-lg-7">
                            <input
                                type="text"
                                class="form-control"
                                id = "change_password_password2"
                                name="password2"
                                placeholder="retype new password"
                            >
                        </div>
                    </div>
                </div>
                <div class="tab-footer clearfix">
                    <div class="">
                        <button id = "change_password_submit" type = "button" class="btn btn-primary" style="padding-left: 5%;padding-right: 5%;margin-left: 42%;text-align: center;">Change</button>
                    </div>
                </div>
            </div>
        </form>
    </div>`

    if (document.getElementById("change-password-view")){
        document.getElementById("change-password-view").remove()
    }

    
    var elem = document.createElement('div');
    elem.id = "change-password-view"
    elem.innerHTML = change_password_data
    elem.style = "top: 50%; left: 50%; position: fixed;"
    document.body.appendChild(elem)

    $('#exit-change-password').click(() => {
        document.getElementById("change-password-view").remove()
    })

    $('#change_password_submit').click(changePassword)
}

function changePassword(){
    old_password = $('#change_password_old_password').val()
    password = $('#change_password_password').val()
    password2 = $('#change_password_password2').val()

    axios.post('http://127.0.0.1:8000/api/change_password',
    {
        old_password: old_password,
        password: password,
        password2: password2
    },
    {
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        }
    }
    )
    .then((res) => {
        showAlert("Success", res.data['messages'], "success")
        document.getElementById("change-password-view").remove()
        // location.href = './login.html';
    })
    .catch((error) => {
        if (error.response) {
            /*
            * The request was made and the server responded with a
            * status code that falls out of the range of 2xx
            */
            error_data = error.response.data['error_messages']
            if (typeof error_data == "string"){
                showAlert("Warning", error_data, "danger")
            }
            else{
                error_issue = Object.keys(error_data)
                console.log(error_data)
                console.log(error_issue)
                warning_message = ""
                error_issue.forEach(element => {
                    console.log(element, error_data[element])
                    warning_message += `<p> <b>${element}</b> ${error_data[element]} </p>`
                });
                showAlert("Warning", warning_message, "danger")
            }
            
        } 
        else if (error.request) {
            /*
            * The request was made but no response was received, `error.request`
            * is an instance of XMLHttpRequest in the browser and an instance
            * of http.ClientRequest in Node.js
            */
            console.log(error.request);
        } 
        else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
        }
    })
}

server_status = $('#server_status')

function checkServerStatus(){
    axios.get('http://127.0.0.1:8000/api/check_connection')
    .then((res) => {
        server_status.css('background-color', '#46cb18')
        server_status.text('✔')
    })
    .catch((error) => {
        server_status.css('background-color', 'red')
        server_status.text('✘')
    })
}