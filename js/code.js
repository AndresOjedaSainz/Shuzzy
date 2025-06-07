const urlBase = 'https://shuzzy.top/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";
    
    let login = document.getElementById("loginName").value;
    let password = document.getElementById("loginPassword").value;

    if (!validLogin(login, password)) {
        return;
    }
    
    var hash = md5(password);
    document.getElementById("loginResult").innerHTML = "";

    let tmp = {login:login, password:hash};
    let jsonPayload = JSON.stringify(tmp);
    
    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let jsonObject;
                    try {
                        jsonObject = JSON.parse(xhr.responseText);
                    } catch (e) {
                        console.error("Error parsing login JSON response:", e, xhr.responseText);
                        document.getElementById("loginResult").innerHTML = "Login error: Invalid server response.";
                        return;
                    }
                    
                    console.log("Login API Response:", jsonObject); 

                    // Assign to global variables
                    userId = jsonObject.id; 
                    firstName = jsonObject.firstName;
                    lastName = jsonObject.lastName;

                    console.log("Data received from API:", { userId, firstName, lastName }); // DEBUG

                    if (typeof userId === 'undefined' || userId < 1) {
                        console.error("Login API returned invalid userId:", userId); // DEBUG
                        document.getElementById("loginResult").innerHTML = "User/Password combination incorrect or invalid user data.";
                        userId = 0;
                        return;
                    }
                    if (typeof firstName === 'undefined' || typeof lastName === 'undefined') {
                        // Handle potentially missing names, but allow login if ID is fine
                        console.warn("Login API returned undefined firstName or lastName."); // DEBUG
                        firstName = firstName || "";
                        lastName = lastName || "";
                    }
            
                    saveCookie();
            
                    window.location.href = "dashboard.html";
                } else {
                    document.getElementById("loginResult").innerHTML = "Login failed. Status: " + this.status;
                    console.error("Login request failed. Status:", this.status, "Response:", xhr.responseText);
                }
            }
        };
        xhr.send(jsonPayload);
    } catch(err) {
        document.getElementById("loginResult").innerHTML = err.message;
        console.error("Error in doLogin try-catch:", err);
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

function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    let expires = ";expires=" + date.toGMTString();
    let path = ";path=/";

    // Log the values being saved
    console.log("Attempting to save cookie with values:", { userId, firstName, lastName, expires, path }); // DEBUG

    if (typeof userId === 'undefined' || userId < 1) {
        console.error("saveCookie: userId is invalid. Cookie not saved properly.", userId);
        return;
    }

    document.cookie = "userId=" + encodeURIComponent(userId) + expires + path;
    document.cookie = "firstName=" + encodeURIComponent(firstName || "") + expires + path;
    document.cookie = "lastName=" + encodeURIComponent(lastName || "") + expires + path;

    console.log("Cookies should now be set. Current document.cookie:", document.cookie); // DEBUG
}

function readCookie() {
    userId = -1;
    firstName = ""; 
    lastName = "";  

    let data = document.cookie;
    console.log("readCookie: Raw document.cookie string:", data); // DEBUG

    if (data === "") {
        console.log("readCookie: No cookies found."); // DEBUG
    }

    let cookies = data.split(';'); 
    console.log("readCookie: Split cookies array:", cookies); // DEBUG

    for (let k = 0; k < cookies.length; k++) {
        let cookiePair = cookies[k].split('=');
        
        if (cookiePair.length < 2) {
            console.log("readCookie: Skipping malformed cookie part:", cookies[k]); // DEBUG
            continue; 
        }

        let name = cookiePair[0].trim();
        let value = decodeURIComponent(cookiePair.slice(1).join('=')); 

        console.log("readCookie: Processing cookie part - Name:", name, "Value:", value); // DEBUG

        if (name === "userId") {
            userId = parseInt(value);
            if (isNaN(userId)) {
                console.warn("readCookie: userId parsed to NaN, resetting to -1. Original value:", value); //DEBUG
                userId = -1; 
            }
        } else if (name === "firstName") {
            firstName = value;
        } else if (name === "lastName") {
            lastName = value;
        }
    }

    console.log("readCookie: Parsed values from cookies:", { userId, firstName, lastName }); // DEBUG

    const currentPage = window.location.pathname.split("/").pop();
    const unprotectedPages = ["index.html", "login.html", "register.html"];

    if (typeof userId !== 'number' || isNaN(userId) || userId < 1) { 
        console.log(`readCookie: User ID is ${userId} (invalid/not logged in). Current page: ${currentPage}`); // DEBUG
        if (!unprotectedPages.includes(currentPage)) {
            console.log(`readCookie: On protected page '${currentPage}', redirecting to index.html.`); // DEBUG
            window.location.href = "index.html";
        }
        // If on an unprotected page, do nothing (allow user to stay)
    } else { 
        // User is logged in (userId >= 1)
        console.log(`readCookie: User ID is ${userId} (logged in). Current page: ${currentPage}`); // DEBUG
        if (unprotectedPages.includes(currentPage) && currentPage !== "index.html") { 
            // Optional: If logged in and on login.html or register.html, redirect to dashboard
            // console.log(`readCookie: On unprotected page '${currentPage}' while logged in, consider redirecting to dashboard.html.`); // DEBUG
            // window.location.href = "dashboard.html"; // Be careful with redirect loops
        }
        
        let userNameDisplay = document.getElementById("userName"); 
        if (userNameDisplay) {
            userNameDisplay.innerHTML = "Logged in as " + firstName + " " + lastName;
        } else if (!unprotectedPages.includes(currentPage)) {
            // If on a protected page (not login/register/index) and userName element is missing, log it.
            console.warn("readCookie: 'userName' element not found on page:", currentPage);
        }
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

function addContact() {
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const formMessage = document.getElementById('formMessage');

    const fName = firstNameInput.value.trim();
    const lName = lastNameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    if (!fName || !lName || !phone || !email) {
        formMessage.textContent = "Please fill in all fields";
        formMessage.style.color = "#ffeb3b";
        return;
    }

    let tmp = {
        userID: userId,
        firstName: fName,
        lastName: lName,
        phoneNumber: phone,
        emailAddress: email
    };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/AddContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let jsonObject = {};
                try {
                    jsonObject = JSON.parse(xhr.responseText);
                } catch (e) {
                    formMessage.textContent = "Error parsing server response.";
                    formMessage.style.color = "#ff5252";
                    return;
                }

                if (jsonObject.error && jsonObject.error !== "") {
                    formMessage.textContent = "Error: " + jsonObject.error;
                    formMessage.style.color = "#ff5252";
                } else {
                    formMessage.textContent = jsonObject.message || "Contact added successfully!";
                    formMessage.style.color = "#4caf50";

                    firstNameInput.value = '';
                    lastNameInput.value = '';
                    phoneInput.value = '';
                    emailInput.value = '';

                    searchContacts();

                    setTimeout(() => {
                        formMessage.textContent = '';
                    }, 3000);
                }
            } else {
                formMessage.textContent = "Error adding contact. Status: " + this.status;
                try {
                     let jsonObject = JSON.parse(xhr.responseText);
                     if(jsonObject.error) {
                        formMessage.textContent = "Error: " + jsonObject.error;
                     }
                } catch(e) {
                }
                formMessage.style.color = "#ff5252";
            }
        }
    };
    xhr.send(jsonPayload);
}

