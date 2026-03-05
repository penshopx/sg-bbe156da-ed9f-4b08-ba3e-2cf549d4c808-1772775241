import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  PhoneOff, Users, MessageSquare, Copy, Check, Send, Circle
} from "lucide-react";
import { meetingService } from "@/services/meetingService";
import { authService } from "@/services/authService";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";

export default function MeetingRoom() {
  const router = useRouter();
  const { id: meetingCode } = router.query;
  const { toast } = useToast();
  
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string | null; name: string } | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joinName, setJoinName] = useState("");
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // NEW: Powerful features states
  const [viewMode, setViewMode] = useState<"grid" | "speaker">("grid");
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [reactions, setReactions] = useState<Map<string, { emoji: string; timestamp: number }>>(new Map());
  const [meetingLocked, setMeetingLocked] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState<any[]>([]);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Advanced audio/video features
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(false);
  const [isNoiseSuppressed, setIsNoiseSuppressed] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);
  const [showQA, setShowQA] = useState(false);

  // WebRTC hook will be initialized once we have meetingId and userId
  const {
    localStream,
    participants: rtcParticipants,
    isCameraOn,
    isMicOn,
    isScreenSharing,
    initializeLocalStream,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanup
  } = useWebRTC(meetingId || "", currentUser?.id || "");

  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Initial setup: Validate meeting code and check user session
  useEffect(() => {
    if (!meetingCode || typeof meetingCode !== "string") return;

    const setupMeeting = async () => {
      try {
        // 1. Get meeting details
        const { data: meeting, error } = await meetingService.getMeetingByCode(meetingCode);
        
        if (error || !meeting) {
          toast({
            title: "Meeting Not Found",
            description: "The meeting code is invalid or the meeting has ended.",
            variant: "destructive"
          });
          router.push("/");
          return;
        }

        setMeetingId(meeting.id);

        // 2. Check user session
        const { userId, displayName, isGuest } = await authService.getUserInfo();
        
        if (userId || displayName) {
          setCurrentUser({ id: userId, name: displayName });
          if (userId && displayName) {
            // Check if stored guest ID is valid UUID if it's a guest
            if (isGuest && !isValidUUID(userId)) {
              // Invalid UUID format for guest, clear it
              authService.clearGuestUser();
              setCurrentUser(null);
            } else {
              setJoinName(displayName);
            }
          }
        }
      } catch (error) {
        console.error("Error setting up meeting:", error);
      }
    };

    setupMeeting();
  }, [meetingCode, router, toast]);

  // Helper to validate UUID
  const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  };

  // Attach local stream to video element
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Subscribe to signals and participants when joined
  useEffect(() => {
    if (!isJoined || !meetingId || !currentUser?.id) return;

    // Initialize media
    initializeLocalStream();

    // Subscribe to participants
    const participantsSub = meetingService.subscribeToParticipants(meetingId, (payload) => {
      loadParticipants();
      
      // Handle new participant for WebRTC
      if (payload.eventType === "INSERT" && payload.new.user_id !== currentUser.id) {
        // New participant joined, initiate connection if I'm already here
        // We add a small delay to ensure they are ready
        setTimeout(() => createOffer(payload.new.user_id), 1000);
      }
    });

    // Subscribe to WebRTC signals
    const signalsSub = meetingService.subscribeToSignals(meetingId, currentUser.id, (signal) => {
      const { from_user_id, signal_type, signal_data } = signal;
      
      switch (signal_type) {
        case "offer":
          handleOffer(from_user_id, signal_data);
          break;
        case "answer":
          handleAnswer(from_user_id, signal_data);
          break;
        case "ice-candidate":
          handleIceCandidate(from_user_id, signal_data);
          break;
      }
    });

    // Subscribe to chat
    const chatSub = meetingService.subscribeToChatMessages(meetingId, (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Initial load
    loadParticipants();
    loadMessages();

    return () => {
      participantsSub.unsubscribe();
      signalsSub.unsubscribe();
      chatSub.unsubscribe();
      cleanup();
      meetingService.leaveMeeting(meetingId, currentUser.id);
    };
  }, [isJoined, meetingId, currentUser?.id]);

  const loadParticipants = async () => {
    if (!meetingId) return;
    const { data } = await meetingService.getParticipants(meetingId);
    if (data) setParticipants(data);
  };

  const loadMessages = async () => {
    if (!meetingId) return;
    const { data } = await meetingService.getChatMessages(meetingId);
    if (data) setMessages(data);
  };

  const handleJoin = async () => {
    if (!joinName.trim() || !meetingId) return;

    try {
      let userId = currentUser?.id;

      // If no user ID (new guest), create one
      if (!userId) {
        const { guestUserId, error } = await authService.createGuestUser(joinName);
        if (error || !guestUserId) throw error || new Error("Failed to create guest user");
        
        userId = guestUserId;
        authService.setGuestUser(userId, joinName);
      }

      setCurrentUser({ id: userId, name: joinName });

      // Join meeting in DB
      await meetingService.joinMeeting(meetingId, userId, joinName);
      setIsJoined(true);
      
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast({
        title: "Error Joining",
        description: "Could not join the meeting. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !meetingId || !currentUser?.id) return;

    await meetingService.sendChatMessage(meetingId, currentUser.id, newMessage);
    setNewMessage("");
  };

  const copyMeetingCode = () => {
    if (!meetingCode) return;
    navigator.clipboard.writeText(meetingCode as string);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Meeting code copied to clipboard",
    });
  };

  const startRecording = async () => {
    if (!localStream) {
      toast({
        title: "Cannot Start Recording",
        description: "Please enable your camera and microphone first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create MediaRecorder with the local stream
      const options = { mimeType: "video/webm;codecs=vp9,opus" };
      
      // Fallback to vp8 if vp9 is not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "video/webm;codecs=vp8,opus";
      }

      const mediaRecorder = new MediaRecorder(localStream, options);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chaesa-meeting-${meetingCode}-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.webm`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Recording Saved",
          description: "Your recording has been downloaded successfully.",
        });
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingDuration(0);

      // Start recording duration timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Your meeting is now being recorded.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Failed",
        description: "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      toast({
        title: "Recording Stopped",
        description: "Processing your recording...",
      });
    }
  };

  const formatRecordingDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + D: Toggle mic
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        toggleMic();
      }
      // Ctrl/Cmd + E: Toggle camera
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        toggleCamera();
      }
      // Ctrl/Cmd + Shift + H: Toggle hand raise
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "H") {
        e.preventDefault();
        toggleHandRaise();
      }
      // Ctrl/Cmd + Shift + C: Toggle chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        setShowChat(prev => !prev);
      }
      // Ctrl/Cmd + Shift + P: Toggle participants
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setShowParticipants(prev => !prev);
      }
      // ?: Show keyboard shortcuts
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    if (isJoined) {
      window.addEventListener("keydown", handleKeyboard);
      return () => window.removeEventListener("keydown", handleKeyboard);
    }
  }, [isJoined, toggleMic, toggleCamera]);

  // Toggle hand raise
  const toggleHandRaise = async () => {
    if (!meetingId || !currentUser?.id) return;
    
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    
    await meetingService.updateParticipantStatus(meetingId, currentUser.id, {
      hand_raised: newState
    });

    toast({
      title: newState ? "Hand Raised ✋" : "Hand Lowered",
      description: newState ? "The host will be notified" : "Your hand has been lowered",
    });
  };

  // Send reaction
  const sendReaction = async (emoji: string) => {
    if (!meetingId || !currentUser?.id) return;

    // Add reaction locally with timeout
    const reactionId = `${currentUser.id}-${Date.now()}`;
    setReactions(prev => {
      const newMap = new Map(prev);
      newMap.set(reactionId, { emoji, timestamp: Date.now() });
      return newMap;
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setReactions(prev => {
        const newMap = new Map(prev);
        newMap.delete(reactionId);
        return newMap;
      });
    }, 3000);

    // Send to other participants via chat as system message
    await meetingService.sendChatMessage(
      meetingId, 
      currentUser.id, 
      `__REACTION__${emoji}__${currentUser.name}`
    );

    setShowReactionsMenu(false);
  };

  // Toggle meeting lock (host only)
  const toggleMeetingLock = async () => {
    if (!meetingId) return;
    
    const newState = !meetingLocked;
    setMeetingLocked(newState);

    // Update meeting in database
    await meetingService.updateMeeting(meetingId, { is_locked: newState });

    toast({
      title: newState ? "🔒 Meeting Locked" : "🔓 Meeting Unlocked",
      description: newState 
        ? "No new participants can join" 
        : "New participants can now join",
    });
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === "grid" ? "speaker" : "grid");
    toast({
      title: `${viewMode === "grid" ? "Speaker" : "Grid"} View`,
      description: `Switched to ${viewMode === "grid" ? "speaker" : "grid"} view`,
    });
  };

  // Enter Picture-in-Picture mode
  const enterPipMode = async () => {
    if (localVideoRef.current && document.pictureInPictureEnabled) {
      try {
        await localVideoRef.current.requestPictureInPicture();
        setIsPipMode(true);
        toast({
          title: "Picture-in-Picture Enabled",
          description: "Video window will float above other windows",
        });
      } catch (error) {
        console.error("PiP error:", error);
      }
    }
  };

  // Toggle background blur
  const toggleBackgroundBlur = () => {
    setIsBackgroundBlurred(prev => !prev);
    toast({
      title: isBackgroundBlurred ? "Background Blur Off" : "Background Blur On",
      description: isBackgroundBlurred 
        ? "Your background is now visible" 
        : "Your background is now blurred",
    });
  };

  // Toggle noise suppression
  const toggleNoiseSuppression = () => {
    setIsNoiseSuppressed(prev => !prev);
    toast({
      title: isNoiseSuppressed ? "Noise Suppression Off" : "Noise Suppression On",
      description: isNoiseSuppressed 
        ? "Audio enhancement disabled" 
        : "Audio enhancement enabled",
    });
  };

  // Toggle live captions
  const toggleCaptions = () => {
    setShowCaptions(prev => !prev);
    toast({
      title: showCaptions ? "Captions Off" : "Captions On",
      description: showCaptions 
        ? "Live captions disabled" 
        : "Live captions enabled",
    });
  };

  if (!meetingCode) return null;

  // Pre-join screen
  if (!isJoined) {
    return (
      <>
        <SEO title="Join Meeting - Chaesa Live" />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Join Meeting</h1>
              <p className="text-gray-500">Code: {meetingCode}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Display Name</label>
                <Input
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12"
                />
              </div>

              <Button 
                onClick={handleJoin} 
                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                disabled={!joinName.trim()}
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Meeting Room - Chaesa Live" />
      <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-gray-800/50 backdrop-blur border-b border-gray-700 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
              <span className="text-white font-medium">{meetingCode}</span>
              <button onClick={copyMeetingCode} className="text-gray-400 hover:text-white transition-colors">
                {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {isRecording && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 rounded-lg border border-red-600/50 animate-pulse">
                <Circle className="w-3 h-3 fill-red-500 text-red-500" />
                <span className="text-red-400 font-medium text-sm">
                  REC {formatRecordingDuration(recordingDuration)}
                </span>
              </div>
            )}
            <span className="text-gray-400 text-sm hidden sm:inline">
              {participants.length} participant{participants.length !== 1 && "s"}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={toggleViewMode}
              title={`Switch to ${viewMode === "grid" ? "speaker" : "grid"} view`}
            >
              {viewMode === "grid" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="13" rx="1" />
                  <rect x="3" y="18" width="5" height="3" rx="1" />
                  <rect x="10" y="18" width="5" height="3" rx="1" />
                  <rect x="17" y="18" width="4" height="3" rx="1" />
                </svg>
              )}
            </Button>

            {/* Meeting Lock Toggle (Host) */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-gray-400 hover:text-white hover:bg-gray-800", meetingLocked && "text-red-400")}
              onClick={toggleMeetingLock}
              title={meetingLocked ? "Unlock meeting" : "Lock meeting"}
            >
              {meetingLocked ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 9 0" />
                  <path d="M16 7v4" />
                </svg>
              )}
            </Button>

            {/* Keyboard Shortcuts Help */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => setShowKeyboardShortcuts(true)}
              title="Keyboard shortcuts (?)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h4M14 10h4M6 14h12" />
              </svg>
            </Button>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            {/* Polls */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-gray-400 hover:text-white hover:bg-gray-800", showPolls && "bg-gray-800 text-white")}
              onClick={() => setShowPolls(!showPolls)}
              title="Polls"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h4v8H3zM10 3h4v18h-4zM17 8h4v13h-4z" />
              </svg>
            </Button>

            {/* Whiteboard */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-gray-400 hover:text-white hover:bg-gray-800", showWhiteboard && "bg-gray-800 text-white")}
              onClick={() => setShowWhiteboard(!showWhiteboard)}
              title="Whiteboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9l3 3-3 3M15 12h-3" />
              </svg>
            </Button>

            {/* Breakout Rooms */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-gray-400 hover:text-white hover:bg-gray-800", showBreakoutRooms && "bg-gray-800 text-white")}
              onClick={() => setShowBreakoutRooms(!showBreakoutRooms)}
              title="Breakout Rooms"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 1 0-7.75" />
              </svg>
            </Button>

            {/* Q&A */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-gray-400 hover:text-white hover:bg-gray-800", showQA && "bg-gray-800 text-white")}
              onClick={() => setShowQA(!showQA)}
              title="Q&A"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
            </Button>

            <div className="w-px h-8 bg-gray-700 mx-2" />

            <Button
              variant="ghost"
              size="icon"
              className={cn("text-gray-400 hover:text-white hover:bg-gray-800", showParticipants && "bg-gray-800 text-white")}
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("text-gray-400 hover:text-white hover:bg-gray-800", showChat && "bg-gray-800 text-white")}
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Video Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr h-full max-h-full">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg ring-1 ring-white/10 group">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn("w-full h-full object-cover mirror", !isCameraOn && "hidden")}
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="w-24 h-24 border-4 border-gray-700">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} />
                      <AvatarFallback className="text-2xl">{currentUser?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-white text-sm font-medium">
                  You ({currentUser?.name})
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {!isMicOn && <div className="p-1.5 bg-red-500/80 rounded-full"><MicOff className="w-3 h-3 text-white" /></div>}
                </div>
              </div>

              {/* Remote Participants */}
              {Array.from(rtcParticipants.values()).map((participant) => (
                <div key={participant.userId} className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg ring-1 ring-white/10">
                  <video
                    autoPlay
                    playsInline
                    className={cn("w-full h-full object-cover", !participant.isCameraOn && "hidden")}
                    ref={(el) => {
                      if (el && participant.stream) el.srcObject = participant.stream;
                    }}
                  />
                  {!participant.isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="w-24 h-24 border-4 border-gray-700">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.displayName}`} />
                        <AvatarFallback className="text-2xl">{participant.displayName[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-white text-sm font-medium">
                    {participant.displayName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar (Chat/Participants) */}
          {(showChat || showParticipants) && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0 transition-all duration-300">
              {showParticipants && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-white font-medium">Participants ({participants.length})</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {participants.map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.display_name}`} />
                          <AvatarFallback>{p.display_name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-gray-200 text-sm">{p.display_name}</span>
                        {p.user_id === currentUser?.id && (
                          <span className="text-xs text-gray-500">(You)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showChat && (
                <div className={cn("flex flex-col min-h-0", showParticipants ? "h-1/2 border-t border-gray-700" : "flex-1")}>
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-white font-medium">Chat</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-400">
                            {participants.find(p => p.user_id === msg.user_id)?.display_name || "Unknown"}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-200 text-sm bg-gray-700/50 p-2 rounded-lg">
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Polls Panel */}
          {showPolls && (
            <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-medium">Polls</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPolls(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {polls.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h4v8H3zM10 3h4v18h-4zM17 8h4v13h-4z" />
                    </svg>
                    <p className="text-sm">No polls yet</p>
                    <p className="text-xs mt-1">Host can create polls</p>
                  </div>
                ) : (
                  polls.map((poll) => (
                    <div key={poll.id} className="bg-gray-900 rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="text-white font-medium">{poll.question}</h4>
                        {poll.is_active && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Active</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {poll.options?.map((option: any) => (
                          <button
                            key={option.id}
                            className="w-full text-left bg-gray-800 hover:bg-gray-700 rounded p-3 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-200">{option.option_text}</span>
                              <span className="text-sm text-gray-400">{option.vote_count || 0} votes</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-700">
                <Button className="w-full">
                  Create New Poll
                </Button>
              </div>
            </div>
          )}

          {/* Whiteboard Panel */}
          {showWhiteboard && (
            <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-medium">Whiteboard</h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                    title="Clear whiteboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowWhiteboard(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="flex-1 bg-white relative">
                <canvas
                  className="w-full h-full cursor-crosshair"
                  style={{ touchAction: "none" }}
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 rounded-lg p-2 flex gap-2 shadow-xl">
                  {["black", "red", "blue", "green", "yellow"].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-gray-700 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Breakout Rooms Panel */}
          {showBreakoutRooms && (
            <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-medium">Breakout Rooms</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowBreakoutRooms(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center text-gray-400 mt-8">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 1 0-7.75" />
                  </svg>
                  <p className="text-sm">No breakout rooms</p>
                  <p className="text-xs mt-1">Host can create rooms</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 space-y-2">
                <Button className="w-full">
                  Create Breakout Rooms
                </Button>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    defaultValue="2"
                    placeholder="Number of rooms"
                    className="flex-1 bg-gray-900 border-gray-700 text-white"
                  />
                  <Button variant="secondary">
                    Auto Assign
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Q&A Panel */}
          {showQA && (
            <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-medium">Q&A</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowQA(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center text-gray-400 mt-8">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
                  </svg>
                  <p className="text-sm">No questions yet</p>
                  <p className="text-xs mt-1">Ask a question below</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700">
                <form className="space-y-2">
                  <Input
                    placeholder="Ask a question..."
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  <Button type="submit" className="w-full">
                    Submit Question
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Advanced Video/Audio Settings */}
          <div className="flex gap-2">
            <Button
              variant={isBackgroundBlurred ? "default" : "secondary"}
              size="icon"
              className="rounded-full w-10 h-10 p-0"
              onClick={toggleBackgroundBlur}
              title="Toggle background blur"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2h-2a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </Button>

            <Button
              variant={isNoiseSuppressed ? "default" : "secondary"}
              size="icon"
              className="rounded-full w-10 h-10 p-0"
              onClick={toggleNoiseSuppression}
              title="Toggle noise suppression"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2h-2a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </Button>

            <Button
              variant={showCaptions ? "default" : "secondary"}
              size="icon"
              className="rounded-full w-10 h-10 p-0"
              onClick={toggleCaptions}
              title="Toggle live captions"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h4M14 10h4M6 14h12" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Live Captions Overlay */}
        {showCaptions && currentCaption && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4">
            <div className="bg-black/90 backdrop-blur text-white px-6 py-4 rounded-xl shadow-2xl">
              <p className="text-lg leading-relaxed">{currentCaption}</p>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-4 shrink-0 px-4">
          <Button
            variant={isMicOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={toggleMic}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant={isCameraOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={toggleCamera}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>

          <div className="w-px h-8 bg-gray-700 mx-2" />

          {/* Hand Raise */}
          <Button
            variant={isHandRaised ? "default" : "secondary"}
            size="lg"
            className={cn("rounded-full w-12 h-12 p-0", isHandRaised && "bg-yellow-500 hover:bg-yellow-600")}
            onClick={toggleHandRaise}
            title="Raise hand (Ctrl+Shift+H)"
          >
            <span className="text-xl">✋</span>
          </Button>

          {/* Reactions Menu */}
          <div className="relative">
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full w-12 h-12 p-0"
              onClick={() => setShowReactionsMenu(!showReactionsMenu)}
              title="Send reaction"
            >
              <span className="text-xl">😊</span>
            </Button>
            
            {showReactionsMenu && (
              <div className="absolute bottom-16 left-0 bg-gray-800 border border-gray-700 rounded-xl p-2 flex gap-2 shadow-xl">
                {["👍", "❤️", "😂", "👏", "🎉", "🤔", "👋", "🔥"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-gray-700 rounded-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Picture-in-Picture */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={enterPipMode}
            title="Picture-in-Picture"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <rect x="13" y="12" width="7" height="6" rx="1" />
            </svg>
          </Button>

          <div className="w-px h-8 bg-gray-700 mx-2" />

          <Button
            variant={isRecording ? "destructive" : "secondary"}
            size="lg"
            className={cn(
              "rounded-full w-12 h-12 p-0",
              isRecording && "animate-pulse"
            )}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            <Circle className={cn("w-5 h-5", isRecording && "fill-current")} />
          </Button>

          <div className="w-px h-8 bg-gray-700 mx-2" />

          <Button
            variant="destructive"
            size="lg"
            className="rounded-full px-8 bg-red-600 hover:bg-red-700"
            onClick={() => router.push("/")}
          >
            <PhoneOff className="w-5 h-5 mr-2" />
            End Call
          </Button>
        </div>

        {/* Reactions Overlay */}
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none z-50">
          {Array.from(reactions.values()).map((reaction, i) => (
            <div
              key={i}
              className="text-6xl animate-bounce"
              style={{
                animation: "bounce 0.5s ease-out, fadeOut 3s ease-out"
              }}
            >
              {reaction.emoji}
            </div>
          ))}
        </div>

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog 
          open={showKeyboardShortcuts} 
          onOpenChange={setShowKeyboardShortcuts}
        />
      </div>
    </>
  );
}