import React, { useEffect, useState } from 'react';
import kickstart from '../assets/petlogo.png';
import './Header.css';
import { login, logout } from '../utils'

function Header() {
    const [address, setAddress] = useState('');

    return (
        <div className="header">
            <img src={kickstart} alt="kickstart" />
            {!window.walletConnection.isSignedIn() &&
                <button className="login" onClick={login}>Login</button>}
            {window.walletConnection.isSignedIn() && 
                <button className="login" onClick={logout}>Logout</button>}
        </div>
    )
}

export default Header;