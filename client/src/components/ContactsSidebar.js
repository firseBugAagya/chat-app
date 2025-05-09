"use client"
import { FiLogOut, FiMoreVertical, FiSearch } from 'react-icons/fi';
import { BiArrowBack } from 'react-icons/bi';

const ContactsSidebar = ({
    user,
    contacts,
    searchTerm,
    setSearchTerm,
    selectedContact,
    setSelectedContact,
    isMobileView,
    showSidebar,
    setShowSidebar,
    showDropdown,
    setShowDropdown,
    handleLogout,
    filteredContacts
}) => {
    return (
        <div className={`bg-gray-800 text-gray-100 flex flex-col ${isMobileView && !showSidebar ? 'hidden' : ''} ${isMobileView && showSidebar ? 'absolute inset-0 z-20 w-full h-full' : 'md:relative md:w-1/3 lg:w-1/4 border-r border-gray-700'}`}>
            {/* Sidebar Header */}
            <div className="bg-gray-700 p-3 flex justify-between items-center">
                <div className="flex items-center">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <h2 className="text-xl font-semibold text-gray-200">{user.name || 'Chats'}</h2>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="p-1 rounded-full hover:bg-gray-600 text-gray-300 hover:text-white"
                    >
                        <FiMoreVertical size={20} />
                    </button>
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                            >
                                <FiLogOut className="mr-2" />Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 bg-gray-700">
                <div className="bg-gray-600 text-white rounded-lg flex items-center px-3 py-1">
                    <FiSearch className="text-gray-300 mr-2" />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        className="flex-1 outline-none text-sm py-2 bg-gray-600 text-white placeholder-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Contacts List */}
            <div className="overflow-y-auto flex-1">
                {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
                    <div
                        key={contact._id}
                        className={`flex items-center p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${selectedContact?._id === contact._id ? 'bg-gray-600' : ''}`}
                        onClick={() => {
                            setSelectedContact(contact);
                            if (isMobileView) setShowSidebar(false);
                        }}
                    >
                        <div className="relative">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}`}
                                alt={contact.name}
                                className="w-12 h-12 rounded-full"
                            />
                            {contact.isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                            )}
                        </div>
                        <div className="ml-3 flex-1">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-gray-100">{contact.name}</h3>
                                {contact.updatedAt && (
                                    <span className="text-xs text-gray-400">
                                        {new Date(contact.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-400 truncate max-w-[150px] md:max-w-[180px]">
                                    {contact.lastMessage}
                                </p>
                                {contact.unreadCount > 0 && (
                                    <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                                        {contact.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="p-4 text-center text-gray-400">No contacts found.</div>
                )}
            </div>
        </div>
    );
};

export default ContactsSidebar;