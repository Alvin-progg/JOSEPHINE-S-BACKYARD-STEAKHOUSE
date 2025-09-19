//reusable  SweetAlert2 for better alert messages


const alertMessage = (type, title, text, timer=1500) => {
    Swal.fire({
        icon: type,
        title: title,
        text: text,
        timer: timer,
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false,
    })
}
const successMessage = async(title, text, timer=1500) => {
    Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        timer: timer,
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false,
    })
}


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            alertMessage('error', 'Validation Error', 'Please fill in all required fields.', 1200);
            e.target.reset();
            return;
        }

        try {
            const response = await fetch('/api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });

            // parse to raw text and parse it to json
            const text = await response.text();


            const data = text ? JSON.parse(text) : {};

            console.log(data);
            
            if (!response.ok) {
                alertMessage('error', 'Login Failed', data.message || 'Something went wrong.', 2000);
                e.target.reset();
                return;
            }

            // Success
            await successMessage('Login Successful', data.message || 'You have successfully logged in.', 2000);

        } catch (error) {
            alertMessage('error', 'Login Failed', error.message, 2000);
            e.target.reset();
        }
    });
});


// domcontentLoaded for register
document.addEventListener('DOMContentLoaded', () => {

 

    // get the id of the form and validate the form (option chaining) 
    document.getElementById('registerForm')?.addEventListener('submit', async(e) => {
        e.preventDefault();
        // get the username and password values
        const username  = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password  = document.getElementById('password').value;

        // form validation 
        if (!username || !password ||!email) {
            alertMessage('error', 'Validation Error', 'Please fill in all required fields.', 1200);
            return;
        }

       try {
    const response = await fetch('/api/register/register.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ username,email,  password })
    });

    if (!response.ok) {
       alertMessage('error', 'Registration Failed', `Server error: ${response.status}`, 2000);
       return;
    }
    const data = await response.json();    
    console.log(data);
} catch (error) {
      alertMessage('error', 'Login Failed', error.message   , 2000);

    }
})
});