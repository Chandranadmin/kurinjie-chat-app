/* HTML5 magic
 - GeoLocation
 - WebSpeech
 */

//mongodb function
$(document).ready(function () {
    //setup "global" variables first
    var socket = io.connect("127.0.0.1:2000");
    var myRoomID = null;

    $("form").submit(function (event) {
        event.preventDefault();
    });

    $("#conversation").bind("DOMSubtreeModified", function () {
        $("#conversation").animate({
            scrollTop: $("#conversation")[0].scrollHeight
        });
    });

    $("#main-chat-screen").show();
    //Message send chat screen
    $("#chatForm").submit(function () {
        var msg = $("#msg").val();
        alert(msg);
        if (msg !== "") {
            socket.emit("send", msg);
            $("#msg").val(" ");
        }
    });

    //'is typing' message
    var typing = false;
    var timeout = undefined;

    function timeoutFunction() {
        typing = false;
        socket.emit("typing", false);
    }

    $("#msg").keypress(function (e) {
        if (e.which !== 13) {
            if (typing === false && myRoomID !== null && $("#msg").is(":focus")) {
                typing = true;
                socket.emit("typing", true);
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(timeoutFunction, 5000);
            }
        }
    });
    socket.on("isTyping", function (data) {
        if (data.isTyping) {
            if ($("#" + data.person + "").length === 0) {
                $("#updates").append("<li id='" + data.person + "'><span class='text-success'><small>" +
                    "<i class='fa fa-keyboard-o'>" + "</i> " + data.person + " is typing.</small></li>");
                timeout = setTimeout(timeoutFunction, 5000);
            }
        } else {
            $("#" + data.person + "").remove();
        }
    });
    $("#msg").keypress(function () {
        if ($("#msg").is(":focus")) {
            if (myRoomID !== null) {
                socket.emit("isTyping");
            }
        } else {
            $("#keyboard").remove();
        }
    });

    socket.on("isTyping", function (data) {
        if (data.typing) {
            if ($("#keyboard").length === 0)
                $("#updates").append("<li id='keyboard'><span class='text-muted'><i class='fa fa-keyboard-o'></i>"
                    + data.person + " is typing.\n+</li>");
        } else {
            socket.emit("clearMessage");
            $("#keyboard").remove();
        }
        console.log(data);
    });

    // whisper connections

    $("#people").on('click', '.whisper', function () {
        var name = $(this).siblings("span").text();
        $("#msg").val("w:" + name + ":");
        $("#msg").focus();
    });

//socket-y stuff

    socket.on("exists", function (data) {
        $("#errors").empty();
        $("#errors").show();
        $("#errors").append(data.msg + " Try <strong>" + data.proposedName + "</strong>");
        toggleNameForm();
        toggleChatWindow();
    });

//user chat login function
    socket.on("update", function (msg) {
        $("#msgs").append("<strong><center><li class='main'>" + msg + "</li>");
    });

//people online status
    socket.on("update-people", function (data) {
        $("#people").empty();
        alert(people);
        $('#people').append("<li class=\"list-group-item active\"><strong>Online Members</strong><span class=\"badge\">"
            + data.count + "</span></li>");
        $.each(data.people, function (a, obj) {
            if (!("country" in obj)) {
                html = "";
            } else {
                html = ("<img class=\"flag flag-" + obj.country + "\"/>");
            }
            $('#people').append("<li class=\"list-group-item private\"><span>" + obj.name + "</span> " +
                "<i class=\"fa fa-" + obj.device + "\"></i> " + html + " <a href=\"#\" class=\"whisper btn btn-xs\">whisper</a></li>");
        });
    });

    //private conversations in chat page

    socket.on("whisper", function (person, msg) {
        if (person.name === "You") {
            s = "whisper"
        } else {
            s = "whispers"
        }
        $("#msgs").append("<strong><span class='text-muted'>" + person.name + "</span></strong>" +
            " <li class='private'> " + msg + "</li>" + "<small>" + "<i>" + (new Date().toString("h:mm tt")));

    });
    socket.on("sendRoomID", function (data) {
        myRoomID = data.id;
    });
});
