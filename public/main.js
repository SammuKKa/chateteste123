const socket = io();    // se com outro servidor, p1 recebe tal
let username = '';
let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');
let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');


loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList() {
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';
    userList.forEach( i => {
        ul.innerHTML += '<li>'+i+'</li>';
    } );
};

function addMessage(type, user, msg) {
    let ul = document.querySelector('.chatList');
    console.log('scrollTop', ul.scrollTop);
    console.log('scrollHeight', ul.scrollHeight);
    switch(type) {
        case 'status':
        ul.innerHTML += '<li class="m-status">'+msg+'</li>';
            break;
        case 'msg':
            if(username == user) {
                ul.innerHTML += '<li class="m-text me">'+msg+'</li>';
            } else {
                ul.innerHTML += '<li class="m-text"><span>'+user+'</span><br/>'+msg+'</li>';
            }
        break;
    }

    ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let name = loginInput.value.trim();
        if(name != '') {
            username = name;
            document.title = 'Chat - ('+username+')';
            socket.emit('join-request', username);
        }
    }
});

textInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let msg = textInput.value.trim();
        textInput.value = '';
        if(msg != '') {
            // addMessage('me', null, msg);
            socket.emit('send-message', msg);
        }
    }
});

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    userList = list;
    renderUserList();

});

socket.on('list-update', (data) => {
    userList = data.list;
    renderUserList();

    if(data.joined) {
        let msg = `${data.joined} entrou na conversa.`;
        addMessage('status', null, msg);
    } else if(data.left) {
        let msg = `${data.left} saiu da conversa.`;
        addMessage('status', null, msg);
    }
});

socket.on('show-message', (msgData) => {
    addMessage('msg', msgData.sender, msgData.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado');
    userList = [];
    renderUserList;
});

socket.on('reconnect_error', () => {
    addMessage('status', null, 'Tentando reconectar');
});

socket.on('reconnect', () => {
    addMessage('status', null, 'Reconectado!');
    if(username != '') {
        socket.emit('join-request', username);
    }
});