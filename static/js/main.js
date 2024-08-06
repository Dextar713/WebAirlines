function toggle() {
    var toggle_menu = document.querySelector(".menu > ul");
    var toggle_but = document.querySelector(".menu > button");
    var but_span = document.querySelector(".menu > button > span");
    if(toggle_but.className=="dropdown") {
        toggle_menu.style.display = "block";
        toggle_but.className = "close";
        but_span.innerHTML = "&#10005;";
        but_span.style.color = "white";
        toggle_but.style.color = "white";
    } else {
        toggle_menu.style.display = "none";
        but_span.innerHTML = "&#9776;";
        but_span.style.color = "white";
        toggle_but.className = "dropdown";
    }
}

function adjustNav() {
    var toggle_menu = document.querySelector(".menu > ul");
    var toggle_but = document.querySelector(".menu > button");
    var but_span = document.querySelector(".menu > button > span");
    //var mainNav = document.querySelector(".main-nav");
    if(window.innerWidth>=800) {
        toggle_menu.style.display = "flex";
        but_span.innerHTML = "&#9776;";
        but_span.style.color = "white";
        toggle_but.className = "dropdown";
    } else {
        toggle_menu.style.display = "none";
    }
}

window.onresize = adjustNav;