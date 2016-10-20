var socket = io('http://localhost:3000');

$('form').submit(function () {
    if ($('#m').val() !== "") {
        socket.emit('chat message', username + ': ' + $('#m').val());
        $('#m').val('');
        return false;
    } else {
        alert("You can't send empty message!");
    }
});
socket.on('chat message', function (msg) {
    $('#messages').append($('<li>').text(msg));
});