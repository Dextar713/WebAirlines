window.onload = function() {
    var inp = document.getElementById('start_date');
    inp.addEventListener('select', function() {
    this.selectionStart = this.selectionEnd;
    }, false);

    var header = document.getElementsByTagName("header")[0];
    header.style.position = "static";
}

