
// domcontedLoaded for login 
document.addEventListener('DOMContentLoaded', () => {
    // get the id of the form 
    // validate the form (option chaining)
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

        // fetch request to the server
        try {
            const response = await fetch('')
        } catch (error) {
            
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
