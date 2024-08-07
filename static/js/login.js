function sendCredentials() {
    var login_form = document.querySelector("div.login form");
    login_form.addEventListener("submit", async function(event) {
        event.preventDefault();
    })
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    fetch(login_form.action, {
        method: "post",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            "username": user,
            "password": pass 
        })
    }).then((res) => res.json()).then(function(res){
        if(res.error) {
            alert('Login failed. ' + res.error);
            //window.location = "http://localhost:5000/airline/register";
        } else {
            //toggleLogin();
            window.location.href = window.location.href.slice(0, window.location.href.length - 6);
        }
    });
}


function toggleLogin() {
    var login_but = document.querySelector(".menu ul > li:nth-child(4)");
    if(login_but.firstChild.innerHTML==="Login") {
        login_but.firstChild.innerHTML = "Dex";
    }
}