// Render contacts to the page
function renderContacts(contactsArray) {
    const contactTableBody = document.getElementById("contactTableBody");
    if (!contactTableBody) return;
    contactTableBody.innerHTML = '';
    if (!contactsArray || contactsArray.length === 0) {
        const emptyRow = contactTableBody.insertRow();
        const cell = emptyRow.insertCell();
        cell.colSpan = 5;
        cell.innerHTML = '<div class="empty-contacts">No contacts found. Add one or refine your search.</div>';
        cell.style.textAlign = "center";
        return;
    }
    contactsArray.forEach(contact => {
        const row = contactTableBody.insertRow();
        row.insertCell().textContent = "";                        // USER NAME (not provided by API)
        row.insertCell().textContent = contact.FirstName || "";
        row.insertCell().textContent = contact.LastName || "";
        row.insertCell().textContent = contact.Email || "";
        row.insertCell().textContent = contact.Phone || "";
        const actionsCell = row.insertCell();
        actionsCell.style.textAlign = "center";
        const deleteButton = document.createElement('button');
        deleteButton.className = 'button button-danger';
        deleteButton.innerHTML = '<img src="Images/TrashCan.webp" alt="Delete" style="height: 20px; vertical-align: middle;" title="Delete">';
        deleteButton.onclick = function() { deleteContact(contact.ID); };
        actionsCell.appendChild(deleteButton);
    });
}

function deleteContact(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    let tmp = { tableID: contactId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/DeleteContact.' + extension;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            let jsonObject = {};
            try { jsonObject = JSON.parse(xhr.responseText); } catch(e) {
                alert("Delete failed: Could not parse server response.");
                return;
            }
            if (jsonObject.error && jsonObject.error !== "") {
                alert("Delete failed: " + jsonObject.error);
            } else {
                alert(jsonObject.message || "Contact deleted successfully");
                searchContacts();
            }
        }
    };
    xhr.send(jsonPayload);
}

function searchContacts() {
    const searchInput = document.getElementById("searchInput");
    const searchValue = searchInput ? searchInput.value.trim() : "";

    if (userId < 1 && typeof readCookie === "function") {
        readCookie();
        if (userId < 1) {
            console.log("User not logged in. Cannot search contacts.");
            const contactTableBody = document.getElementById("contactTableBody");
            if (contactTableBody) {
                 contactTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Please log in to view contacts.</td></tr>';
            }
            return;
        }
    }


    let tmp = {
        userId: userId,
        search: searchValue
    };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            try {
                let contactsArray = JSON.parse(xhr.responseText);
                if(contactsArray.error && contactsArray.error !== "") {
                    console.error("Search error:", contactsArray.error);
                    // Display error in the table or as an alert
                    const contactTableBody = document.getElementById("contactTableBody");
                     if (contactTableBody) {
                         contactTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading contacts: ${contactsArray.error}</td></tr>`;
                     }
                } else {
                    renderContacts(contactsArray.results || contactsArray);
                }
            } catch (e) {
                console.error("Error parsing contacts:", e);
                 const contactTableBody = document.getElementById("contactTableBody");
                 if (contactTableBody) {
                     contactTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Error loading contacts. Invalid format.</td></tr>';
                 }
            }
        } else if (this.readyState === 4) {
            console.error("Failed to fetch contacts. Status:", this.status);
             const contactTableBody = document.getElementById("contactTableBody");
             if (contactTableBody) {
                 contactTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Could not load contacts. Server error.</td></tr>';
             }
        }
    };
    xhr.send(jsonPayload);
}

// Called on contacts.html load
document.addEventListener("DOMContentLoaded", () => {
    readCookie();
    
    // Attach search input listener (Add a search input to your HTML if you don't have one)
    // Example: <input type="search" id="searchInput" placeholder="Search contacts...">
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchContacts();
        });
    }

    // Initial load of contacts
    searchContacts(); 
});
