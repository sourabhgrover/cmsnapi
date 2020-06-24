var copyTextareaBtn = document.querySelector("#copyButton");
console.log(copyTextareaBtn);


for (var i=0, max =copyTextareaBtn.clientHeight; i<max; i++){
  copyTextareaBtn.addEventListener("click", copyLink, false)
}


function copyLink(e){
  if (e.target !== e.currentTarget) {
    var copyTextarea = document.querySelector(".copytextarea");
    console.log(copyTextarea);
    copyTextarea.focus();
    copyTextarea.select();
    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      console.log("Copying text command was " + msg);
    } catch (err) {
      console.log("Oops, unable to copy");
    }
  }
  e.stopPropagation;
}

