$(document).on("click", ".notes", function() {
    $("#note-title").empty();
    $(".modal-footer").empty();
    $("#titleInput").val("");
    $("#bodyInput").val("");

    var id = $(this).attr("id");

    $.ajax({
        method: "GET",
        url: "/articles/" + id
    }).then(function(data) {
        console.log(data);
        $("#note-title").text(data.title);
        $(".modal-footer").append("<button type='button' class='btn btn-dark' data-dismiss='modal'>Close</button>");
        $(".modal-footer").append("<button type='button' data-id='" + data._id + "' id='savenote' data-dismiss='modal' class='btn btn-dark'>Save Note</button>");
        
        if(data.note) {
            $("#titleInput").val(data.note.title);
            $("#bodyInput").val(data.note.body);
        }
    });
});

$(document).on("click", "#savenote", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    }).then(function(data) {
        console.log(data);
    });  
});

$(document).on("click", "#new", function(event) {
    event.preventDefault();

    $.get("/scrape", function() {
        alert("Found New Articles!");
        location.reload();
    });
});























