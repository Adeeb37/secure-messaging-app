<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Messaging App</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef } = React;

        // Lucide icons as inline SVGs
        const Send = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
        const Paperclip = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
        const Search = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
        const Users = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
        const Settings = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
        const Shield = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
        const X = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
        const AlertCircle = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        const Check = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
        const CheckCheck = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" /></svg>;
        const Smile = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        const Trash2 = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
        const Lock = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
        const Unlock = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>;
        const UserPlus = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8v6M23 11h-6" /></svg>;

        const SecureMessagingApp = () => {
            const [isDark, setIsDark] = useState(false);
            const [showLanding, setShowLanding] = useState(true);
            const [showAuthModal, setShowAuthModal] = useState(false);
            const [captchaInput, setCaptchaInput] = useState('');
            const [authError, setAuthError] = useState('');
            const [currentUser, setCurrentUser] = useState(null);
            const [captchaCode, setCaptchaCode] = useState('');

            const [users, setUsers] = useState([
                { id: 'admin', password: 'admin123', name: 'Admin', avatar: '👑', status: 'online', isAdmin: true, blocked: false, lastSeen: new Date().toISOString() },
                { id: 'user1', password: 'pass1', name: 'Alice', avatar: '👩', status: 'online', blocked: false, lastSeen: new Date().toISOString() },
                { id: 'user2', password: 'pass2', name: 'Bob', avatar: '👨', status: 'away', blocked: false, lastSeen: new Date().toISOString() }
            ]);

            const [messages, setMessages] = useState([]);
            const [currentChat, setCurrentChat] = useState(null);
            const [messageInput, setMessageInput] = useState('');
            const [searchQuery, setSearchQuery] = useState('');
            const [showEmojiPicker, setShowEmojiPicker] = useState(false);
            const [showSettings, setShowSettings] = useState(false);
            const [showAdminPanel, setShowAdminPanel] = useState(false);

            const fileInputRef = useRef(null);

            useEffect(() => {
                const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                setIsDark(darkModeQuery.matches);
                const handler = (e) => setIsDark(e.matches);
                darkModeQuery.addEventListener('change', handler);
                return () => darkModeQuery.removeEventListener('change', handler);
            }, []);

            const generateCaptcha = () => {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let code = '';
                for (let i = 0; i < 6; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return code;
            };

            const encrypt = (text) => btoa(text);
            const decrypt = (text) => {
                try { return atob(text); } catch { return text; }
            };

            const handleAuthClick = () => {
                setShowAuthModal(true);
                setAuthError('');
                setCaptchaCode(generateCaptcha());
            };

            const handleCaptchaSubmit = () => {
                const user = users.find(u => u.password === captchaInput);
                if (user && !user.blocked) {
                    setUsers(users.map(u => u.id === user.id ? { ...u, lastSeen: new Date().toISOString() } : u));
                    setCurrentUser(user);
                    setShowAuthModal(false);
                    setShowLanding(false);
                    setAuthError('');
                    setCaptchaInput('');
                } else {
                    setAuthError('Invalid CAPTCHA code');
                    setCaptchaCode(generateCaptcha());
                }
            };

            const sendMessage = () => {
                if (!messageInput.trim()) return;
                const newMsg = {
                    id: Date.now(),
                    chatId: currentChat.id,
                    senderId: currentUser.id,
                    text: encrypt(messageInput),
                    timestamp: new Date().toISOString(),
                    read: false,
                    reactions: []
                };
                setMessages([...messages, newMsg]);
                setMessageInput('');
            };

            const addReaction = (msgId, emoji) => {
                setMessages(messages.map(msg => {
                    if (msg.id === msgId) {
                        const existing = msg.reactions.find(r => r.userId === currentUser.id);
                        if (existing) {
                            return { ...msg, reactions: msg.reactions.filter(r => r.userId !== currentUser.id) };
                        } else {
                            return { ...msg, reactions: [...msg.reactions, { userId: currentUser.id, emoji }] };
                        }
                    }
                    return msg;
                }));
            };

            const filteredMessages = messages.filter(msg => {
                if (!currentChat) return false;
                const isSentToChat = msg.senderId === currentUser.id && msg.chatId === currentChat.id;
                const isReceivedFromChat = msg.senderId === currentChat.id && msg.chatId === currentUser.id;
                return isSentToChat || isReceivedFromChat;
            });

            const emojis = ['😊', '😂', '❤️', '👍', '🔥', '😍', '🎉', '👏'];

            const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
            const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
            const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
            const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
            const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';
            const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

            if (showLanding) {
                return (
                    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors`}>
                        <div className="max-w-4xl mx-auto px-6 py-12">
                            <h1 className="text-4xl font-bold mb-8">Protecting Yourself from Online Scams: A Comprehensive Guide</h1>
                            
                            <div className="prose prose-lg max-w-none space-y-4">
                                <p className="text-lg">
                                    In today's digital age, online scams have become increasingly sophisticated and prevalent. 
                                    As we navigate the vast expanse of the internet, it's crucial to remain vigilant and informed. 
                                    <span 
                                        onClick={handleAuthClick}
                                        className="cursor-pointer hover:opacity-70 transition-opacity"
                                    >
                                        Trusted
                                    </span> sources of information are your first line of defense against malicious actors.
                                </p>

                                <h2 className="text-2xl font-bold mt-8 mb-4">Understanding Common Scam Tactics</h2>
                                <p>
                                    Scammers employ various techniques including phishing emails, fake websites, and social 
                                    engineering attacks. Understanding these tactics is essential for protecting your personal 
                                    information and financial assets.
                                </p>

                                <h3 className="text-xl font-semibold mt-6 mb-3">Phishing Attacks</h3>
                                <p>
                                    Phishing remains one of the most prevalent forms of online fraud. Attackers send emails 
                                    that appear to come from legitimate organizations to steal sensitive data.
                                </p>
                            </div>
                        </div>

                        {showAuthModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                                <div className={`${cardBg} rounded-lg shadow-xl max-w-md w-full`}>
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-8 h-8 text-white" />
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">SecureAuth™</h2>
                                                    <p className="text-blue-100 text-sm">Security Verification</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setShowAuthModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div>
                                            <label className={`block text-sm font-medium ${textClass} mb-2`}>
                                                Enter CAPTCHA Code
                                            </label>
                                            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded mb-4 text-center`}>
                                                <span className="text-2xl font-bold tracking-widest">{captchaCode}</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={captchaInput}
                                                onChange={(e) => setCaptchaInput(e.target.value)}
                                                className={`w-full px-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'} ${textClass}`}
                                                placeholder="Enter code"
                                                onKeyPress={(e) => e.key === 'Enter' && handleCaptchaSubmit()}
                                            />
                                        </div>

                                        {authError && (
                                            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded flex items-center gap-2 text-red-800">
                                                <AlertCircle className="w-5 h-5" />
                                                <span>{authError}</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleCaptchaSubmit}
                                            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded font-medium hover:opacity-90 transition"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            return (
                <div className={`h-screen flex ${bgClass} ${textClass}`}>
                    <div className={`w-80 ${cardBg} border-r ${borderClass} flex flex-col`}>
                        <div className={`p-4 border-b ${borderClass}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">{currentUser?.avatar}</span>
                                <div className="flex-1">
                                    <div className="font-bold">{currentUser?.name}</div>
                                    <div className={`text-sm ${textMuted}`}>{currentUser?.status}</div>
                                </div>
                                <button onClick={() => setShowSettings(true)} className={`p-2 rounded ${hoverBg}`}>
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="relative">
                                <Search className={`absolute left-3 top-2.5 w-5 h-5 ${textMuted}`} />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="flex items-center justify-between px-2 py-1 mb-2">
                                <span className={`text-sm font-medium ${textMuted}`}>Direct Messages</span>
                                {currentUser?.isAdmin && (
                                    <button onClick={() => setShowAdminPanel(true)} className={`p-1 rounded ${hoverBg}`}>
                                        <Shield className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {users.filter(u => u.id !== currentUser?.id && !u.isAdmin).map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => setCurrentChat({ id: user.id, type: 'user', name: user.name, avatar: user.avatar })}
                                    className={`w-full p-3 rounded flex items-center gap-3 ${currentChat?.id === user.id ? 'bg-blue-500 text-white' : hoverBg}`}
                                >
                                    <span className="text-2xl">{user.avatar}</span>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium">{user.name}</div>
                                        <div className={`text-sm ${currentChat?.id === user.id ? 'text-blue-100' : textMuted}`}>
                                            {user.status}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {currentChat ? (
                            <>
                                <div className={`p-4 ${cardBg} border-b ${borderClass} flex items-center gap-3`}>
                                    <span className="text-3xl">{currentChat.avatar}</span>
                                    <div>
                                        <div className="font-bold">{currentChat.name}</div>
                                        <div className={`text-sm ${textMuted}`}>Online</div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {filteredMessages.map(msg => {
                                        const isOwn = msg.senderId === currentUser?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-md ${isOwn ? 'bg-blue-500 text-white' : `${isDark ? 'bg-gray-700' : 'bg-white'} border ${borderClass}`} rounded-lg p-3 relative`}>
                                                    {msg.text && <div>{decrypt(msg.text)}</div>}
                                                    
                                                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                                        <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? false : msg.id)} className="hover:scale-110 transition ml-2">
                                                            <Smile className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {msg.reactions.length > 0 && (
                                                        <div className="flex gap-1 mt-2">
                                                            {msg.reactions.map((r, i) => (
                                                                <span key={i} className="text-lg">{r.emoji}</span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {showEmojiPicker === msg.id && (
                                                        <div className={`absolute bottom-full mb-2 p-2 ${cardBg} border ${borderClass} rounded shadow-lg flex gap-2 z-10`}>
                                                            {emojis.map(emoji => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() => {
                                                                        addReaction(msg.id, emoji);
                                                                        setShowEmojiPicker(false);
                                                                    }}
                                                                    className="text-xl hover:scale-125 transition"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className={`p-4 ${cardBg} border-t ${borderClass}`}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                            placeholder="Type a message..."
                                            className={`flex-1 px-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                                        />
                                        <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                            <Send />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <Users className={`w-16 h-16 mx-auto mb-4 ${textMuted}`} />
                                    <p className={`text-xl ${textMuted}`}>Select a chat to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        ReactDOM.render(<SecureMessagingApp />, document.getElementById('root'));
    </script>
</body>
</html>
