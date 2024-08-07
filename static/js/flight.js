window.onload = function() {
    var book_form = document.querySelector("#reserve");
    
    book_form.addEventListener("submit", function(event) {
        event.preventDefault();
        var people_num = parseInt(document.getElementById("cnt_people").value);
        
        fetch(book_form.action, {
            method: 'POST',
            headers: {
            "Content-Type": "application/json" },
            body: JSON.stringify({"cnt_people":  people_num})
        }).then((res) => res.json()).then(function(res){
            if(res.error) {
                alert('Reservation failed. ' + res.error);
                //window.location = "http://localhost:5000/airline/register";
            } else {
                alert("Reservation successfull))")
                window.location.reload();
            }
        });
    }) 
}