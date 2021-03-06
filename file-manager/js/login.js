$(document).ready(loadingLogin());
$('#login_submit').click(handleLogin)

function loadingLogin(){
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('access_token')
}


function showAlert(action_message, content_message, type, timeout = 2000) {
    $('#alert-open-file').empty()
    $('#alert-open-file').append(`
        <div style="padding: 5px;">
            <div class="alert alert-${type}" id="success-alert" style='margin: 0 auto;' >
                <button type="button" class="close" data-dismiss="alert">x</button>
                <strong>${action_message} </strong> ${content_message}
            </div>
        </div>
    `)

    $("#success-alert").fadeTo(timeout, 500).fadeOut(500, function () {
        $("#success-alert").fadeOut(500);
    });
}

function handleLogin() {
    email = document.getElementById('email').value
    password = document.getElementById('password').value
    device_info = `${os_info.arch()} - ${os_info.platform()} - ${os_info.version()} - ${os_info.hostname()}`

    const request = (async (email, password) => await axios.post('http://127.0.0.1:8000/api/login', {
        email: email,
        password: password,
        device_info: device_info
    })
    .then(response => {
        if (response.status == 200){
            refresh_token = response.data['refresh_token']
            access_token = response.data['access_token']
            console.log(refresh_token, access_token)

            //storage access token and refresh token to local storage
            localStorage.setItem("refresh_token", refresh_token);
            localStorage.setItem("access_token", access_token);

            // Check last user
            // if not have last user or same last user
            // else -> 
            if (email == localStorage.getItem("last_user") || localStorage.getItem("last_user") == null){
                localStorage.setItem("last_user", email)
                localStorage.setItem("last_user_sync", "0")
            }
            else if (email != localStorage.getItem("last_user")){
                localStorage.setItem("last_user", email)
                localStorage.setItem("last_user_sync", "1")

                filePath = path.resolve(__dirname, "..\\app-data\\")
                // gen map
                var map = {}

                map.folders = {
                    "000000": {
                        name: "/",
                        parent: "",
                        create_date: "17/03/2020"
                    }
                }

                map.files = {}

                map.last_submission = "0"
                fs.writeFileSync(path.join(filePath, 'map.json'), JSON.stringify(map))

                const directory = path.join(filePath, 'data');

                var files = fs.readdirSync(directory, { withFileTypes: true })
                for (const file of files) {
                    if (file.name != "temp"){
                        fs.unlinkSync(path.join(directory, file.name))
                    }
                }

            }

            var getKey = () => axios.post('http://127.0.0.1:5000/api/get_key', {
                token: access_token
            })
            .then(GKresponse => {
                if (GKresponse.status == 200){
                    console.log(GKresponse.data)
                    localStorage.setItem('key', GKresponse.data['key'])
                    localStorage.setItem('iv', GKresponse.data['iv'])
                    window.location.replace("./app-file-manager.html");
                }
            })
            .catch(err => showAlert("Error", "Get Key Error", "danger"))

            getKey()

        }
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
    }))

    request(email, password)
}

