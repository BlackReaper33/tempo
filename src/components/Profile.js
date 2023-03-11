import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import firebase from 'firebase/app';
import 'firebase/database';

const Profile = () => {
  const { uid } = useParams();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      const snapshot = await firebase.database().ref(`users/${uid}/username`).once('value');
      setUsername(snapshot.val());
    };
    fetchUsername();
  }, [uid]);

  return (
    <div>
      <h2>Profile</h2>
      <p>Username: {username}</p>
      <p>⠀⠀⠀⠀⠀⠀</p>
      <i><small>More to profile coming soon!</small></i>
    </div>
  );
};

export default Profile;