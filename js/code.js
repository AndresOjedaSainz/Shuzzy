const urlBase = 'https://shuzzy.top/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;

	if (!validLogin(login, password)) {
        document.getElementById("loginResult").innerHTML = "Username / Password is incorrect!";
        return;
    }
	
	var hash = md5( password );
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "dashboard.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function doRegister()
{
	firstName = document.getElementById("registerFirstName").value;
    lastName = document.getElementById("registerLastName").value;
    let username = document.getElementById("registerUsername").value;
    let password = document.getElementById("registerPassword").value;

    if (!validRegister(firstName, lastName, username, password)) {
        document.getElementById("registerResult").innerHTML = "invalid registry";
        return;
    }

    var hash = md5(password);

    document.getElementById("registerResult").innerHTML = "";

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        login: username,
        password: hash
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

try {
        xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;

            if (this.status == 409) {
                document.getElementById("registerResult").innerHTML = "User already exists";
                return;
            }

            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                if (jsonObject.error) {
                    document.getElementById("registerResult").innerHTML = jsonObject.error;
                } else {
                    document.getElementById("registerResult").innerHTML = "Registration successful! Redirecting...";
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                }
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("registerResult").innerHTML = err.message;
    }
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

// Go through all possible failed logins returns true if valid login
function validLogin(login, password) {
    let errors = [];
    
    if (!login) {
        errors.push("Username required");
    } else {
        const regex = /^[A-Za-z0-9]{8,32}$/;
        if (!regex.test(login)) {
            errors.push("Username: 8-32 alphanumeric characters");
        }
    }
    
    if (!password) {
        errors.push("Password required");
    } else {
        const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,32}$/;
        if (!regex.test(password)) {
            errors.push("Password: 8-32 characters with letters and numbers");
        }
    }
    
    if (errors.length > 0) {
        document.getElementById("loginResult").innerHTML = errors.join("<br>");
        return false;
    }
    return true;
}
// Go thorugh all possible failed registrations returns true if valid register
function validRegister(fName, lName, user, pass) {
    let errors = [];

    if (!fName) errors.push("First name required");
    if (!lName) errors.push("Last name required");
    
    if (!user) {
        errors.push("Username required");
    } else if (!/(?=.*[A-Za-z]).{8,32}/.test(user)) {
        errors.push("Username: 8-32 chars with letters");
    }

    if (!pass) {
        errors.push("Password required");
    } else if (!/(?=.*[A-Za-z]).{8,32}/.test(pass)) {
        errors.push("Password: 8-32 chars with letters");
    }

    if (errors.length > 0) {
        document.getElementById("registerResult").innerHTML = errors.join("<br>");
        return false;
    }
    return true;
}

// Render contacts to the page
function renderContacts(contactsArray) {
    if (contactsArray.length === 0) {
        contactsContent.innerHTML = '<div class="empty-contacts">No contacts match your search.</div>';
        return;
    }
            
    let html = '';
    contactsArray.forEach(contact => {
        html += `
            <div class="contact-row">
                <div class="name-cell">${contact.firstName} ${contact.lastName}</div>
                <div class="phone-cell">${contact.phone}</div>
                <div class="email-cell">${contact.email}</div>
                <div class="date-cell">${contact.date}</div>
                <div class="actions-cell">
                    <button class="button button-danger" onclick="deleteContact(${contact.id})">Delete</button>
                </div>
            </div>
        `;
    });
     
    contactsContent.innerHTML = html;
}

// Add a new contact
function addContact() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
 
    if (!firstName || !lastName || !phone || !email) {
        formMessage.textContent = "Please fill in all fields";
        formMessage.style.color = "#ffeb3b";
        return;
    }

    // Create new contact object
    const newContact = {
        id: contacts.length + 1,
        firstName,
        lastName,
        phone,
        email,
        date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD
    };
    
    // Add to contacts array
    contacts.unshift(newContact); // Add to beginning
 
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
            
    formMessage.textContent = "Contact added successfully!";
    formMessage.style.color = "#4caf50";
            
    // Update UI
    renderContacts(contacts);
    searchInput.value = '';
            
    // Reset message after 3 seconds
    setTimeout(() => {
        formMessage.textContent = '';
    }, 3000);
}
        
// Delete a contact
function deleteContact(contactId) {
    if (confirm("Are you sure you want to delete this contact?")) {
        contacts = contacts.filter(contact => contact.id !== contactId);
        renderContacts(contacts);
    }
}
