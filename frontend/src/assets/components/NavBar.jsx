import React from "react";
import "../css/nav.css";
import { HomeIcon, WrenchScrewdriverIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { RxDiscordLogo } from 'react-icons/rx';
const Navbar = () => {
return (
	<div className="nav-buttons">
		<button title='Home' id={'nav-button'} onClick={() => window.location.href = '/'}>
			<HomeIcon/>
		</button>
		<button title='Chat' id={'nav-button'} onClick={() => window.location.href = '/chat'}>
			<ChatBubbleLeftRightIcon/>
		</button>
		<button title='Characters' id={'nav-button'} onClick={() => window.location.href = '/characters'}>
			<UserGroupIcon/>
		</button>
		<button title='Discord Bot' id={'nav-button'} onClick={() => window.location.href = '/discordbot'}>
			<RxDiscordLogo size={45}/>
		</button>
		<button title='Settings' id={'nav-button'} onClick={() => window.location.href = '/settings'}>
			<WrenchScrewdriverIcon/>
		</button>
	</div>
);
};

export default Navbar;
