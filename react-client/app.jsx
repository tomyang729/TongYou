
var navbar = [
    <a className="atag">Become a Guide</a>,
    <a key="a2">Your Reservation</a>,
    <a key="a3">Mailbox</a>,
    <a key="a4">About</a>,
    <a key="a5">Han</a>,
];


ReactDOM.render(
    <div>
        <img src="img/logo.png" alt="Logo" height="42" width="42"/>
        <h1>TongYou</h1>
        <ul>{navbar}</ul>
    </div>,
    document.getElementById('nav-bar')
);

ReactDOM.render(
    <img src="img/p2.png" alt="Logo"  width="100%"/>,
    document.getElementById('banner')
);

ReactDOM.render(
    <div>
        <p><a href="">Contact and Support   |  http://www.tongyou.com  | <a>简体中文</a> Cearte by Tom, Han</a></p>
    </div>,
    document.getElementById('footer')
);

ReactDOM.render(
    <div className="input-group input-g">
        <input type="text" className="form-control" placeholder="Search for location ..."></input>
        <span className="input-group-btn">
            <button className="btn btn-primary" type="button">Search!</button>
        </span>
    </div>,
    document.getElementById('search-bar')
);


ReactDOM.render(
    <div className="row h-host">
        <h2>Explore the wonderful world</h2>
        <div className="col-xs-6 col-md-4 ">
            <a href="#" className="thumbnail hovereffect">
                <img className="img-responsive" src="img/la.jpg" alt=""></img>
                <div className="overlay">
                    <h2>Explore More!</h2>
                </div>
            </a>
        </div>

        <div className="col-xs-6 col-md-4">
            <a href="#" className="thumbnail hovereffect">
                <img className="img-responsive" src="img/beijing.jpg" alt=""></img>
                <div className="overlay">
                    <h2>Explore More!</h2>
                </div>
            </a>
        </div>

        <div className="col-xs-6 col-md-4">
            <a href="#" className="thumbnail hovereffect">
                <img className="img-responsive" src="img/Sydney.jpg" alt=""></img>
                <div className="overlay">
                    <h2>Explore More!</h2>
                </div>
            </a>
        </div>

        <div className="col-xs-6 col-md-4">
            <a href="#" className="thumbnail hovereffect">
                <img className="img-responsive" src="img/la.jpg" alt=""></img>
                <div className="overlay">
                    <h2>Explore More!</h2>
                </div>
            </a>
        </div>

        <div className="col-xs-6 col-md-4">
            <a href="#" className="thumbnail hovereffect">
                <img className="img-responsive" src="img/beijing.jpg" alt=""></img>
                <div className="overlay">
                    <h2>Explore More!</h2>
                </div>
            </a>
        </div>

        <div className="col-xs-6 col-md-4">
            <a href="#" className="thumbnail hovereffect">
                <img className="img-responsive" src="img/Sydney.jpg" alt=""></img>
                <div className="overlay">
                    <h2>Explore More!</h2>
                </div>
            </a>
        </div>
    </div>,
    document.getElementById('hot-host')
);


