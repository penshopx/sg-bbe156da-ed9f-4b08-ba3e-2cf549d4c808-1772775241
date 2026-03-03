import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MeetingPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: isMicOn,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setIsScreenSharing(true);
        // Handle screen sharing stream
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    } else {
      setIsScreenSharing(false);
    }
  };

  const copyMeetingLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const endCall = () => {
    stopCamera();
    router.push("/");
  };

  return (
    <>
      <SEO
        title={`Meeting ${id} - Chaesa Live`}
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
                <h1 className="text-white font-semibold">Meeting {id}</h1>
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
                      Copy meeting link
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
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Users className="w-5 h-5" />
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
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">You</span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <span className="text-white text-sm font-medium">You</span>
                </div>
                {!isMicOn && (
                  <div className="absolute top-4 right-4 bg-red-500 p-2 rounded-lg">
                    <MicOff className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Placeholder for other participants */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center"
                >
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-500" />
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
                    <span className="text-gray-400 text-sm">Waiting...</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-white font-semibold">Chat</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="text-center text-gray-500 text-sm py-8">
                  No messages yet. Start the conversation!
                </div>
              </div>
              <div className="p-4 border-t border-gray-800">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500"
                />
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
              onClick={toggleScreenShare}
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