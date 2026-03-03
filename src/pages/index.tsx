import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Users, Share2, Calendar, Shield, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function HomePage() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");

  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      router.push(`/meeting/${meetingCode}`);
    }
  };

  const handleNewMeeting = () => {
    const newMeetingId = Math.random().toString(36).substring(2, 12);
    router.push(`/meeting/${newMeetingId}`);
  };

  return (
    <>
      <SEO
        title="Chaesa Live - Video Meeting Platform"
        description="Connect with anyone, anywhere. Start or join video meetings instantly with Chaesa Live."
        image="/og-image.png"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Chaesa Live</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-white/80 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                About
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                Connect With
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Anyone, Anywhere
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-12">
                High-quality video meetings for teams of all sizes. Start instantly, no downloads required.
              </p>

              {/* Meeting Actions */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto mb-16">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <Input
                    type="text"
                    placeholder="Enter meeting code"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleJoinMeeting()}
                    className="flex-1 bg-white/90 border-white/30 text-gray-900 placeholder:text-gray-500 h-14 text-lg"
                  />
                  <Button
                    onClick={handleJoinMeeting}
                    disabled={!meetingCode.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white h-14 px-8 text-lg font-semibold"
                  >
                    Join Meeting
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="text-white/60 text-sm">or</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>
                <Button
                  onClick={handleNewMeeting}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-14 text-lg font-semibold"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Start New Meeting
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Unlimited Participants</h3>
                <p className="text-white/70">Host meetings with unlimited participants. Perfect for teams of any size.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Screen Sharing</h3>
                <p className="text-white/70">Share your screen with crystal clear quality for presentations and demos.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Secure & Private</h3>
                <p className="text-white/70">End-to-end encryption keeps your conversations secure and private.</p>
              </div>
            </div>

            {/* Additional Features */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Instant Access</h4>
                  <p className="text-white/70">No downloads or installations. Join meetings directly from your browser.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Schedule Meetings</h4>
                  <p className="text-white/70">Plan ahead with integrated scheduling and calendar invitations.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-white/60">
              <p>© {new Date().getFullYear()} Chaesa Live. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}