const { cleanData } = require("jquery");


console.log(1)
$('#resgister_submit').click(handleResgister)

function validate_password(data){
    if (data.password != data.password2 || data.password == ""){
        return false;
    }
    if (data.email == ""){
        return false;
    }
    if (data.first_name == ""){
        return false
    }
    if (data.last_name == ""){
        return false
    }

    return true
}

function handleResgister() {
    var email = document.getElementById('email').value
    var first_name = document.getElementById('first_name').value
    var last_name = document.getElementById('last_name').value
    var password = document.getElementById('password').value
    var password2 = document.getElementById('password2').value

    var data = {
        email: email,        
        first_name: first_name,
        last_name: last_name,
        password: password,        
        password2: password2
    }

    var valid = true
    if (!validate_password(data)){
        valid = false
    }

    const request = (async (data) => await axios.post('http://127.0.0.1:8000/api/register', data)
    .then(response => {
        if (response.status == 201){
            message = response.data['message']
            console.log(message)

            //window.location.replace("./app-file-manager.html");
        }
    })
    .catch((error) => {
        if (error.response) {
            console.log(error.response.data['error_messages'])
            error_data = error.response.data['error_messages']
            error_issue = Object.keys(error_data)
            console.log(error_data)
            console.log(error_issue)
            error_issue.forEach(element => {
                console.log(element, error_data[element])
            });
            
        } 
        else if (error.request) {
            console.log(error.request);
        } 
        else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
        }
    }))

    
    if (valid){
        request(data)
    }
}

