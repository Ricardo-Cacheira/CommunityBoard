/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


function accept(postid)
{
    console.log(postid);
    $.post('/accept', {idpost: postid}).done( function(response) {
        if (response) {
            document.getElementById(postid).classList.add("accepted");    
        }else
        {
            document.getElementById(postid).classList.remove("accepted");    
        }
    })
    .fail( function(response){
        alert("Couldn't complete your action, Try Again!");
    })
    .always( function(response){});
}

function comment(postid, text)
{
    $.post('/newc', {postID: postid, content: text}).done( function(response) {
        if (response) {
            console.log("ok");
        }else
        {
            console.log("ko");
        }
    })
    .fail( function(response){
        alert("Couldn't complete your action, Try Again!");
    })
    .always( function(response){});
}

function acceptRequest(userid, community)
{
    $.post('/addUser', {iduser: userid, community: community}).done( function(response) {
        if (response) {
            alert("user accepted");    
        }else
        {
            alert("User has already been accepted");    
        }
        
    })
    .fail( function(response){
        alert("Couldn't complete your action, Try Again!");
    })
    .always( function(response){});
}

function acceptEvent(userid, eventsid)
{
    $.post('/insertAcceptedEvent', {iduser: userid, idevent: eventsid}).done( function(response) {
        if (response) {
            alert("user accepted");    
        }else
        {
            alert("User has already been accepted");    
        }
        
    })
    .fail( function(response){
        alert("Couldn't complete your action, Try Again!");
    })
    .always( function(response){
        alert("hey?");
    });
}

function request(comid)
{
    console.log(comid);
    $.post('/request', {com: comid}).done( function(response) {
        if (response) {
            alert("REQUEST SENT");    
        }else
        {
           alert("YOUR REQUEST HAD ALREADY BEEN SENT");    
        }
        
    })
    .fail( function(response){
        alert("Couldn't complete your action, Try Again!");
    })
    .always( function(response){});
}

function choose(postid, userid)
{
    $.post('/chooseUser', {pid: postid, uid: userid}).done( function(response) {
        if (response) {
            alert("USER CHOSEN");    
        }else
        {
           alert("YOU ALREADY CHOSE SOMEONE");    
        }
        
    })
    .fail( function(response){
        alert("Couldn't complete your action, Try Again!");
    })
    .always( function(response){});
}

function deleteTodo(todoid)
{
    $.get('/deleteTodo', {todoid: todoid}).done( function(response) {
        if (response) {
            alert("Todo deleted");    
        }else
        {
            alert("Error deleting Todo");    
        }
        
    })
    .fail( function(response){
        alert("Couldn't complete your action, Try Again!");
    })
    .always( function(response){});
}