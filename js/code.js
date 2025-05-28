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
	var hash = md5( password );

	if (!validLogin(login, password)) {
        document.getElementById("loginResult").innerHTML = "Username / Password is incorrect!";
        return;
    }
	
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
	firstName = document.getElementById("firstName").value;
    lastName = document.getElementById("lastName").value;

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

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

            if (this.readyState != 4) {
                return;
            }

            if (this.status == 409) {
                document.getElementById("registerResult").innerHTML = "User already exists";
                return;
            }

            if (this.status == 200) {

                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;
                document.getElementById("registerResult").innerHTML = "User added";
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;
                saveCookie();
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
function validLogin(logName, logPass) {

    var logNameErr = logPassErr = true;

    if (logName == "") {
        console.log("Please Fill In a Username");
    }
    else {
        var regex = /(?=.*[A-Za-z]).{8,32}/;

        if (regex.test(logName) == false) {
            console.log("Username Contains Invalid Information");
        }

        else {

            console.log("Username is Valid!");
            logNameErr = false;
        }
    }

    if (logPass == "") {
        console.log("Please Fill In a Password");
        logPassErr = true;
    }
    else {
        var regex = /(?=.*[A-Za-z]).{8,32}/;

        if (regex.test(logPass) == false) {
            console.log("Password Contains Invalid Information");
        }

        else {

            console.log("Password is Valid!");
            logPassErr = false;
        }
    }

    if ((logNameErr || logPassErr) == true) {
        return false;
    }
    return true;

}

// Go thorugh all possible failed registrations returns true if valid register
function validRegister(fName, lName, user, pass) {

    var fNameErr = lNameErr = userErr = passErr = true;

    if (fName == "") {
        console.log("Please Fill In a First Name");
    }
    else {
        console.log("First Nameis Valid!");
        fNameErr = false;
    }

    if (lName == "") {
        console.log("Please Fill In a Last Name");
    }
    else {
        console.log("Last Name is Valid!");
        lNameErr = false;
    }

    if (user == "") {
        console.log("Please Fill In a Username");
    }
    else {
        var regex = /(?=.*[A-Za-z]).{8,32}/;

        if (regex.test(user) == false) {
            console.log("Username Contains Invalid Information");
        }

        else {

            console.log("Username is Valid!");
            userErr = false;
        }
    }

    if (pass == "") {
        console.log("Please Fill In a Password");
    }
    else {
        var regex = /(?=.*[A-Za-z]).{8,32}/;

        if (regex.test(pass) == false) {
            console.log("Password Contains Invalid Information");
        }

        else {

            console.log("Password is Valid!");
            passErr = false;
        }
    }

    if ((fNameErr || lNameErr || userErr || passErr) == true) {
        return false;

    }

    return true;
}
