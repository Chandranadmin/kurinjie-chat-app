/**
 * Created by Chandran on 01-12-2015.
 */

/* Javascript chat popup function */
function showhide()
{
    var chat = document.getElementById("nameForm");
    var up=document.getElementById("up");
    var down=document.getElementById("down");
    if (chat.style.display !== "none") {
        chat.style.display = "none";
        up.style.display = "block";
        down.style.display = "none";
    }
    else {
        chat.style.display = "block";
        up.style.display = "none";
        down.style.display = "block";
    }
}


function validate()
{try{

    var email = document.myform.email.value;
    alert(email);
    atpos = email.indexOf("@");
    dotpos = email.lastIndexOf(".");

    if (atpos < 1 || ( dotpos - atpos < 2 ))
    {
        document.myForm.email.focus() ;
        return false;
    }
}
    catch(e){
        alert("Please enter correct email ID");
    }
}