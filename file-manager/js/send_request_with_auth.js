const axios = require('axios')

const refresh_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTYxOTQxMTgyMiwianRpIjoiYzQ4ZTYyNDYyYzVlNDIwNDlmOGQ0NDU4MTg2YTVlNTUiLCJ1c2VyX2lkIjo3fQ.Y8NeATAo4JgOs5z8KnaqmJPfYWadvjyspf7D-YQcHy8'

const invalid_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjE5MzI5MDIyLCJqdGkiOiIwZWQ4NzE5OWFjNzk0YTIzYTZjNjZkNDJlNTJlOTczMyIsInVzZXJfaWQiOjd9.g6FUnfAo2UsSa3qqiyBzkjF8Th1jbtBj-Terg5g4WtY'
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjE5MzMzOTk2LCJqdGkiOiI5ZWZkYWUzYjJmZjY0YjAxYTNhOWIyNmZmMjBkNDk2YiIsInVzZXJfaWQiOjd9.vynabZZOzJu_FBne6EavLeF-zUPq4eC5zXG_eLDZlFY'



axios.post('http://127.0.0.1:8000/api/test_auth',
    {
        data: "test data"
    },
    {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }
)
.then((res) => {
    console.log(res.data)
})
.catch((error) => {
    console.error(error)
})