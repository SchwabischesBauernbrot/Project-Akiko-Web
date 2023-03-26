import React, { useState } from "react";
import "../css/nav.css";
import { HomeIcon, WrenchScrewdriverIcon, UserGroupIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { RxDiscordLogo } from 'react-icons/rx';
import { HiChevronDoubleRight } from 'react-icons/hi2'
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div id='nav-container'>
      <div className="nav">
        <Link title='Home' id={'nav-button'} to='/'>
          <HomeIcon className="heroicon"/>
        </Link >
        <Link title='Chat' id={'nav-button'} to='/chat'>
          <ChatBubbleLeftRightIcon className="heroicon"/>
        </Link >
        <Link  title='Characters' id={'nav-button'} to='/characters'>
          <UserGroupIcon className="heroicon"/>
        </Link >
        <Link title='Advanced Characters' to='/advcharacter' id={'nav-button'}>
          <HiChevronDoubleRight className="react-icon" title="Advanced Characters"/>
        </Link>
        <Link title='Discord Bot' id={'nav-button'} to='/discordbot' >
          <RxDiscordLogo className="react-icon"/>
        </Link >
        <Link title='Settings' id={'nav-button'} to='/settings'>
          <WrenchScrewdriverIcon className="heroicon"/>
        </Link >
      </div>
    </div>
  );
};

export default Navbar;
