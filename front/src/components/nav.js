import React from 'react';
import './nav.css';

function Nav() {
    return (
        <ul className="nav">
            <li className="nav-item">
                <a className="nav-link" href="/">Buscador</a>
            </li>

            <li className="nav-item">
                <h2 className="nav-link">GLIDEWAVE</h2>
            </li>

            <li className="nav-item">
                <a className="nav-link" href="/crawler">Crawler</a>
            </li>
        </ul>
    );
}

export default Nav;
