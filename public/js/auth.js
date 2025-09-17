
// domcontedLoaded for login 
document.addEventListener('DOMContentLoaded', () => {
    // get the id of the form and validate the form (option chaining) 
    document.getElementById('loginForm')?.addEventListener('submit', async(e) => {
        e.preventDefault();

        // get the username and password values
        const username  = document.getElementById('username').value;
        const password  = document.getElementById('password').value;

        // form validation 
        if (!username || !password ) {
            alert('input all fields');
            return;
        }

       try {
    const response = await fetch('/api/auth/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json(); 
    const {status, message} = data;

    console.log(status, message);
    
    


 

} catch (error) {
    console.error("Fetch error:", error);
}

    })
    //
})

// domcontentLoaded for register
document.addEventListener('DOMContentLoaded', () => {
        // get the username and password values
        
        // form validation 
    
        // fetch request to the server
})
