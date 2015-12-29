//mongodb function
jQuery(document).ready(function () {

    //setup "global" variables first
    var socket = io.connect("127.0.0.1:3000");
    var myRoomID = null;
    var myRoomID = null;

    $("form").submit(function (event) {
        event.preventDefault();
    });

    $("#conversation").bind("DOMSubtreeModified", function () {
        $("#conversation").animate({
            scrollTop: $("#conversation")[0].scrollHeight
        });
    });

    /*getting url */
    function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }
    }

    if (getUrlParameter('name')) {
        var name = getUrlParameter('name');
        var device = getUrlParameter('device');
        var country = getUrlParameter('country');
        var browser = getUrlParameter('browser');
        socket.emit("joinserver", name, device, country, browser);
    }

    //enter screen Functions
    $("#nameForm").submit(function () {
        var name = $("#name").val();
        var country = "IN";
        var device = "desktop";
        var browser =navigator.userAgent;
        if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
            device = "mobile";
        }
        /*$.get("http://ipinfo.io", function (response) {
         //$("#ip").html("IP: " + response.ip);
         //$("#address").html("Location: " + response.city + ", " + response.region);
         //$("#country").html("Location: " + response.country);
         $("#details").html(JSON.stringify(response, null, 4));
         }, "jsonp");*/
        //var val = socket.emit("joinserver", name, device);
        //if(val === true){
        window.location = "visitorlist.html?name=" + name + "&device=" + device + "&country=" + country + "&browser=" + browser ;
        //}
        //window.location = "visitorlist.html?id=odGrtCvNeWcdautfDSHdaj23dsaDSAkmfhqda7fURFXov&name="+name+"&device="+device+"&s_i=odGrtCvNeWcdautfDSHdaj23dsaDSAkmfhqda7fURFXov";
    });


    socket.on("joined", function () {
        $("#errors").hide();
        if (navigator.geolocation) { //get lat lon of user
            navigator.geolocation.getCurrentPosition(positionSuccess, positionError, {enableHighAccuracy: true});
        } else {
            $("#errors").show();
            $("#errors").append("Your browser is ancient and it doesn't support GeoLocation.");
        }
        function positionError(e) {
            console.log(e);
        }

        function positionSuccess(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            //consult the yahoo service
            $.ajax({
                type: "GET",
                url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22"
                + lat + "%2C" + lon + "%22%20and%20gflags%3D%22R%22&format=json",
                dataType: "json",
                success: function (data) {
                    socket.emit("countryUpdate", {country: data.query.results.Result.countrycode});
                }
            });
        }

        var  sUsrAg = navigator.userAgent;
        var sBrowser;
        if(sUsrAg.indexOf("Chrome") > -1) {
            sBrowser = "Google Chrome";
        } else if (sUsrAg.indexOf("Safari") > -1) {
            sBrowser = "Apple Safari";
        } else if (sUsrAg.indexOf("Opera") > -1) {
            sBrowser = "Opera";
        } else if (sUsrAg.indexOf("Firefox") > -1) {
            sBrowser = "Mozilla Firefox";
        } else if (sUsrAg.indexOf("MSIE") > -1) {
            sBrowser = "Microsoft Internet Explorer";
        }

        $.ajax({
            success: function (data) {
                alert(sBrowser);
                socket.emit("browserUpdate",sBrowser);
            }
    });
    });

//user chat login function
    socket.on("update", function (msg) {
        $("#msgs").append("<strong><center><li class='main'>" + msg + "</li>");
        $("#main-chat-screen").hide();
    });

//people online status

    socket.on("update-people", function (data) {
        $(".count").empty();

        $(".count").append("<p class=\"active\"><strong>Total Visitors:</strong><span class=\"badge\">"
            + data.count + "</span></p>");

        $(".panel-heading").empty();

        $('.panel-heading').append("<h4 class='panel-title'><a class=\"accordion-toggle\" data-parent=\"#accordion\" " +
            "data-toggle=\"collapse\" href=\"#collapseOne\"><i class=\"fa fa-chevron-up\"></i>" +
            "<span>Currently Visited</span><p class=\"togglecount active\">Total Visitors:<span class=\"badge\">"
            + data.count + "</span></p></a></h4>");

        $('.chattable').empty();

        $('.chattable').append("<table class='table table-responsive ui-responsive' " +
            "data-role=\"table\" data-mode=\"columntoggle\" id=\"myTable\"><thead><tr>" +
            "<td class=\"comment\"><tr>" +
            "<th>#</th>" +
            "<th>Visitor</th>" +
            "<th data-priority=\"2\">Online</th>" +
            "<th>Served By</th>" +
            "<th>Viewing</th> " +
            "<th data-priority=\"1\">Referrer</th>" +
            "<th data-priority=\"3\">#visits</th> " +
            "<th data-priority=\"4\">#chats</th>" +
            " </tr></thead></table>");

        $.each(data.people, function (a, obj) {
            if (!("country" in obj))
            {
                html = "";
            }
            else
            {
                html = ("<img class=\"flag flag-" + obj.country + "\"/>");
            }

            $('.chattable').append("<table class='table table-responsive ui-responsive' " +
                "data-role=\"table\" data-mode=\"columntoggle\" id=\"myTable\"><tbody><tr>" +
                "<td class=\"comment\"><i class=\"fa fa-commenting-o\"></i></td><td class=\"private\"><span class=\"whisper\">" +
                "<p href=\"#\" class=\"btn btn-xs\"> " + obj.name + "</p> </span> " + "<div style='display:none;'>" +obj.id +"</div>" +
                "<i class=\"fa fa-" + obj.device + "\"></i> " + html + " " +"</td><td>9 Min</td><td class='access'><p > " + obj.name + "</p></td>" +
                "<td><span class=\"badge\">1</span>Zopium</td><td>-</td><td>-</td><td>-</td></tr></tbody></table>");
        });

    });


    //search online people

    $("#search").on("keyup", function () {

        var value = $(this).val();

        $("table tr").each(function (index) {
            console.log(index);
            if (index) {
                $row = $(this);
                var id = $row.find(".access a").text();
                alert(id);
                if (id.indexOf(value))
                {
                    $row.show();
                }
            }
        });
    });

    //popup window functions
    $(".chattable").click(function()
    {
        $("#main-chat-screen").toggle();

    });
    // whisper connections
    jQuery(".chattable").on('click', '.whisper', function () {
        var name = jQuery(this).clone("span").text();
        var user_id = $(this).siblings("div").text();
        console.log(name);
        console.log(user_id);
        jQuery("#msg").attr("data", user_id);
        $("#msg").val(name + ":");
        $("#msg").focus();
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

    //Message send chat screen
    jQuery("#chatForm").submit(function () {
        var user_id = $("#msg").attr("data");
        var msg = $("#msg").val();
        if (msg !== "") {
            socket.emit("send", msg, user_id);
            $("#msg").val(" ");
        }
    });
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

