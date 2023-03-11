import React, { useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import Header from './components/Header';
import SignIn from './components/Signin';
import ChangeUsernameAndPicture from './components/ChangeUsernameAndPicture';
import { Route, Routes, Navigate } from 'react-router-dom';
import ChatRoomWrapper from './components/ChatRoomWrapper';
import PrivacyPolicy from './components/PrivacyPolicy';
import Profile from "./components/Profile";

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
});

const auth = firebase.auth();

function App() {
  const [user] = useAuthState(auth);
  const [showChatRoom, setShowChatRoom] = useState(true);

  const handlePrivacyPolicyAccept = () => {
    setShowChatRoom(true);
  };

  const handlePrivacyPolicyDecline = () => {
    setShowChatRoom(false);
  };

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route
          path="/privacy-policy"
          element={
            <PrivacyPolicy
              onAccept={handlePrivacyPolicyAccept}
              onDecline={handlePrivacyPolicyDecline}
            />
          }
        />
        {user && !showChatRoom && <Navigate to="/" replace />}
      </Routes>
      <section>
        {user && showChatRoom ? (
          <Routes>
            <Route
              path="/change-username-and-picture"
              element={<ChangeUsernameAndPicture />}
            />
            <Route path="/profile/:uid" element={<Profile />} />
            <Route exact path="/" element={<ChatRoomWrapper />} />
          </Routes>
        ) : (
          <SignIn />
        )}
      </section>
    </div>
  );
}

export default App;

