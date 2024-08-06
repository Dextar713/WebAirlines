let slideIndex = 0;
//showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  let prev_slide = slideIndex;
  slideIndex += n; 
  showSlides(prev_slide);
}

// Thumbnail image controls
/*
function currentSlide(n) {
  showSlides(slideIndex = n);
}
*/

function showSlides(prev_slide) {
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");
  //console.log(slides);
  slideIndex %= slides.length;
  slides[prev_slide].style.display = "none";
  dots[prev_slide].className = dots[prev_slide].className.replace(" active", "");
  slides[slideIndex].style.display = "block";
  dots[slideIndex].className = "dot active";
  /*
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  */
}


function initImg() {
  var slides = document.querySelectorAll('.flights-show .slide');
  let sz = slides.length;
  for(let i=0; i<sz; i++) {
    slides[i].style.display = "none";
  }
  slides[0].style.display = "block";
  let dots = document.querySelectorAll('.dot');
  dots[0].className = 'dot active';
}


window.onload = function() {
  initImg();
  setInterval(() => plusSlides(1), 2000);
}


// &#9776;