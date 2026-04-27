import React from 'react';
import TopBar from './TopBar';
import MainNav from './MainNav';

const Navbar = () => {
  return (
    <header className="w-full flex flex-col">
      <TopBar />
      <MainNav />
    </header>
  );
};

export default Navbar;
