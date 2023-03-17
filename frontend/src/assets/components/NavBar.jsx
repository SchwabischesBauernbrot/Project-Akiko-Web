import React from "react";
import { Nav, NavLink, NavMenu }
	from "./navbarelements";

const Navbar = () => {
return (
	<>
	<Nav>
		<NavMenu>
		<NavLink to="/">
			<h1>Home</h1>
		</NavLink>
		<NavLink to="/chat">
			<h1>Chat</h1>
		</NavLink>
		<NavLink to="/characters">
			<h1>Characters</h1>
		</NavLink>
		<NavLink to="/settings">
			<h1>Settings</h1>
		</NavLink>
		</NavMenu>
	</Nav>
	</>
);
};

export default Navbar;
