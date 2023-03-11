import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatRoom from './ChatRoom';
import firebase from 'firebase/app';
import 'firebase/auth';

function ChatRoomWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Check if user is signed in
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      setIsSignedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (!isSignedIn && location.pathname !== '/sign-in-button') {
    // Redirect to sign-in page if user is not signed in and not already on the sign-in page
    navigate('/sign-in-button');
    return null;
  } else if (location.pathname === '/change-username-and-picture') {
    return null;
  } else {
    return(
      <div className="/">
        <ChatRoom />
      </div>
    );
  }
}

export default ChatRoomWrapper;
