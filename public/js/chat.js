var socket = io();

function scrollToBottom () {
    // Selectors
    var $messages = $('#messages');
    var $newMessage = $messages.children('li:last-child');

    // Heights
    var clientHeight = $messages.prop('clientHeight');
    var scrollTop = $messages.prop('scrollTop');
    var scrollHeight = $messages.prop('scrollHeight');
    var newMessageHeight = $newMessage.innerHeight();
    var lastMessageHeight = $newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        $messages.scrollTop(scrollHeight);
    }
}

// 클라이언트단에서 Socket 접속 확인
socket.on('connect', function () {
    var params = $.deparam(window.location.search);

    console.log(params);

    // 접속한 파라메터 값을 서버로 전송
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');
        }
    })
});

// Socket 서버 연결 끊김
socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

// 채팅방 이용자가 들어올 경우 리스트 업데이트
socket.on('updateUserList', function (users) {
    var $ol = $('<ol></ol>');

    users.forEach(function (user) {
        $ol.append($('<li></li>').text(user));
    });

    $('#users').html($ol);
});

// 메시지 전송
socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createAt).format('h:mm a');
    var $template = $('#message-template').html();
    var html = Mustache.render($template, {
        text: message.text,
        from: message.from,
        createAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
});

// 현재 위치 전송
socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createAt).format('h:mm a');
    var $template = $('#location-message-template').html();
    var html = Mustache.render($template, {
        url: message.url,
        from: message.from,
        createAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
});

$('#message-form').on('submit', function (e) {
    var $messageTextBox = $('[name=message]');
    e.preventDefault();


    socket.emit('createMessage', {
        text: $messageTextBox.val()
    }, function() {
        $messageTextBox.val('');
    });
});

var $locationButton = $('#send-location');
$locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser.');
    }

    $locationButton.attr('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition(function (position) {
        $locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function () {
        $locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location.')
    });
});