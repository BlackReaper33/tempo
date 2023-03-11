import React, { useEffect, useRef, useState } from 'react';
import firebase from 'firebase/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faFile, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ChatMessage from './ChatMessage';
import 'firebase/storage';
import './ChatRoom.css';

function ChatRoom() {
  const auth = firebase.auth();
  const firestore = firebase.firestore();
  const database = firebase.database();
  const fileInputRef = useRef(null);
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [username, setUsername] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const scrollToBottom = () => {
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;
    scrollToBottom();
    const fetchUsername = async () => {
      const uid = auth.currentUser.uid;
      const usernameRef = database.ref(`users/${uid}/username`);
      const usernameSnapshot = await usernameRef.once('value');
      let username = usernameSnapshot.val();
      if (!username) {
        const user = auth.currentUser;
        username = user.displayName || user.email;
        usernameRef.set(username);
      }
      if (isMounted) {
        setUsername(username);
      }
    };

    if (auth.currentUser) {
      fetchUsername();
    }
    return () => {
      isMounted = false;
    };
  }, [auth, database]);

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.focus();
    }
  };  
  

  const handleSendMessage = async (e) => {
    e.preventDefault();
  
    setIsSending(true);
  
    const { uid, photoURL, displayName, email } = auth.currentUser;
  
    /*if (selectedFile && selectedFile.length > 0) {
      setIsLoadingFile(true);
      const fileSize = selectedFile && selectedFile[0] && selectedFile[0].size / 1024 / 1024; // convert to MB
      if (fileSize > 2) {
        alert('Maximum file size should be 2MB');
        setIsSending(false);
        setIsLoadingFile(false);
        return;
      }
    }   */ 
  
    const storageRef = firebase.storage().ref();
    for (let i = 0; selectedFile && i < selectedFile.length; i++) {
      const file = selectedFile[i];
      const newFile = new File([file], `${Date.now()}-${file.name}`);
      const fileRef = storageRef.child(newFile.name);
      await fileRef.put(newFile);
      const fileUrl = await fileRef.getDownloadURL();
      await messagesRef.add({
        fileUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
        username,
        displayName,
        email,
      });
    }
    setSelectedFile(null); // clear selected file after upload
    setIsLoadingFile(false);
  
    if (formValue.trim() !== '') {
      if (formValue.length > 200) {
        alert('Word limit is 200');
        setIsSending(false);
        return;
      }
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
        username,
        displayName,
        email,
      });
      setFormValue('');
    }
  
    scrollToBottom();
  
    setIsSending(false); // reset the isSending state after the message is sent
  };
  
  
  return (
    <>
      <main>
        {messages &&
          messages.map((msg, index, pool) => {
            const prev = pool[index - 1];
            const next = pool[index + 1];
            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                id={msg.id}
                uid={msg.uid}
                neighbour={{ prev, next }}
              />
            );
          })}
          <span ref={dummy}></span>
      </main>
        <form onSubmit={handleSendMessage}>
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Type a message"
          />
          <label className='fileicon'>
            {/* use the ref to the file input element */}
            <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files)} hidden multiple />
            <FontAwesomeIcon icon={faFile} onClick={handleFileClick} />
          </label>
          <button
            className="chat-message-button"
            type="submit"
            disabled={isLoadingFile || (!selectedFile && (!formValue || isSending))}
          >
            {isLoadingFile ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
        </form>
    </>
  );
}

export default ChatRoom
