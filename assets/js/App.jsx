import "bootstrap";
import "./utils"
import React from "react";
import ReactDOM from "react-dom";

import Users from "./users/users";
import Params from "./params/Params";
import Menus from "./menus/Menus";
import Homepage from "./Homepage/Homepage";

let p = document.getElementById("users-crud");

if (p) {
    ReactDOM.render(<Users/>, p)
}

p = document.getElementById("params");
if (p) {
    ReactDOM.render(<Params/>, p)
}

p = document.getElementById("menus");
if (p) {
    ReactDOM.render(<Menus/>, p)
}

p = document.getElementById("main-page");
if (p) {
    ReactDOM.render(<Homepage/>, p)
}
