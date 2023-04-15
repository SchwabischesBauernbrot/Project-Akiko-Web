import React, { useState } from 'react'
import { FaBars } from 'react-icons/fa'
import { CgCloseO } from 'react-icons/cg'
import 'tailwindcss/tailwind.css';

const SlideMenu = () => {
const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
        <div className="fixed left-5 top-10 z-20">
        <button onClick={() => { 
  setMenuOpen(!menuOpen);
}}>
  <FaBars />
</button>
    </div>
    <div className={`fixed left-0 top-0 h-full w-0 ${menuOpen ? 'w-1/4' : 'hidden'} transition-duration-300 z-10 bg-black bg-opacity-60 backdrop-filter backdrop-blur-20`}>
</div>
    </>
  )
}

export default SlideMenu