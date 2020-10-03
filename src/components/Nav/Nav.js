import React from 'react';
import './Nav.css';
const Nav = ({ color  }) =>{
        return(
                <div className={color ? "nav black" : "nav"}>
                        <div className="logo">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/799px-Netflix_2015_logo.svg.png" alt="logo" />
                        </div>
                        <div className="user">
                                <a href="/">
                                        <img src="https://lh3.googleusercontent.com/a-/AOh14Ghr_HNYLOzm3HdMt52DvHak-EvS9aFse93mlOlVgyU=s88-c-k-c0x00ffffff-no-rj-mo" alt="user" />
                                </a>
                        </div>
                </div>
                );
}

export default Nav;
