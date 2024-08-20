import React from 'react';
import Link from 'next/link';
import '../navbar.css';

const NavLink = ({ href, title, className }) => {
  return (
    <Link href={href} className={`nav-link ${className}`}>
      {title}
    </Link>
  )
}

export default NavLink;