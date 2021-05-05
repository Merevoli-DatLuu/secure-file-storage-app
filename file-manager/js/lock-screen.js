$(document).ready(loadingLockScreen());

function loadingLockScreen(){
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('access_token')
    email = localStorage.getItem('email')
    last_name = localStorage.getItem('last_name')
    first_name = localStorage.getItem('first_name')
    
    if (email == null || last_name == null || first_name == null){
        alert("Something's wrong. Please login")
        return false
    }
    
    document.getElementById('user_email').innerHTML = email
    document.getElementById('user_name').innerHTML = `${last_name} ${first_name}`
}

$('#lock_screen_submit').click(handleLockScreen)

function handleLockScreen() {
    email = localStorage.getItem('email')
    password = document.getElementById('password').value
    device_info = `${os_info.arch()} - ${os_info.platform()} - ${os_info.version()} - ${os_info.hostname()}`

    if (password == ""){
        return false
    }
    if (email == null){
        alert("Something's wrong. Please login")
        return false
    }


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
            window.location.replace("./app-file-manager.html");
        }
    })
    .catch((error) => {
        if (error.response) {
            /*
            * The request was made and the server responded with a
            * status code that falls out of the range of 2xx
            */
            error_data = error.response.data['error_messages']
            error_issue = Object.keys(error_data)
            console.log(error_data)
            console.log(error_issue)
            error_issue.forEach(element => {
                console.log(element, error_data[element])
            });
            
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

