import React from "react";
import "../css/nav.css";
import { HomeIcon, WrenchScrewdriverIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { RxDiscordLogo } from 'react-icons/rx';
import { Link } from 'react-router-dom';

const Navbar = () => {
return (
	<div className="nav-buttons">
		<Link  title='Home' id={'nav-button'} to='/'>
			<HomeIcon/>
		</Link >
		<Link  title='Chat' id={'nav-button'} to='/chat'>
			<ChatBubbleLeftRightIcon/>
		</Link >
		<Link  title='Characters' id={'nav-button'} to='/characters'>
			<UserGroupIcon/>
		</Link >
		<Link  title='Discord Bot' id={'nav-button'} to='/discordbot'>
			<RxDiscordLogo size={45}/>
		</Link >
		<Link  title='Settings' id={'nav-button'} to='/settings'>
			<WrenchScrewdriverIcon/>
		</Link >
	</div>
);
};

export default Navbar;
