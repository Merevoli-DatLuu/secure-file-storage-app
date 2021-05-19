$('#register_submit').click(handleRegister)

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

function validate_password(data){
    warning_message = ""
    if (data.password != data.password2){
        warning_message += `<p> <b>password</b> and confirm password not match. </p>`
    }
    if (data.password == ""){
        warning_message += `<p> <b>password</b> field can't be blank. </p>`
    }
    if (data.email == ""){
        warning_message += `<p> <b>email</b> field can't be blank. </p>`
    }
    if (data.first_name == ""){
        warning_message += `<p> <b>first</b> name field can't be blank. </p>`
    }
    if (data.last_name == ""){
        warning_message += `<p> <b>last</b> name field can't be blank. </p>`
    }

    if (warning_message != ""){
        showAlert("warning", warning_message, "danger")
    }

    return true
}

function handleRegister() {
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
            showAlert("Success", "register successful", "success")
            message = response.data['message']
            console.log(response.data)
            let data_map = response.data['data_map']
            
            fs.writeFileSync('app-data/map.json', JSON.stringify(data_map))
            
            window.location.replace("./login.html");
        }
    })
    .catch((error) => {
        if (error.response) {
            error_data = error.response.data['error_messages']
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

