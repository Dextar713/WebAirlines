//localStorage.clear();
//localStorage.setItem("max", 0);
//localStorage.setItem("fav", "Nothing");
window.onload = function() {
    var form = document.getElementById("hotels");
    //localStorage.clear();
    form.addEventListener("submit", function(event) {
        //var input_val = form.firstChild.nextSibling.value;
        var input_val = document.getElementById("hotel").value;
        var prev_cnt = localStorage.getItem(input_val);
        alert(parseInt(prev_cnt)+1);
        var cur_val;
        if(prev_cnt) {
            localStorage.removeItem(input_val);
            localStorage.setItem(input_val, parseInt(prev_cnt)+1);
            cur_val = prev_cnt + 1;
        } else {
            localStorage.setItem(input_val, 1);
            cur_val = 1;
        }
        if(cur_val>=localStorage.getItem("max")) {
            localStorage.removeItem("max");
            localStorage.removeItem("fav");
            localStorage.setItem("max", cur_val);
            localStorage.setItem("fav", input_val);
        }
    })
    var newDiv = document.createElement("div");
    newDiv.classList.add("fav");
    const newContent = document.createTextNode("Favourite hotel location: " + localStorage.getItem("fav"));


    newDiv.appendChild(newContent);

    const search_bar = document.getElementsByClassName("find_hotels")[0];
    document.body.insertBefore(newDiv, search_bar);
}