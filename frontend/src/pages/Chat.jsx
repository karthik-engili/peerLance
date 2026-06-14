import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/authStore";
import { useChat } from "../store/chatStore";
import { useProject } from "../store/projectStore";
import { useBid } from "../store/bidStore";
import { Loader } from "../components/Loader";
import { Button } from "../components/Button";
import { Send, MessageSquare, User, Check, CheckCheck } from "lucide-react";
import { io } from "socket.io-client";
import api from "../api/axiosInstance";

export const Chat = () => {
  const { currentUser } = useAuth();
  const { messages, fetchMessages, sendMessage, addMessage, markAsRead, reset: resetChat } = useChat();
  const { fetchMyProjects, myProjects } = useProject();
  const { fetchMyBids, myBids } = useBid();

  const [activeProjects, setActiveProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch available chat rooms (projects in progress/completed)
  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        if (currentUser.role === "CLIENT") {
          const res = await fetchMyProjects();
          // filter IN_PROGRESS or COMPLETED
          const chatRooms = myProjects.filter((p) => ["IN_PROGRESS", "COMPLETED"].includes(p.status));
          setActiveProjects(chatRooms);
        } else {
          await fetchMyBids();
          // Filter accepted bids
          const accepted = myBids
            .filter((b) => b.status === "ACCEPTED" || b.project?.status === "IN_PROGRESS" || b.project?.status === "COMPLETED")
            .map((b) => b.project);
          
          // De-duplicate projects
          const uniqueRooms = Array.from(new Map(accepted.map((p) => [p._id, p])).values());
          setActiveProjects(uniqueRooms);
        }
      } catch (err) {
        // silent
      } finally {
        setLoadingRooms(false);
      }
    };

    if (currentUser) {
      loadRooms();
    }
  }, [currentUser, fetchMyProjects, fetchMyBids]);

  // 2. Setup socket connection and listeners
  useEffect(() => {
    socketRef.current = io("http://localhost:6868", { withCredentials: true });
    
    socketRef.current.on("receive-message", (msg) => {
      // Append only if it belongs to selected room
      if (selectedProject && msg.project === selectedProject._id) {
        addMessage(msg);
        markAsRead(selectedProject._id);
      }
    });

    socketRef.current.on("user-typing", ({ projectId, userId }) => {
      if (selectedProject && projectId === selectedProject._id && userId !== currentUser._id) {
        setOtherUserTyping(true);
      }
    });

    socketRef.current.on("stop-typing", ({ projectId, userId }) => {
      if (selectedProject && projectId === selectedProject._id && userId !== currentUser._id) {
        setOtherUserTyping(false);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedProject, addMessage, markAsRead, currentUser]);

  // 3. Join active project room, fetch history
  useEffect(() => {
    if (selectedProject) {
      // Join room
      socketRef.current.emit("join-project", selectedProject._id);
      fetchMessages(selectedProject._id);
      markAsRead(selectedProject._id);
    } else {
      resetChat();
    }
  }, [selectedProject, fetchMessages, resetChat, markAsRead]);

  // 4. Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedProject) return;

    // Determine receiver ID
    const isClient = currentUser._id === selectedProject.client?._id || currentUser._id === selectedProject.client;
    
    // Freelancer ID is in acceptedBid.freelancer
    const receiverId = isClient
      ? selectedProject.acceptedBid?.freelancer?._id || selectedProject.acceptedBid?.freelancer
      : selectedProject.client?._id || selectedProject.client;

    if (!receiverId) {
      console.error("No receiver ID found");
      return;
    }

    // Stop typing immediately
    socketRef.current.emit("stop-typing", { projectId: selectedProject._id, userId: currentUser._id });
    setTyping(false);

    try {
      await sendMessage({
        projectId: selectedProject._id,
        receiverId,
        text: inputText,
      });
      setInputText("");
    } catch (err) {
      // Handle error
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (!typing && selectedProject) {
      setTyping(true);
      socketRef.current.emit("user-typing", { projectId: selectedProject._id, userId: currentUser._id });
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedProject) {
        socketRef.current.emit("stop-typing", { projectId: selectedProject._id, userId: currentUser._id });
        setTyping(false);
      }
    }, 2000);
  };

  const getPartnerName = (project) => {
    const isClient = currentUser._id === project.client?._id || currentUser._id === project.client;
    if (isClient) {
      // Freelancer is partner
      return project.acceptedBid?.freelancer
        ? `${project.acceptedBid.freelancer.firstName} ${project.acceptedBid.freelancer.lastName || ""}`.trim()
        : "Freelancer";
    } else {
      // Client is partner
      return project.client?.firstName
        ? `${project.client.firstName} ${project.client.lastName || ""}`.trim()
        : "Client";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 h-[calc(100vh-100px)]">
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden flex h-full shadow-2xl">
        
        {/* Sidebar rooms list */}
        <div className="w-80 border-r border-[#2A2A2A] flex flex-col bg-[#121212]/50">
          <div className="p-4 border-b border-[#2A2A2A]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#1DB954]" /> Active Chats
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-[#2A2A2A]/50">
            {loadingRooms ? (
              <div className="p-8 text-center text-xs text-[#B3B3B3]">Loading chat rooms...</div>
            ) : activeProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#B3B3B3] italic">
                Active chat rooms unlock once a bid is accepted.
              </div>
            ) : (
              activeProjects.map((project) => {
                const partnerName = getPartnerName(project);
                const isSelected = selectedProject?._id === project._id;
                
                return (
                  <button
                    key={project._id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-4 hover:bg-[#212121]/50 transition-colors flex items-center gap-3 cursor-pointer ${
                      isSelected ? "bg-[#212121]" : ""
                    }`}
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${partnerName}`}
                      alt={partnerName}
                      className="w-10 h-10 rounded-full object-cover bg-[#212121]"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{partnerName}</h4>
                      <p className="text-xs text-[#B3B3B3] truncate mt-0.5">{project.title}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messaging window */}
        <div className="flex-1 flex flex-col bg-[#181818]">
          {selectedProject ? (
            <>
              {/* Active Room Header */}
              <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#212121]/40">
                <div>
                  <h3 className="font-bold text-white text-base">
                    {getPartnerName(selectedProject)}
                  </h3>
                  <p className="text-xs text-[#B3B3B3] mt-0.5">
                    Discussing: <span className="text-white">{selectedProject.title}</span>
                  </p>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-3 max-w-[70%] ${
                        isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      <img
                        src={msg.sender?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.sender?.firstName || "User"}`}
                        alt="avatar"
                        className="w-8 h-8 rounded-full bg-[#212121] flex-shrink-0"
                      />
                      <div>
                        <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                          isMe 
                            ? "bg-[#1DB954] text-white rounded-tr-none" 
                            : "bg-[#212121] text-[#B3B3B3] rounded-tl-none border border-[#2A2A2A]"
                        }`}>
                          <p>{msg.text}</p>
                        </div>
                        <div className={`text-[10px] text-[#535353] mt-1 flex items-center gap-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            msg.isRead ? <CheckCheck className="w-3 h-3 text-[#1DB954]" /> : <Check className="w-3 h-3 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing status indicator */}
                {otherUserTyping && (
                  <div className="flex items-center gap-2 text-xs text-[#B3B3B3] italic">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#B3B3B3] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#B3B3B3] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#B3B3B3] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span>typing...</span>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Message inputs form */}
              <div className="p-4 border-t border-[#2A2A2A] bg-[#212121]/20">
                <form onSubmit={handleSend} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={handleInputChange}
                    className="flex-1 bg-[#121212] border border-[#2A2A2A] focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] text-white text-sm rounded-full px-5 py-3 placeholder-[#535353] focus:outline-none transition-all"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="h-11 w-11 rounded-full p-0 flex items-center justify-center flex-shrink-0"
                    disabled={!inputText.trim()}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="w-12 h-12 text-[#B3B3B3] mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Your Conversations</h3>
              <p className="text-sm text-[#B3B3B3] max-w-sm">
                Select an active project chat room from the sidebar to start collaborating in real-time.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
