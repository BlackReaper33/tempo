import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DOMPurify from 'dompurify';

const ChatMessage = (props) => {
const { text, uid, fileUrl } = props.message;
const messageClass = uid === firebase.auth().currentUser.uid ? 'sent' : 'received';
const [username, setUsername] = useState(null);
const [taggedText, setTaggedText] = useState(null);
const [avatar, setAvatar] = useState(null);

const handleDeleteClick = async () => {
const confirmed = window.confirm("Are you sure you want to delete this message?");
if (confirmed) {
const db = firebase.firestore();
await db.collection("messages").doc(props.id).delete();
}
};

useEffect(() => {
const fetchUsernameAndTaggedText = async () => {
const usernameSnapshot = await firebase.database().ref(`users/${uid}/username`).once('value');
const usernameData = usernameSnapshot.val();
if (usernameData) {
setUsername(usernameData);
} else {
setUsername(firebase.auth().currentUser.displayName);
}
const tagRegex = /@([\w\s]+)/g;
const matches = text ? text.match(tagRegex) : null;
if (matches) {
  const replacedMatches = await Promise.all(matches.map(async (match) => {
    const username = match.trim().substring(1);
    const userRef = firebase.database().ref(`users`).orderByChild('username').equalTo(username);
    const snapshot = await userRef.once('value');
    const user = snapshot.val();
    if (user) {
      const uid = Object.keys(user)[0];
      return uid;
    } else {
      return null;
    }
  }));
  let currentIndex = 0;
  const newTaggedText = text.replace(tagRegex, (match) => {
    const uid = replacedMatches[currentIndex++];
    if (uid) {
      return `<a href="/profile/${uid}" style="color: blue;">${match}</a>`;
    } else {
      return match;
    }
  });
  const linkRegex = /(?:^|[^"'])(https?:\/\/[^\s"]+)(?=["']|$)/g;
  const newLinkedText = newTaggedText.replace(linkRegex, (match) => {
    return `<a href="${match}" class="link-preview" target="_blank">${match}</a>`;
  });
  setTaggedText(newLinkedText);
} else {
  const linkRegex = /(?:^|[^"'])(https?:\/\/[^\s"]+)(?=["']|$)/g;
  const newLinkedText = text ? text.replace(linkRegex, (match) => {
    return `<a href="${match}" class="link-preview" target="_blank">${match}</a>`;
  }) : null;
  if (newLinkedText !== text) {
    setTaggedText(newLinkedText);
  } else {
    setTaggedText(text);
  }
}
}
fetchUsernameAndTaggedText();

const storage = firebase.storage();
const avatarRef = storage.ref(`avatars/${uid}.jpg`);
avatarRef.getDownloadURL().then(setAvatar).catch(() => {
if (firebase.auth().currentUser.providerData[0].providerId === 'google.com') {
  setAvatar(firebase.auth().currentUser.photoURL);
}
});
}, [uid, text]);

const usernameClass = messageClass === 'sent' ? 'username-sent' : 'username-received';

// Fetch avatar image from Firebase Storage
const [avatarUrl, setAvatarUrl] = useState(null);

useEffect(() => {
// Reference to user avatar file in Firebase Storage
const avatarRef = firebase.storage().ref().child(`avatars/${uid}.jpg`);
avatarRef.getDownloadURL()
  .then(url => {
    setAvatarUrl(url);
  })
  .catch(error => {
    if (error.code === 'storage/object-not-found') {
      // If avatar image doesn't exist, display user's Gmail photoURL instead
      if (firebase.auth().currentUser.providerData[0].providerId === 'google.com') {
        setAvatarUrl(firebase.auth().currentUser.photoURL);
      }
    } else {
      console.error(error);
    }
  });
}, [uid]);

return (
<div className={`message ${messageClass}`}>
<div className="avatar">
{avatarUrl && <img src={avatarUrl} alt={`${username}'s avatar`} />}
</div>
<div className="message-content">
<div
className={`username ${usernameClass}`}
onMouseEnter={showDeleteButton}
onMouseLeave={hideDeleteButton}
>
{username}
</div>
{showDelete && (
<div className="delete-button" onClick={handleDeleteClick}>
<FontAwesomeIcon icon={faTrash} />
</div>
)}
<div className="text" dangerouslySetInnerHTML={{ __html: sanitizedText }}></div>
{linkPreviewHTML && (
<div className="link-preview-container" dangerouslySetInnerHTML={{ __html: linkPreviewHTML }}></div>
)}
</div>
</div>
);
};

export default ChatMessage;