import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DOMPurify from 'dompurify';

const ChatMessage = (props) => {
  const { text, uid, fileUrl, photoURL } = props.message;
  const { prev } = props.neighbour;
  const messageClass = uid === firebase.auth().currentUser.uid ? 'sent' : 'received';
  const [username, setUsername] = useState(null);
  const [taggedText, setTaggedText] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const handleDeleteClick = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this message?");
    if (confirmed) {
      const db = firebase.firestore();
      await db.collection("messages").doc(props.id).delete();
    }
  };
  useEffect(() => {
    const displayAvatar = async (uid) => {
      const storageRef = firebase.storage().ref();
      const avatarRef = storageRef.child(`avatars/${uid}.jpg`);
      try {
        const metadata = await avatarRef.getMetadata();
        if (metadata.contentType.startsWith('image')) {
          const avatarUrl = await avatarRef.getDownloadURL();
          setAvatarUrl(avatarUrl);
        }
      } catch (error) {
        console.error(error);
        if (firebase.auth().photoURL) {
          setAvatarUrl(firebase.auth().photoURL);
        }
      }
    }
    
    const fetchUsernameAndTaggedText = async () => {
      const usernameSnapshot = await firebase.database().ref(`users/${uid}/username`).once('value');
      const usernameData = usernameSnapshot.val();
      if (usernameData) {
        setUsername(usernameData);
      } else {
        setUsername(firebase.auth().displayName);
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
    displayAvatar(uid);
    fetchUsernameAndTaggedText();
  }, [uid, text, taggedText, fileUrl]);
  
  const avatarrep = !prev ? `` : prev.uid === uid ? `hidden` : ``
  const usernameClass = messageClass === 'sent' ? 'username-sent' : 'username-received';

  const [showDelete, setShowDelete] = useState(false);
  
  const showDeleteButton = () => {
  if (uid === firebase.auth().currentUser.uid) {
  setShowDelete(true);
  }
  };
  const hideDeleteButton = () => {
  setShowDelete(false);
  };
  
  const [linkPreview, setLinkPreview] = useState(null);
  
  useEffect(() => {
      const linkRegex = /(?:^|[^"'])(https?:\/\/[^\s"]+)(?=["']|$)/g;
      const matches = text ? text.match(linkRegex) : null;
    if (matches) {
      const link = matches[0];
      const url = new URL(link);
      const previewUrl = `https://api.linkpreview.net/?key=${process.env.REACT_APP_LINK_PREVIEW_API_KEY}&q=${url}`;
    
      fetch(previewUrl)
        .then(response => response.json())
        .then(data => {
          if (data.title) {
            setLinkPreview({
              url: url.href,
              title: data.title,
              description: data.description,
              image: data.image
            });
          }
        })
        .catch(error => console.error(error));
    }
  }, [text]);
  
  const sanitizedText = DOMPurify.sanitize(taggedText, { ALLOWED_TAGS: ['a', 'img'], ALLOWED_ATTR: ['href', 'src'] });
  const limitWords = (str, limit) => {
    const words = str.trim().split(/\s+/);
    return words.length <= limit ? str : words.slice(0, limit).join(' ') + '...';
  };
  const linkPreviewHTML = linkPreview ? `
    <a href="${linkPreview.url}" target="_blank" rel="noopener noreferrer" class="link-preview">
      ${linkPreview.image ? `<img src="${linkPreview.image}" alt="${linkPreview.title}" class="link-preview-image" />` : ''}
      <div class="link-preview-details">
        ${linkPreview.title ? `<h4 class="link-preview-title">${linkPreview.title}</h4>` : ''}
        ${linkPreview.description ? `<p class="link-preview-description">${limitWords(linkPreview.description, 20)}</p>` : ''}
      </div>
    </a>` : '';
  const safeHTML = `<span class="${usernameClass}">${username}: </span>${sanitizedText.replace(/<a /g, '<a style="color: blue;" ')}${linkPreviewHTML}`;

  return (
    <div
      className={`message ${messageClass}`}
      onMouseEnter={showDeleteButton}
      onMouseLeave={hideDeleteButton}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className={avatarrep} />
      ) : (
        <img src={photoURL} alt="Avatar" className={avatarrep} />
      )}
      <div className="message-content">
        {username && taggedText && (
          <p
          className="message-text"
          dangerouslySetInnerHTML={{ __html: safeHTML }}
        />
        )}
        {fileUrl && (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <img src={fileUrl} alt="chat attachment" className="message-image-preview" />
                </a>
        )}
        {showDelete && (
          <div className="delete-button" onClick={handleDeleteClick}>
            <FontAwesomeIcon icon={faTrash} />
          </div>
        )}
        </div>
    </div>
  );
};

export default ChatMessage;