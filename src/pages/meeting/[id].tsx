import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  Users,
  MessageSquare,
  Settings,
  Copy,
  Check,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { meetingService } from "@/services/meetingService";
import { authService } from "@/services/authService";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Participant {
  id: string;
  user_id: string;
  display_name: string;
  is_camera_on: boolean;
  is_mic_on: boolean;
  is_screen_sharing: boolean;
}

export default function MeetingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [participants, setParticipantsState] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isJoined, setIsJoined] = useState(false);

  const {
    localStream,
    participants: webrtcParticipants,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    initializeLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    setParticipants: setWebRTCParticipants,
    cleanup,
  } = useWebRTC(id as string, userId);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize user and join meeting
  useEffect(() => {
    if (!id) return;

    const initializeMeeting = async () => {
      try {
        // Get or create user
        let user = await authService.getCurrentUser();
        
        if (!user) {
          const anonymousId = `guest_${Math.random().toString(36).substring(2, 15)}`;
          user = { id: anonymousId, email: `${anonymousId}@anonymous.com` };
        }

        setUserId(user.id);

        // Get meeting details
        const { data: meetingData, error: meetingError } = await meetingService.getMeetingById(id as string);
        
        if (meetingError || !meetingData) {
          toast({
            title: "Meeting tidak ditemukan",
            description: "Meeting tidak valid atau sudah berakhir.",
            variant: "destructive",
          });
          router.push("/");
          return;
        }

        setMeeting(meetingData);

        // Initialize media stream
        await initializeLocalStream();

        // Join meeting
        const name = `User ${Math.floor(Math.random() * 1000)}`;
        setDisplayName(name);
        
        await meetingService.joinMeeting(id as string, user.id, name);
        setIsJoined(true);

        // Load participants and chat
        loadParticipants();
        loadChatMessages();
      } catch (error) {
        console.error("Error initializing meeting:", error);
        toast({
          title: "Error",
          description: "Gagal bergabung ke meeting.",
          variant: "destructive",
        });
      }
    };

    initializeMeeting();

    return () => {
      cleanup();
    };
  }, [id]);

  // Setup local video stream
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!id || !userId || !isJoined) return;

    // Subscribe to WebRTC signals
    const signalChannel = meetingService.subscribeToSignals(
      id as string,
      userId,
      async (signal) => {
        console.log("Received signal:", signal);
        
        if (signal.signal_type === "offer") {
          await handleOffer(signal.from_user_id, signal.signal_data);
        } else if (signal.signal_type === "answer") {
          await handleAnswer(signal.from_user_id, signal.signal_data);
        } else if (signal.signal_type === "ice-candidate") {
          await handleIceCandidate(signal.from_user_id, signal.signal_data);
        }
      }
    );

    // Subscribe to participants changes
    const participantsChannel = meetingService.subscribeToParticipants(
      id as string,
      (payload) => {
        console.log("Participants update:", payload);
        loadParticipants();
        
        // Create offer for new participants
        if (payload.eventType === "INSERT" && payload.new.user_id !== userId) {
          createOffer(payload.new.user_id);
        }
      }
    );

    // Subscribe to chat messages
    const chatChannel = meetingService.subscribeToChatMessages(
      id as string,
      (message) => {
        setChatMessages((prev) => [...prev, message]);
      }
    );

    return () => {
      signalChannel.unsubscribe();
      participantsChannel.unsubscribe();
      chatChannel.unsubscribe();
    };
  }, [id, userId, isJoined]);

  const loadParticipants = async () => {
    if (!id) return;
    
    const { data, error } = await meetingService.getParticipants(id as string);
    if (!error && data) {
      setParticipantsState(data);
    }
  };

  const loadChatMessages = async () => {
    if (!id) return;
    
    const { data, error } = await meetingService.getChatMessages(id as string);
    if (!error && data) {
      setChatMessages(data);
    }
  };

  const copyMeetingLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !id || !userId) return;

    await meetingService.sendChatMessage(id as string, userId, newMessage);
    setNewMessage("");
  };

  const endCall = async () => {
    if (id && userId) {
      await meetingService.leaveMeeting(id as string, userId);
      
      if (meeting && meeting.host_id === userId) {
        await meetingService.endMeeting(id as string);
      }
    }
    
    cleanup();
    router.push("/");
  };

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading meeting...</div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${meeting.title} - Chaesa Live`}
        description="Join the video meeting on Chaesa Live"
      />

      <div className="min-h-screen bg-gray-950 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold">{meeting.title}</h1>
                <button
                  onClick={copyMeetingLink}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Link copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Code: {meeting.meeting_code}
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-gray-400 hover:text-white hover:bg-gray-800 relative"
              >
                <Users className="w-5 h-5" />
                {participants.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {participants.length}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChat(!showChat)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Grid */}
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl w-full">
              {/* Local Video */}
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video">
                {isCameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <span className="text-white text-sm font-medium">{displayName} (You)</span>
                </div>
                {!isMicOn && (
                  <div className="absolute top-4 right-4 bg-red-500 p-2 rounded-lg">
                    <MicOff className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Remote Participants */}
              {Array.from(webrtcParticipants.values()).map((participant) => (
                <div
                  key={participant.userId}
                  className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video"
                >
                  {participant.stream ? (
                    <video
                      autoPlay
                      playsInline
                      ref={(el) => {
                        if (el && participant.stream) {
                          el.srcObject = participant.stream;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {participant.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <span className="text-white text-sm font-medium">{participant.displayName}</span>
                  </div>
                  {!participant.isMicOn && (
                    <div className="absolute top-4 right-4 bg-red-500 p-2 rounded-lg">
                      <MicOff className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Participants Sidebar */}
          {showParticipants && (
            <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-white font-semibold">Participants ({participants.length})</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {participant.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{participant.display_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {!participant.is_mic_on && (
                          <MicOff className="w-3 h-3 text-red-400" />
                        )}
                        {!participant.is_camera_on && (
                          <VideoOff className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-white font-semibold">Chat</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <p className="text-xs text-gray-400">
                        {msg.profiles?.full_name || "Unknown User"}
                      </p>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-white text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 bg-gray-800 text-white border-gray-700 focus:border-purple-500"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-5">
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={toggleMic}
              size="lg"
              className={cn(
                "rounded-full w-14 h-14",
                isMicOn
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button
              onClick={toggleCamera}
              size="lg"
              className={cn(
                "rounded-full w-14 h-14",
                isCameraOn
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            <Button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              size="lg"
              className={cn(
                "rounded-full w-14 h-14",
                isScreenSharing
                  ? "bg-purple-500 hover:bg-purple-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              )}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </Button>

            <Button
              onClick={endCall}
              size="lg"
              className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white ml-4"
            >
              <Phone className="w-5 h-5 rotate-[135deg]" />
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="rounded-full w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white ml-2"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}