"use client"
import { IoCheckmarkDone } from 'react-icons/io5';
import { RiMessage2Line } from 'react-icons/ri';
import { BiArrowBack } from 'react-icons/bi';

const ChatArea = ({
    selectedContact,
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    isMobileView,
    setShowSidebar,
    messagesEndRef
}) => {
    return (
        <div className={`flex flex-col flex-1 ${(isMobileView && !selectedContact) ? 'hidden' : 'flex'}`}>
            {selectedContact ? (
                <>
                    {/* Chat Header */}
                    <div className="bg-gray-700 p-3 flex items-center border-b border-gray-600">
                        {isMobileView && (
                            <button
                                className="mr-3 p-1 text-gray-300 hover:text-white"
                                onClick={() => { setShowSidebar(true); }}
                            >
                                <BiArrowBack size={22} />
                            </button>
                        )}
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedContact.name)}`}
                            alt={selectedContact.name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-3">
                            <h3 className="font-medium text-gray-100">{selectedContact.name}</h3>
                            <p className="text-xs text-gray-400">{selectedContact.isOnline ? 'Online' : "Offline"}</p>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div
                        className="flex-1 overflow-y-auto p-4 bg-gray-900 bg-opacity-30 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_04eeacf4b84afc5b0f5b4c9d0d8b5e5e.png')]"
                        style={{ backgroundSize: '412.5px 749.25px' }}
                    >
                        <div className="space-y-2">
                            {messages.map((message) => (
                                <div key={message._id} className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-2 px-3 shadow ${message.isMe ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                        <p className="text-sm break-words">{message.content}</p>
                                        <div className="flex justify-end items-center mt-1 space-x-1">
                                            <span className={`text-xs ${message.isMe ? 'text-purple-200' : 'text-gray-400'}`}>
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {message.isMe && (
                                                <IoCheckmarkDone
                                                    size={16}
                                                    className={message.isRead ? 'text-blue-400' : (message.isMe ? 'text-purple-300' : 'text-gray-400')}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Message Input */}
                    <div className="bg-gray-700 p-3 flex items-center border-t border-gray-600">
                        <input
                            type="text"
                            placeholder="Type a message"
                            className="flex-1 mx-3 py-2 px-4 rounded-full bg-gray-600 text-white placeholder-gray-300 outline-none focus:ring-1 focus:ring-purple-500"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && newMessage.trim() && handleSendMessage()}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="p-2 text-gray-300 hover:text-white disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-purple-500">
                                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                            </svg>
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 text-gray-400">
                    <div className="max-w-md text-center p-6">
                        <div className="w-48 h-48 md:w-64 md:h-64 mx-auto flex items-center justify-center bg-gray-700 rounded-full mb-6">
                            <RiMessage2Line size={isMobileView ? 60 : 80} className="text-purple-500" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-light text-gray-200 mt-6">Your Chat App</h2>
                        <p className="mt-2 text-sm md:text-base">Select a chat to start messaging.</p>
                        {isMobileView && (
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150"
                            >
                                Open Chats
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatArea;