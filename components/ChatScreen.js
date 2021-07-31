import React, { useMemo, useState, useCallback, useRef } from 'react'
import styled from 'styled-components'
import { auth, db } from '../firebase'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { Avatar, IconButton } from '@material-ui/core'
import { MoreVert, AttachFile, InsertEmoticon, Mic } from '@material-ui/icons'
import { useCollection } from 'react-firebase-hooks/firestore'
import Message from '../components/Message'
import firebase from 'firebase'
import getRecipientEmail from '../utils/getRecipientEmail'
import TimeAgo from 'timeago-react'

const ChatScreen = ({ chat, messages }) => {
    const [user] = useAuthState(auth)
    const endOfMessagesRef = useRef(null)
    const [input, setInput] = useState('')
    const router = useRouter()
    const recipientEmail = getRecipientEmail(chat.users, user)
    const [recipientSnapshot] = useCollection(
        db.collection('users').where('email', '==', recipientEmail)
    )
    const [messagesSnapshot] = useCollection(db.collection('chats')
        .doc(router.query.id)
        .collection('messages')
        .orderBy('timestamp', 'asc'))
    const showMessages = useMemo(() => {
        if (messagesSnapshot) {
            return messagesSnapshot.docs.map(message => (
                <Message
                    key={message.id}
                    user={message.data().user}
                    message={{
                        ...message.data(),
                        timestamp: message.data().timestamp?.toDate().getTime()
                    }}
                />
            ))
        } else {
            return JSON.parse(messages).map(message => (
                <Message key={message.id} user={message.user} message={message} />
            ))
        }
    }, [messages, messagesSnapshot])

    const sendMessage = useCallback(e => {
        e.preventDefault()

        // update last seen
        db.collection('users').doc(user.uid).set({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true })

        db.collection('chats').doc(router.query.id).collection('messages').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: input,
            user: user.email,
            photoURL: user.photoURL
        })

        scrollToBottom()
        setInput('')
    }, [input, router, scrollToBottom, user])

    const scrollToBottom = useCallback(() => {
        endOfMessagesRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }, [])

    const recipient = useMemo(() => {
        return recipientSnapshot?.docs[0]?.data()
    }, [recipientSnapshot])

    return (
        <Container>
            <Header>
                {recipient ? (
                    <Avatar src={recipient?.photoURL} />
                ) : (
                    <Avatar>{recipientEmail[0]}</Avatar>
                )}
                <HeaderInformation>
                    <h3>{recipientEmail}</h3>
                    {recipientSnapshot ? (
                        <p>
                            last active: {' '}
                            {recipient?.lastSeen.toDate() ? (
                                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                            ) : 'Unavailable'}
                        </p>
                    ) : (
                        <p>Loading Last Active</p>
                    )}
                </HeaderInformation>
                <HeaderIcons>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </HeaderIcons>
            </Header>

            <MessageContainer>
                {showMessages}
                <EndOfMessages ref={endOfMessagesRef} />
            </MessageContainer>

            <InputContainer>
                <InsertEmoticon />
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button hidden disabled={!input} onClick={sendMessage}>sendMessage</button>
                <Mic />
            </InputContainer>
        </Container>
    )
}

export default ChatScreen

const Container = styled.div`

`

const HeaderInformation = styled.div`
    margin-left: 15px;
    flex: 1;

    > h3 {
        margin-bottom: 3px;
    }

    > p {
        font-size: 14px;
        color: gray;
    }
`

const Header = styled.div`
    position: sticky;
    background-color: white;
    z-index: 100;
    top: 0;
    display: flex;
    padding: 11px;
    height: 80px;
    align-items: center;
    border-bottom: 1px solid whitesmoke;
`

const HeaderIcons = styled.div``

const EndOfMessages = styled.div`
    margin-bottom: 50px;
`

const MessageContainer = styled.div`
    padding: 30px;
    background-color: #e5ded8;
    height: 90vh;
`

const InputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom:0;
    background-color: white;
    z-index:100;
`

const Input = styled.input`
    flex: 1;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom: 0;
    background-color: whitesmoke;
    padding: 20px;
    margin-left: 15px;
    margin-right: 15px;
    border-radius: 10px;
    border: none;
    outline-width: 0;
`