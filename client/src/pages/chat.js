"use client"
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getContacts, getMessages, sendMessage } from '../apis/chatService';
import io from 'socket.io-client';
import ChatArea from '@/components/ChatArea';
import ContactsSidebar from '@/components/ContactsSidebar';

export default function ChattingApplication() {
    const router = useRouter();
    const messagesEndRef = useRef(null);
    const tempIdRef = useRef(null);

    // States
    const [user, setUser] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [socket, setSocket] = useState(null);

    // load user from localStorage
    useEffect(() => {
        const userDataString = localStorage.getItem("user");
        if (userDataString) {
            try {
                const parsedUser = JSON.parse(userDataString);
                setUser(parsedUser);
            } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                router.push('/');
            }
        } else {
            router.push('/');
        }
    }, [router]);

    // initialize Socket.IO connection
    useEffect(() => {
        if (!user) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Socket connection failed: No token found.');
            return;
        }

        const newSocket = io('http://localhost:5000', {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // handle incoming socket events 
    useEffect(() => {
        if (!socket || !user) return;

        const handleNewMessage = (incomingMessage) => {
            if (!incomingMessage || !incomingMessage.sender || !incomingMessage.sender._id) {
                console.warn("Received incomplete message data", incomingMessage);
                return;
            }

            const senderId = incomingMessage.sender._id;
            const currentUserId = user.id;

            const isMe = senderId === currentUserId;

            setMessages(prevMessages => {
                const existingMsgIndex = prevMessages.findIndex(msg => msg._id === incomingMessage._id || (msg._id === tempIdRef.current && incomingMessage._id));
                if (existingMsgIndex > -1) {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[existingMsgIndex] = { ...incomingMessage, isMe };
                    return updatedMessages;
                }
                return [...prevMessages, { ...incomingMessage, isMe }];
            });

            setContacts(prevContacts =>
                prevContacts.map(contact => {
                    if (contact._id === senderId || contact._id === incomingMessage.receiver._id) {
                        let newUnreadCount = contact.unreadCount || 0;
                        if (senderId !== currentUserId && (!selectedContact || senderId !== selectedContact._id)) {
                            newUnreadCount += 1;
                        }
                        return {
                            ...contact,
                            lastMessage: incomingMessage.content,
                            updatedAt: incomingMessage.createdAt,
                            unreadCount: newUnreadCount,
                        };
                    }
                    return contact;
                }).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
            );
        };

        const handleUserOnline = ({ userId, isOnline, name }) => {
            setContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact._id === userId ? { ...contact, isOnline: true } : contact
                )
            );
            if (selectedContact && selectedContact._id === userId) {
                setSelectedContact(prev => ({ ...prev, isOnline: true }));
            }
        };

        const handleUserOffline = ({ userId, isOnline, name }) => {
            setContacts(prevContacts =>
                prevContacts.map(contact =>
                    contact._id === userId ? { ...contact, isOnline: false } : contact
                )
            );
            if (selectedContact && selectedContact._id === userId) {
                setSelectedContact(prev => ({ ...prev, isOnline: false }));
            }
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('userOnline', handleUserOnline);
        socket.on('userOffline', handleUserOffline);

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('userOnline', handleUserOnline);
            socket.off('userOffline', handleUserOffline);
        };
    }, [socket, user, selectedContact]);

    // Fetch contacts
    useEffect(() => {
        if (!user) return;
        const fetchContactsData = async () => {
            try {
                const contactsData = await getContacts();
                const processedContacts = contactsData
                    .map(c => ({ ...c, isOnline: false, unreadCount: 0, lastMessage: c.lastMessage || 'No recent messages' }))
                    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
                setContacts(processedContacts);
            } catch (error) {
                console.error('Failed to fetch contacts:', error.response?.data?.message || error.message);
                if (error.response?.status === 401) router.push('/');
            }
        };
        fetchContactsData();
    }, [user, router]);

    // Fetch messages when a contact is selected
    useEffect(() => {
        if (selectedContact && user) {
            const fetchMessagesData = async () => {
                try {
                    setMessages([]);
                    const messagesData = await getMessages(selectedContact._id);
                    const formattedMessages = messagesData.map(msg => ({
                        ...msg,
                        isMe: msg.sender._id === user.id
                    }));
                    setMessages(formattedMessages);
                    setContacts(prev => prev.map(c => c._id === selectedContact._id ? { ...c, unreadCount: 0 } : c));

                } catch (error) {
                    console.error('Failed to fetch messages:', error.response?.data?.message || error.message);
                    if (error.response?.status === 401) router.push('/');
                }
            };
            fetchMessagesData();
        } else {
            setMessages([]);
        }
    }, [selectedContact, user, router]);

    // Handle sending a message
    const handleSendMessage = useCallback(async () => {
        if (!selectedContact?._id || !newMessage.trim() || !user || !socket) {
            console.warn("Cannot send message: Missing contact, message, user, or socket.");
            return;
        }

        tempIdRef.current = `temp_${Date.now()}`;

        const optimisticMessage = {
            _id: tempIdRef.current,
            content: newMessage,
            createdAt: new Date().toISOString(),
            sender: { _id: user.id, name: user.name, avatar: user.avatar },
            receiver: { _id: selectedContact._id, name: selectedContact.name, avatar: selectedContact.avatar },
            isMe: true,
            isRead: false,
        };
        setMessages(prev => [...prev, optimisticMessage]);
        const messageContentToSend = newMessage;
        setNewMessage('');
        try {
            const savedMessage = await sendMessage(selectedContact._id, messageContentToSend);
        } catch (error) {
            setMessages(prev => prev.filter(msg => msg._id !== tempIdRef.current));
            setNewMessage(messageContentToSend);
        }
    }, [selectedContact, newMessage, user, socket]);

    // Handle responsive view
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobileView(mobile);
            if (!mobile) {
                setShowSidebar(true);
            } else {
                setShowSidebar(!selectedContact);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedContact]);

    // Auto-scroll to new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Logout
    const handleLogout = useCallback(() => {
        if (socket) socket.disconnect();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setSocket(null);
        router.push('/');
    }, [socket, router]);

    // Filter contacts based on search term
    const filteredContacts = useMemo(() => {
        return contacts.filter(contact =>
            contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [contacts, searchTerm]);

    if (!user) {
        return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading user data...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            <Head>
                <title>Chat App</title>
            </Head>
            <div className="flex flex-1 overflow-hidden">
                <ContactsSidebar
                    user={user}
                    contacts={contacts}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedContact={selectedContact}
                    setSelectedContact={setSelectedContact}
                    isMobileView={isMobileView}
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    handleLogout={handleLogout}
                    filteredContacts={filteredContacts}
                />

                <ChatArea
                    selectedContact={selectedContact}
                    messages={messages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendMessage={handleSendMessage}
                    isMobileView={isMobileView}
                    setShowSidebar={setShowSidebar}
                    messagesEndRef={messagesEndRef}
                />
            </div>
        </div>
    );
}