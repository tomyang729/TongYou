var matchPassword = function () {
    var pass1 = document.getElementById('pass1').value;
    var pass2 = document.getElementById('pass2').value;

    if (pass1 != pass2) {
        document.getElementById("pass1").style.borderColor = "#E34234";
        document.getElementById("pass2").style.borderColor = "#E34234";
        console.log(pass1);
        console.log(pass2);
        return false;
    } else {
        document.getElementById("pass1").style.borderColor = "green";
        document.getElementById("pass2").style.borderColor = "green";
        return true;
    }
};