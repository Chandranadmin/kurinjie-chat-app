$(document).ready(function() {
    $(".Active").click(function(){
        $(".panel").show();
    });
});

$(document).ready(function() {
    $(".title").click(function(){
    });
});

$(document).ready(function() {
    $(".iconbtn").click(function(){
        $(".panel").toggle();
    });
});

$(document).ready(function()
{
   $(".clearbtn").click(function(){
    $("tr").remove();
   })
});