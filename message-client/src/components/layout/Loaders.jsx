import React from "react";
import logo from'../../assets/image/happinessLogo.png';
import './loaderCss/loaders.css'




const LayoutLoader= ()=>{
    return <div className="layout-loader">
        <div className="layout-loader-border"/>
        <div className="layout-loader-main">
            <img src={logo} alt="" />
        </div>
    </div>

}
const TypingLoader=({name})=>{
    return `User is typing...`
}

export {LayoutLoader , TypingLoader}