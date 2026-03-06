import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Video, Users, Shield, Sparkles, ArrowRight, Lock, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";
import { meetingService } from "@/services/meetingService";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [meetingCode, setMeetingCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartMeeting = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to start a meeting",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get or create guest user
      let userId: string | null = null;
      const { user } = await authService.getCurrentUser();
      
      if (user) {
        userId = user.id;
      } else {
        // Create guest user
        const { guestUserId, error } = await authService.createGuestUser(displayName);
        if (error) {
          throw error;
        }
        userId = guestUserId;
        if (userId) {
          authService.setGuestUser(userId, displayName);
        }
      }

      // Create new meeting
      const { data: meeting, error } = await meetingService.createMeeting(userId, "Chaesa Live Meeting");
      
      if (error) throw error;
      
      if (meeting) {
        toast({
          title: "Meeting Created!",
          description: `Your meeting code is ${meeting.meeting_code}`
        });
        router.push(`/meeting/${meeting.meeting_code}`);
      }
    } catch (error: any) {
      console.error("Error starting meeting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start meeting",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!meetingCode.trim()) {
      toast({
        title: "Meeting Code Required",
        description: "Please enter a meeting code",
        variant: "destructive"
      });
      return;
    }

    if (!displayName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join the meeting",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if meeting exists
      const { data: meeting, error } = await meetingService.getMeetingByCode(meetingCode.toUpperCase());
      
      if (error || !meeting) {
        throw new Error("Meeting not found or has ended");
      }

      // Get or create guest user
      let userId: string | null = null;
      const { user } = await authService.getCurrentUser();
      
      if (user) {
        userId = user.id;
      } else {
        // Create guest user
        const { guestUserId, error: guestError } = await authService.createGuestUser(displayName);
        if (guestError) {
          throw guestError;
        }
        userId = guestUserId;
        if (userId) {
          authService.setGuestUser(userId, displayName);
        }
      }

      router.push(`/meeting/${meetingCode.toUpperCase()}`);
    } catch (error: any) {
      console.error("Error joining meeting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to join meeting",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Chaesa Live - Video Conferencing Made Simple"
        description="Connect with anyone, anywhere with Chaesa Live. Free video conferencing with unlimited participants, screen sharing, and more."
      />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Chaesa Live
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Video Conferencing Made Simple
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Connect with Anyone,{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Anywhere
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    High-quality video meetings with unlimited participants. No downloads, no hassle.
                  </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium">Unlimited Participants</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium">Secure & Private</span>
                  </div>
                </div>
              </div>

              {/* Right Content - Meeting Card */}
              <Card className="p-8 bg-white shadow-2xl border-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
                    <p className="text-gray-600">Enter your name to create or join a meeting</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-12"
                      />
                    </div>

                    <Button
                      onClick={handleStartMeeting}
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
                    >
                      <Video className="w-5 h-5 mr-2" />
                      Start New Meeting
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or join with code</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="Enter meeting code"
                        value={meetingCode}
                        onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                        className="h-12"
                      />
                      <Button
                        onClick={handleJoinMeeting}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-12 border-2"
                      >
                        Join Meeting
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Course Factory Announcement Banner */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-orange-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  🤖 AI Course Factory + Micro-Learning - NEW!
                </h3>
                <p className="text-gray-300 mb-4">
                  Transform your meetings into complete course packages automatically! 
                  Generate slides, eBooks, quizzes, and even NotebookLM-style podcasts with one click.
                  <strong className="text-yellow-300"> Plus: Auto-chunk into 5-7 minute bite-sized modules!</strong>
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                    📊 Auto-Slides
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                    📚 eBook Generator
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                    🎙️ AI Podcast
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                    ✅ Quiz Maker
                  </span>
                  <span className="px-3 py-1 bg-yellow-400/20 rounded-full text-sm text-yellow-300 font-semibold">
                    ⚡ 5-Min Modules
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/ai-studio">
                  <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold">
                    AI Studio →
                  </Button>
                </Link>
                <Link href="/micro-learning">
                  <Button size="lg" variant="outline" className="border-yellow-400 text-yellow-300 hover:bg-yellow-400/20">
                    Micro-Learning →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 border-t">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for Better Meetings
              </h2>
              <p className="text-xl text-gray-600">
                Professional video conferencing tools at your fingertips
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Unlimited Participants</h3>
                <p className="text-gray-600 leading-relaxed">
                  Host meetings with as many people as you need. No artificial limits.
                </p>
              </Card>

              <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Video className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Screen Sharing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Share your screen with participants for better collaboration and presentations.
                </p>
              </Card>

              <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your meetings are encrypted and secure. We respect your privacy.
                </p>
              </Card>

              <div className="p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">End-to-End Encryption</h3>
                <p className="text-gray-300">Your meetings are secured with bank-grade encryption. Privacy guaranteed.</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl backdrop-blur-sm border border-purple-400/30 hover:border-purple-400/60 transition group relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">NEW</span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Course Factory</h3>
                <p className="text-gray-300">Transform meetings into courses automatically! Generate slides, eBooks, quizzes, and AI podcasts.</p>
                <Link href="/ai-studio" className="inline-block mt-3">
                  <Button size="sm" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-400/20">
                    Learn More →
                  </Button>
                </Link>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-xl backdrop-blur-sm border border-blue-400/30 hover:border-blue-400/60 transition group relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">NEW</span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Micro-Learning Generator</h3>
                <p className="text-gray-300">Auto-chunk meetings into 5-7 minute bite-sized modules. Perfect for modern attention spans!</p>
                <Link href="/micro-learning" className="inline-block mt-3">
                  <Button size="sm" variant="outline" className="border-blue-400 text-blue-300 hover:bg-blue-400/20">
                    Try Now →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">Chaesa Live</span>
              </div>
              <p className="text-gray-600 text-sm">© 2026 Chaesa Live. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}