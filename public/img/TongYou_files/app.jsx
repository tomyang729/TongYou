

var navbar = [
    <a>Become a Guide</a>,
    <a>Your Reservation</a>,
    <a>Mailbox</a>,
    <a>About</a>,
    <a>Name</a>,
];


ReactDOM.render(
    <div>
        <img src="img/logo.png" alt="Logo" height="42" width="42"/>
        <ul>{navbar}</ul>
    </div>,
    document.getElementById('nav-bar')
);

