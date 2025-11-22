import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Mic, Smile, Search, Users, Settings, Shield, X, Check, CheckCheck, Reply, Trash2, Download, Upload, Plus, UserPlus, Eye, Lock, Unlock, AlertCircle } from 'lucide-react';

const SecureMessagingApp = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeQuery.matches);
    const handler = (e) => setIsDark(e.matches);
    darkModeQuery.addEventListener('change', handler);
    return () => darkModeQuery.removeEventListener('change', handler);
  }, []);

  const [showLanding, setShowLanding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState('captcha');
  const [captchaInput, setCaptchaInput] = useState('');
  const [twoFAInput, setTwoFAInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [captchaCode, setCaptchaCode] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      send: 'Send', search: 'Search', settings: 'Settings', newGroup: 'New Group',
      typing: 'typing...', lastSeen: 'last seen', online: 'Online', away: 'Away',
      busy: 'Busy', offline: 'Offline', admin: 'Admin Dashboard', users: 'Users',
      messages: 'Messages', drafts: 'Live Drafts', createUser: 'Create User',
      export: 'Export Data', import: 'Import Backup', block: 'Block', unblock: 'Unblock',
      delete: 'Delete', language: 'Language', status: 'Status', notifications: 'Notifications'
    }
  };

  const t = translations[language];

  const [users, setUsers] = useState([
    { id: 'admin', password: 'admin123', twoFA: '123456', name: 'Admin', avatar: '👑', status: 'online', isAdmin: true, blocked: false, lastSeen: new Date().toISOString() },
    { id: 'user1', password: 'pass1', twoFA: '111111', name: 'Alice', avatar: '👩', status: 'online', blocked: false, lastSeen: new Date().toISOString() },
    { id: 'user2', password: 'pass2', twoFA: '222222', name: 'Bob', avatar: '👨', status: 'away', blocked: false, lastSeen: new Date().toISOString() }
  ]);

  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminNameEdit, setShowAdminNameEdit] = useState(false);
  const [adminNewName, setAdminNewName] = useState('');
  const [selectedUserMessages, setSelectedUserMessages] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserData, setNewUserData] = useState({ id: '', name: '', password: '', avatar: '👤' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [drafts, setDrafts] = useState({});

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const encrypt = (text) => btoa(text);
  const decrypt = (text) => {
    try { return atob(text); } catch { return text; }
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
    setAuthStep('captcha');
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
    if (!messageInput.trim() && !replyingTo) return;

    setUsers(users.map(u => u.id === currentUser.id ? { ...u, lastSeen: new Date().toISOString() } : u));

    const newMsg = {
      id: Date.now(),
      chatId: currentChat.id,
      senderId: currentUser.id,
      text: encrypt(messageInput),
      timestamp: new Date().toISOString(),
      read: false,
      reactions: [],
      replyTo: replyingTo,
      selfDestruct: false
    };

    setMessages([...messages, newMsg]);
    setMessageInput('');
    setReplyingTo(null);
    setDrafts({ ...drafts, [`${currentUser.id}-${currentChat.id}`]: '' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newMsg = {
        id: Date.now(),
        chatId: currentChat.id,
        senderId: currentUser.id,
        file: { name: file.name, type: file.type, data: event.target.result },
        timestamp: new Date().toISOString(),
        read: false,
        reactions: []
      };
      setMessages([...messages, newMsg]);
    };
    reader.readAsDataURL(file);
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

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          document.getElementById('search-input')?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (currentChat && messageInput) {
      const key = `${currentUser.id}-${currentChat.id}`;
      setDrafts(prev => ({ ...prev, [key]: messageInput }));
      setTypingUsers(prev => ({ ...prev, [currentUser.id]: currentChat.id }));
      
      const timeout = setTimeout(() => {
        setTypingUsers(prev => {
          const newTyping = { ...prev };
          delete newTyping[currentUser.id];
          return newTyping;
        });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [messageInput, currentChat, currentUser]);

  const filteredMessages = messages.filter(msg => {
    if (!currentChat) return false;
    if (currentChat.type === 'user') {
      const isSentToChat = msg.senderId === currentUser.id && msg.chatId === currentChat.id;
      const isReceivedFromChat = msg.senderId === currentChat.id && msg.chatId === currentUser.id;
      return isSentToChat || isReceivedFromChat;
    }
    return msg.chatId === currentChat.id;
  }).filter(msg => {
    if (!searchQuery) return true;
    return decrypt(msg.text || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '😍', '🎉', '👏'];

  const createUser = (userData) => {
    const newUser = {
      ...userData,
      blocked: false,
      lastSeen: new Date().toISOString(),
      status: 'offline',
      isAdmin: false,
      twoFA: userData.password
    };
    setUsers([...users, newUser]);
    setShowCreateUser(false);
    setNewUserData({ id: '', name: '', password: '', avatar: '👤' });
  };

  const updateUser = (userId, updates) => {
    setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
    setShowEditUser(false);
    setEditingUser(null);
  };

  const deleteUser = (userId) => {
    if (userId !== 'admin') {
      setUsers(users.filter(u => u.id !== userId));
      setMessages(messages.filter(m => m.senderId !== userId));
    }
  };

  const toggleBlockUser = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u));
  };

  const updateAdminName = (newName) => {
    setUsers(users.map(u => u.id === 'admin' ? { ...u, name: newName } : u));
    if (currentUser?.id === 'admin') {
      setCurrentUser({ ...currentUser, name: newName });
    }
  };

  const formatLastSeen = (lastSeenDate) => {
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastSeen.toLocaleDateString();
  };

  const exportData = () => {
    const data = { users, messages, groups, drafts };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-backup.json';
    a.click();
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.users) setUsers(data.users);
        if (data.messages) setMessages(data.messages);
        if (data.groups) setGroups(data.groups);
        if (data.drafts) setDrafts(data.drafts);
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

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
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg mb-6">
              In today's digital age, online scams have become increasingly sophisticated and prevalent. 
              As we navigate the vast expanse of the internet, it's crucial to remain vigilant and informed. 
              <span 
                onClick={handleAuthClick}
                className="cursor-pointer hover:opacity-70 transition-opacity"
              >
                Trusted
              </span> sources of information are your first line of defense against malicious actors 
              who seek to exploit unsuspecting individuals through various deceptive tactics. The landscape 
              of cybercrime continues to evolve, with attackers developing new methods to bypass security 
              measures and manipulate victims into revealing sensitive information or transferring money.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Understanding the Psychology of Scammers</h2>
            <p className="mb-4">
              Scammers are master manipulators who understand human psychology and exploit our natural 
              tendencies. They prey on emotions such as fear, greed, curiosity, and trust. By creating 
              scenarios that trigger these emotions, they bypass our rational thinking and prompt us to 
              take actions we would normally avoid. Understanding this psychological component is crucial 
              to developing effective defenses against online fraud.
            </p>
            <p className="mb-4">
              One of the most powerful tools in a scammer's arsenal is the creation of urgency. Whether 
              it's a limited-time offer, an account that will be closed, or a loved one in immediate danger, 
              the sense that you must act now prevents careful consideration of the situation. This urgency 
              bypasses our critical thinking processes and pushes us toward immediate action. Recognizing 
              this tactic is the first step in protecting yourself.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Common Types of Online Scams</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">Phishing and Spear Phishing</h3>
            <p className="mb-4">
              Phishing remains one of the most prevalent forms of online fraud. These attacks typically 
              involve emails or messages that appear to come from legitimate organizations, such as banks, 
              government agencies, or popular online services. The messages contain links to fake websites 
              designed to steal login credentials, credit card numbers, or other sensitive data. What makes 
              phishing particularly dangerous is its ability to mimic legitimate communications with 
              remarkable accuracy.
            </p>
            <p className="mb-4">
              Spear phishing takes this approach to the next level by targeting specific individuals or 
              organizations. Attackers research their victims, gathering information from social media, 
              company websites, and other public sources. This information is then used to craft highly 
              personalized messages that appear to come from colleagues, friends, or business partners. 
              The personalization makes these attacks much more convincing and therefore more dangerous.
            </p>
            <p className="mb-4">
              To identify phishing attempts, look for several telltale signs. Generic greetings like 
              "Dear Customer" instead of your name, spelling and grammatical errors, suspicious sender 
              addresses that don't quite match the legitimate organization, and requests for personal 
              information are all red flags. Legitimate organizations rarely ask for sensitive data via 
              email. Always verify the sender's identity by contacting the organization directly through 
              official channels, and never click on links in suspicious emails.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Romance Scams</h3>
            <p className="mb-4">
              Romance scams exploit one of our most fundamental human needs: the desire for connection 
              and companionship. Scammers create fake profiles on dating sites and social media platforms, 
              often using stolen photos of attractive individuals. They invest time in building relationships 
              with their victims, sometimes over weeks or months, creating a false sense of intimacy and trust.
            </p>
            <p className="mb-4">
              Once trust is established, the scammer begins to request money. The reasons vary widely: 
              medical emergencies, business opportunities, travel expenses to meet in person, or customs 
              fees for sending gifts. Each request is accompanied by a compelling story and promises of 
              repayment or future rewards. Victims often send money multiple times before realizing they've 
              been scammed, and by then, significant financial damage has occurred.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Investment and Financial Scams</h3>
            <p className="mb-4">
              The promise of quick returns and guaranteed profits is a classic red flag for investment 
              scams. Ponzi schemes, pyramid schemes, and fraudulent cryptocurrency investments have 
              defrauded countless individuals of their life savings. These scams often use high-pressure 
              sales tactics and create a false sense of exclusivity or limited-time opportunity. They may 
              show fabricated testimonials from other "investors" who claim to have made substantial profits.
            </p>
            <p className="mb-4">
              Cryptocurrency scams have become particularly prevalent in recent years. The complexity and 
              relative newness of cryptocurrency make it an ideal vehicle for fraud. Scammers create fake 
              exchanges, investment platforms, or initial coin offerings (ICOs) that promise extraordinary 
              returns. They may also use social media to impersonate celebrities or successful investors, 
              claiming to offer exclusive investment opportunities or giveaways that require an initial 
              payment or transfer of cryptocurrency.
            </p>
            <p className="mb-4">
              Before investing in any opportunity, conduct thorough research. Verify that the company 
              or individual is registered with appropriate regulatory bodies such as the Securities and 
              Exchange Commission (SEC) or Financial Industry Regulatory Authority (FINRA). Be skeptical 
              of unsolicited investment offers, especially those promising returns that seem too good to 
              be true. Remember that legitimate investments carry risk, and no one can guarantee profits. 
              If an investment promises guaranteed returns with no risk, it's almost certainly a scam.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Tech Support Scams</h3>
            <p className="mb-4">
              Tech support scams prey on people's lack of technical knowledge and fear of computer problems. 
              Scammers may call claiming to be from Microsoft, Apple, or other major technology companies, 
              warning that your computer has been infected with malware or has other critical issues. They 
              may also use pop-up messages on websites that display fake security warnings and provide a 
              phone number to call for assistance.
            </p>
            <p className="mb-4">
              Once contact is established, the scammer guides the victim through steps that appear to 
              diagnose problems but actually grant the scammer remote access to the computer. With this 
              access, they can install actual malware, steal personal information, or show fake scan results 
              that "prove" the computer is infected. They then offer to fix the problems for a fee, often 
              charging hundreds or thousands of dollars for unnecessary or harmful services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Protecting Your Digital Identity</h2>
            <p className="mb-4">
              Your digital identity is valuable and vulnerable. It encompasses your personal information, 
              online accounts, financial data, and digital reputation. Protecting it requires a multi-layered 
              approach that includes strong passwords, two-factor authentication, regular software updates, 
              and careful consideration of what information you share online. Each layer of protection adds 
              an additional barrier that makes it more difficult for attackers to compromise your accounts 
              or steal your identity.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Creating Strong Security Practices</h3>
            <p className="mb-4">
              Password security is the foundation of digital protection. Use unique, complex passwords for 
              each online account. A strong password should be at least 12 characters long and include a 
              mix of uppercase and lowercase letters, numbers, and special characters. Avoid using easily 
              guessable information such as birthdays, names, or common words. Password managers can help 
              you generate and store these complex passwords securely, eliminating the need to remember 
              multiple complex passwords.
            </p>
            <p className="mb-4">
              Two-factor authentication (2FA) adds an extra layer of security beyond just a password. With 
              2FA enabled, accessing an account requires both something you know (your password) and something 
              you have (such as a code sent to your phone or generated by an authentication app). This means 
              that even if a scammer obtains your password, they still cannot access your account without 
              the second factor. Enable 2FA on all accounts that offer it, particularly email, banking, and 
              social media accounts.
            </p>
            <p className="mb-4">
              Be cautious about the information you share on social media. Scammers use details about your 
              life, work, and relationships to craft convincing social engineering attacks. Information such 
              as your pet's name, mother's maiden name, or first car—often used as security questions—should 
              never be shared publicly. Review your privacy settings regularly and limit the amount of personal 
              information visible to the public or to people outside your trusted network.
            </p>
            <p className="mb-4">
              Keep your devices and software up to date with the latest security patches. Software updates 
              often include fixes for security vulnerabilities that attackers could exploit. Enable automatic 
              updates when possible, and regularly check for updates to your operating system, web browsers, 
              and applications. Antivirus software and firewalls provide additional protection against malware 
              and unauthorized access, but they should be viewed as supplements to, not replacements for, 
              good security practices.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Recognizing Social Engineering</h3>
            <p className="mb-4">
              Social engineering attacks exploit human psychology rather than technical vulnerabilities. 
              These attacks manipulate people into breaking normal security procedures or divulging confidential 
              information. Scammers may impersonate authority figures, create fake emergencies, or build trust 
              over time before making their move. They might pose as tech support representatives, government 
              officials, bank employees, or even family members in distress.
            </p>
            <p className="mb-4">
              One common social engineering tactic is pretexting, where the scammer creates a fabricated 
              scenario to obtain information. For example, they might call pretending to conduct a survey, 
              update customer records, or verify account information. The scenario seems legitimate and the 
              questions appear harmless at first, but the information gathered can be used for identity theft 
              or to gain access to accounts.
            </p>
            <p className="mb-4">
              Be suspicious of unsolicited contact, especially requests for money, personal information, 
              or remote access to your computer. Verify the identity of anyone claiming to represent an 
              organization by contacting them through official channels listed on the organization's website. 
              Never make decisions under pressure, and take time to think critically about requests that seem 
              unusual or urgent. Trust your instincts—if something feels wrong, it probably is.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Safe Online Shopping and E-Commerce</h2>
            <p className="mb-4">
              Online shopping offers convenience but also presents opportunities for fraud. Fake e-commerce 
              sites, counterfeit goods, and non-delivery scams are common pitfalls. When shopping online, 
              stick to reputable retailers with established track records. Look for HTTPS in the URL and a 
              padlock icon in your browser's address bar, indicating a secure connection. However, remember 
              that these indicators only mean the connection is encrypted, not that the site itself is legitimate.
            </p>
            <p className="mb-4">
              Research unfamiliar retailers before making purchases. Look for customer reviews on independent 
              websites, not just on the retailer's own site. Check for contact information including a physical 
              address and phone number. Be wary of prices that seem too good to be true—they usually are. 
              Extremely low prices on high-demand items are often a sign of counterfeit goods or a complete scam.
            </p>
            <p className="mb-4">
              Use credit cards rather than debit cards for online purchases. Credit cards typically offer 
              better fraud protection and dispute resolution processes. If there's a problem with a purchase, 
              you can dispute the charge with your credit card company. Debit cards, on the other hand, directly 
              access your bank account, making it more difficult to recover funds if you're scammed.
            </p>
            <p className="mb-4">
              Be extremely cautious of sellers who insist on payment through wire transfers, cryptocurrency, 
              gift cards, or money transfer services. These payment methods are difficult to trace and virtually 
              impossible to reverse. Legitimate businesses accept standard payment methods such as credit cards 
              or established payment platforms like PayPal that offer buyer protection.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Mobile Device Security</h2>
            <p className="mb-4">
              Mobile devices have become primary targets for scammers as we increasingly use smartphones and 
              tablets for banking, shopping, and communication. Mobile scams include malicious apps, SMS phishing 
              (smishing), and fake Wi-Fi hotspots. Protect your mobile device by only downloading apps from 
              official app stores, keeping your operating system and apps updated, and using security features 
              such as screen locks and biometric authentication.
            </p>
            <p className="mb-4">
              Be cautious when connecting to public Wi-Fi networks. Attackers can set up fake hotspots that 
              mimic legitimate networks, intercepting data transmitted over the connection. When using public 
              Wi-Fi, avoid accessing sensitive accounts or conducting financial transactions. Consider using 
              a virtual private network (VPN) to encrypt your internet connection and protect your data from 
              interception.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">What to Do If You're Targeted or Victimized</h2>
            <p className="mb-4">
              If you suspect you've been targeted by a scam or have fallen victim to fraud, act quickly. 
              Time is critical in minimizing damage and potentially recovering funds. Contact your bank or 
              credit card company immediately to freeze accounts and dispute fraudulent charges. Many financial 
              institutions have fraud departments available 24/7 and can take immediate action to prevent 
              further unauthorized transactions.
            </p>
            <p className="mb-4">
              Change passwords for any compromised accounts, and enable two-factor authentication if you 
              haven't already. If you've provided personal information such as your Social Security number, 
              consider placing a fraud alert or credit freeze on your credit reports. This makes it more 
              difficult for identity thieves to open new accounts in your name.
            </p>
            <p className="mb-4">
              Report the incident to relevant authorities. In the United States, you can file complaints with 
              the Federal Trade Commission (FTC) at IdentityTheft.gov, the Internet Crime Complaint Center 
              (IC3) at ic3.gov, and your local law enforcement. While recovery of lost funds is not always 
              possible, reporting helps authorities track scam operations and potentially prevent others from 
              becoming victims.
            </p>
            <p className="mb-4">
              Document everything related to the scam. Save emails, text messages, screenshots, transaction 
              records, and any other evidence. This documentation is valuable for investigations, dispute 
              resolution with financial institutions, and potential legal action. Create a timeline of events 
              and keep detailed notes about all communications with the scammer and with authorities.
            </p>
            <p className="mb-4">
              Monitor your credit reports for signs of identity theft. You're entitled to one free credit 
              report per year from each of the three major credit bureaus through AnnualCreditReport.com. 
              Review these reports carefully for any unfamiliar accounts or inquiries. Consider using a credit 
              monitoring service that alerts you to changes in your credit report.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Educating Others and Building a Security Culture</h2>
            <p className="mb-4">
              Cybersecurity is a collective responsibility. Share your knowledge with friends, family, and 
              colleagues, especially those who may be more vulnerable to scams. Elderly relatives and those 
              less familiar with technology are often targeted by scammers because they may be more trusting 
              or less aware of common scam tactics. Take time to educate them about the risks and help them 
              implement security measures on their devices and accounts.
            </p>
            <p className="mb-4">
              In the workplace, advocate for regular security training and awareness programs. Human error 
              remains one of the most common causes of security breaches. Organizations should foster a culture 
              where employees feel comfortable reporting suspicious emails or activities without fear of 
              blame or punishment. Regular training helps keep security awareness top of mind and ensures 
              employees are aware of the latest threats and tactics.
            </p>
            <p className="mb-4">
              Stay informed about emerging threats and scam techniques by following reputable cybersecurity 
              news sources and organizations. The Cybersecurity and Infrastructure Security Agency (CISA), 
              the Federal Trade Commission (FTC), and technology companies regularly publish information about 
              new scams and security threats. Subscribe to security newsletters and follow trusted security 
              experts on social media to stay current with the latest developments.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">The Future of Online Scams</h2>
            <p className="mb-4">
              As technology evolves, so do the tactics used by scammers. Artificial intelligence and machine 
              learning are making scams more sophisticated and harder to detect. Deepfake technology can create 
              convincing fake videos or audio recordings of real people, potentially being used for elaborate 
              impersonation scams. Automated systems can generate personalized phishing messages at scale, 
              making each attack more targeted and convincing.
            </p>
            <p className="mb-4">
              The Internet of Things (IoT) introduces new vulnerabilities as more devices become connected to 
              the internet. Smart home devices, wearables, and connected appliances can be targets for hackers, 
              potentially providing access to your network and personal information. As we adopt new technologies, 
              we must remain vigilant about their security implications and take appropriate precautions.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Conclusion</h2>
            <p className="mb-4">
              Protecting yourself from online scams requires awareness, skepticism, and proactive security 
              measures. By understanding common scam tactics, securing your digital identity, practicing safe 
              online shopping, and knowing how to respond to threats, you can significantly reduce your risk 
              of becoming a victim. Remember that scammers constantly evolve their tactics, adapting to new 
              technologies and exploiting current events. What worked as protection yesterday may not be 
              sufficient tomorrow.
            </p>
            <p className="mb-4">
              Stay informed, trust your instincts, and remember that if something seems too good to be true, 
              it probably is. Take time to verify information and don't let anyone pressure you into making 
              quick decisions, especially those involving money or personal information. Your vigilance today 
              can prevent significant financial and emotional distress tomorrow.
            </p>
            <p className="mb-4">
              The battle against online scams is ongoing, but with knowledge, awareness, and proper security 
              practices, you can protect yourself and your loved ones. Share this information, stay vigilant, 
              and remember that cybersecurity is not a one-time action but a continuous practice. By building 
              strong security habits and maintaining awareness of emerging threats, you can navigate the digital 
              world safely and confidently.
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
                      <p className="text-blue-100 text-sm">Multi-Factor Authentication</p>
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

  if (showAdminPanel && currentUser?.isAdmin) {
    return (
      <div className={`min-h-screen ${bgClass} ${textClass}`}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{t.admin}</h1>
            <button onClick={() => setShowAdminPanel(false)} className={`px-4 py-2 ${cardBg} border ${borderClass} rounded ${hoverBg}`}>
              Back to Chat
            </button>
          </div>

          <div className="grid gap-6">
            <div className={`${cardBg} border ${borderClass} rounded-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t.users}</h2>
                <button onClick={() => setShowCreateUser(true)} className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1">
                  <UserPlus className="w-4 h-4" />
                  Create User
                </button>
              </div>
              <div className="space-y-3">
                {users.map(user => (
                  <div key={user.id} className={`p-4 border ${borderClass} rounded flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{user.avatar}</span>
                      <div>
                        <div className="font-medium">{user.name} ({user.id})</div>
                        <div className={`text-sm ${textMuted}`}>Pass: {user.password}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleBlockUser(user.id)} className={`p-2 ${user.blocked ? 'bg-green-500' : 'bg-yellow-500'} text-white rounded`}>
                        {user.blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      {user.id !== 'admin' && (
                        <button onClick={() => deleteUser(user.id)} className="p-2 bg-red-500 text-white rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardBg} border ${borderClass} rounded-lg p-6`}>
              <h2 className="text-xl font-bold mb-4">{t.messages} ({messages.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className={`p-3 border ${borderClass} rounded text-sm`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{users.find(u => u.id === msg.senderId)?.name}</span>
                        <span className={textMuted}> → Chat: {msg.chatId}</span>
                        {msg.text && <div className="mt-1">{decrypt(msg.text)}</div>}
                      </div>
                      <button onClick={() => setMessages(messages.filter(m => m.id !== msg.id))} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {showCreateUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBg} rounded-lg max-w-md w-full p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create New User</h2>
                <button onClick={() => setShowCreateUser(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={newUserData.id}
                  onChange={(e) => setNewUserData({...newUserData, id: e.target.value})}
                  className={`w-full px-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                  placeholder="User ID"
                />
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                  className={`w-full px-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  className={`w-full px-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                  placeholder="Password"
                />
              </div>

              <button
                onClick={() => {
                  if (newUserData.id && newUserData.name && newUserData.password) {
                    createUser(newUserData);
                  }
                }}
                className="w-full mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Create User
              </button>
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
              id="search-input"
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
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
                    {formatLastSeen(user.lastSeen)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className={`p-4 ${cardBg} border-b ${borderClass} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentChat.avatar}</span>
                <div>
                  <div className="font-bold">{currentChat.name}</div>
                  <div className={`text-sm ${textMuted}`}>{t.online}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.map(msg => {
                const sender = users.find(u => u.id === msg.senderId);
                const isOwn = msg.senderId === currentUser?.id;
                
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md ${isOwn ? 'bg-blue-500 text-white' : `${isDark ? 'bg-gray-700' : 'bg-white'} border ${borderClass}`} rounded-lg p-3`}>
                      {msg.text && <div>{decrypt(msg.text)}</div>}
                      
                      {msg.file && (
                        <div className="mt-2">
                          {msg.file.type.startsWith('image/') ? (
                            <img src={msg.file.data} alt={msg.file.name} className="max-w-full rounded" />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-opacity-20 bg-black rounded">
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm">{msg.file.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        <div className="flex items-center gap-2">
                          {isOwn && (msg.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />)}
                          <button onClick={() => setShowEmojiPicker(msg.id)} className="hover:scale-110 transition">
                            <Smile className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {msg.reactions.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {msg.reactions.map((r, i) => (
                            <span key={i} className="text-lg">{r.emoji}</span>
                          ))}
                        </div>
                      )}

                      {showEmojiPicker === msg.id && (
                        <div className={`absolute mt-2 p-2 ${cardBg} border ${borderClass} rounded shadow-lg flex gap-2`}>
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
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button onClick={() => fileInputRef.current?.click()} className={`p-2 rounded ${hoverBg}`}>
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}
                />

                <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  <Send className="w-5 h-5" />
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

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-lg max-w-md w-full p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.settings}</h2>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t.status}</label>
                <select className={`w-full px-4 py-2 border ${borderClass} rounded ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                  <option>{t.online}</option>
                  <option>{t.away}</option>
                  <option>{t.busy}</option>
                  <option>{t.offline}</option>
                </select>
              </div>

              <button onClick={exportData} className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Backup Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureMessagingApp;