window.onload = function() {
    var login_form = document.querySelector("div.login form");

    login_form.addEventListener("submit", function(event) {
        event.preventDefault();
        var user = document.getElementById("username").value;
        var pass = document.getElementById("password").value;
        var first = document.getElementById("first_name").value;
        var last = document.getElementById("last_name").value;
        var email = document.getElementById("email").value;
        
        fetch(login_form.action, {
            method: 'POST',
            headers: {
            "Content-Type": "application/json" },
            body: JSON.stringify({"username":  user, "password": pass, "first_name": first, "last_name":last, "email":email})
        }).then((res) => res.json()).then(function(res){
            if(res.error) {
                alert('Register failed. ' + res.error);
                //window.location = "http://localhost:5000/airline/register";
            } else {
                //toggleLogin();
                window.location = "http://localhost:5000" + res.url;
            }
        });
    })
}


function toggleLogin() {
    var login_but = document.querySelector(".menu ul > li:nth-child(4) > a");
    console.log(login_but.innerHTML);
    //if(login_form)
}