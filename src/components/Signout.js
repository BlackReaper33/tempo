import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import firebase from 'firebase/app';
import { useLocation } from 'react-router-dom';

function Signout() {
  const auth = firebase.auth();
  const location = useLocation();

  if (location.pathname === '/change-username-and-picture' || location.pathname === '/privacy-policy') {
    return null; // return null to hide all links and icon
  }

  return auth.currentUser && (
    <>
      <NavLink to="/change-username-and-picture">
        <button className="profile-icon">
          <FontAwesomeIcon icon={faUser} />
        </button>
      </NavLink>
      <a href="https://discord.gg/YUMdx7rV6V">
        <button className="discord-link">DISCORD</button>
      </a>
      <a href="http://aminoapps.com/invite/ZTAUR1ALNO">
        <button className="amino-link">AMINO</button>
      </a>
      <a href="https://www.projz.com/s/c/AnimeEmpireaat">
        <button className="projz-link">PROJECTZ</button>
      </a>
    </>
  );
}

export default Signout;
