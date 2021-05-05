const { access } = require("fs");

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

    document.body.innerHTML += show_data
}

function showMoreDetails() {

    access_token = localStorage.getItem('access_token')

    if (access_token == null) {
        // window.location.replace("./login.html");
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