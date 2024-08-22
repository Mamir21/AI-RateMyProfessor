'use client'; 

import React from 'react';
import NavLink from './NavLink';
import { useState, useEffect } from 'react';
import { logOut } from '../services/auth';
import { useRouter } from 'next/navigation'; 
import '../navbar.css';

export default function Navbar() {
  const router = useRouter(); 
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 1) { 
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logOut(); 
      router.push('/login'); 
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  const handleLogoClick = () => {
    router.push('/home');
  }

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <img src='/images/wlogo.png' className="logo" onClick={handleLogoClick} alt="Logo"/>
      <ul>
        <li><NavLink href="/home" title="Home" /></li>
        <li>
        <a href="/bot" class="nav-link">
          Sage.<span class="small-ai">AI</span>
        </a>
      </li>
      </ul>
      <div>
        <a className='btn' onClick={handleLogout}>Log out</a>
      </div>
    </nav>
  )
}