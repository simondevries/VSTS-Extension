var dayOfWeek =document.getElementsByTagName('div');
for (var i = 0, l = dayOfWeek.length; i < l; i++) {
  if(dayOfWeek != undefined && dayOfWeek != null &&
    dayOfWeek.innerHTML != undefined && dayOfWeek.innerHTML != null &&
    dayOfWeek.innerHTML.includes("Google")){
    dayOfWeek.innerHTML = "losssl.jpg";
  }
}

// var images = document.getElementsByTagName('img');
// for (var i = 0, l = images.length; i < l; i++) {
//   images[i].src = 'http://placekitten.com/' + images[i].width + '/' + images[i].height;
// }
