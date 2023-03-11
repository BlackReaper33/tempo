import React from 'react'

// Import Firebase components
import firebase from 'firebase/app';
import { NavLink } from 'react-router-dom';
function Signin() {
  // Declare auth variable
  const auth = firebase.auth()

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <img className="sign-in-image" src="../SignIn.png" alt="" />
      <NavLink to="/">
        <button className="sign-in-button" onClick={signInWithGoogle}>
          <img className="sign-in-google" src="https://img.icons8.com/fluency/480/000000/google-logo.png" alt="" />
          Sign in with Google
        </button>
      </NavLink>
      <span className="privacy-link">
        <NavLink to="/privacy-policy" target="_blank">
          Privacy Policy
        </NavLink>
      </span>
    </>
  )
}

export default Signin;
