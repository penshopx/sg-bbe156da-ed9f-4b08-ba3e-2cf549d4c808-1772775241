import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, Users, Lock, Share2, Award, MessageSquare, 
  Mic, MonitorPlay, Shield, Sparkles, ArrowRight, 
  Zap, TrendingUp, DollarSign, Clock, CheckCircle,
  Star, PlayCircle, Rocket, Brain, Target, Gift
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [stats, setStats] = useState({
    creators: 1234,
    courses: 5678,
    learners: 12340
  });

  // Simulate real-time stats counter
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        creators: prev.creators + Math.floor(Math.random() * 3),
        courses: prev.courses + Math.floor(Math.random() * 5),
        learners: prev.learners + Math.floor(Math.random() * 10)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      router.push(`/meeting/${meetingCode}`);
    }
  };

  const handleStartMeeting = () => {
    const newMeetingId = Math.random().toString(36).substring(2, 15);
    router.push(`/meeting/${newMeetingId}`);
  };

  return (
    <>
      <SEO
        title="Chaesa Live - Transform Meetings into Revenue-Generating Micro-Courses"
        description="The only platform that combines video conferencing, AI course generation, and live commerce. Save 71% vs Zoom while earning more from your content."
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Limited Time Offer Banner */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4 text-center sticky top-0 z-50">
          <div className="flex items-center justify-center gap-2 text-sm md:text-base font-semibold">
            <Gift className="w-5 h-5 animate-bounce" />
            <span>🎉 LIMITED TIME: Lifetime Deal Rp 499.000 (Save 85%!) - First 100 Users Only</span>
            <Link href="/pricing">
              <Button size="sm" variant="secondary" className="ml-4">
                Claim Now →
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            {/* Trust Badge */}
            <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/50 px-4 py-2">
              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
              Trusted by 1,000+ Creators & Educators
            </Badge>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your Meetings<br />
              Into <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Revenue-Generating</span><br />
              Micro-Courses in 15 Minutes
            </h1>

            {/* Sub-headline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Stop wasting hours editing recordings. Our AI automatically chunks your 2-hour meeting into 20 ready-to-sell modules with slides, quizzes, and podcasts. <span className="text-purple-400 font-semibold">Plus live commerce for 3-5x higher conversions.</span>
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg" 
                onClick={handleStartMeeting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Free Meeting Now
              </Button>
              <Link href="#demo">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 px-8 py-6 text-lg rounded-xl"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch 2-Min Demo
                </Button>
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap gap-8 justify-center text-center">
              <div>
                <div className="text-3xl font-bold text-white">{stats.creators.toLocaleString()}+</div>
                <div className="text-gray-400">Active Creators</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{stats.courses.toLocaleString()}+</div>
                <div className="text-gray-400">Courses Generated</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{stats.learners.toLocaleString()}+</div>
                <div className="text-gray-400">Happy Learners</div>
              </div>
            </div>
          </div>

          {/* Join Meeting Form */}
          <Card className="max-w-2xl mx-auto p-8 bg-white/5 backdrop-blur-sm border-white/10">
            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <h3 className="text-2xl font-semibold text-white text-center mb-6">
                Join an Existing Meeting
              </h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter meeting code (e.g., abc123xyz)"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                />
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg rounded-xl"
                >
                  Join Meeting
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Problem-Agitate-Solution Section */}
        <div className="bg-black/30 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-red-500/20 text-red-300 border-red-500/50">
                The Problem with Current Platforms
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Zoom & Google Meet Are <span className="text-red-400">Killing Your Productivity</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: Clock,
                  problem: "Wasting 10+ Hours",
                  description: "Download → Transcribe → Edit → Create slides → Make quiz = 10-20 hours per course",
                  color: "red"
                },
                {
                  icon: DollarSign,
                  problem: "Losing Money",
                  description: "Zoom costs Rp 240K/month. Plus you can't sell courses directly from meetings.",
                  color: "orange"
                },
                {
                  icon: TrendingUp,
                  problem: "Missing Conversions",
                  description: "No way to push CTA during webinars. Viewers forget to buy after meeting ends.",
                  color: "yellow"
                }
              ].map((item, idx) => (
                <Card key={idx} className={`p-6 bg-${item.color}-900/20 border-${item.color}-500/30 backdrop-blur-sm`}>
                  <item.icon className={`w-12 h-12 text-${item.color}-400 mb-4`} />
                  <h3 className="text-xl font-bold text-white mb-3">{item.problem}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-4">
                Chaesa Live Solves All of This 👇
              </h3>
            </div>
          </div>
        </div>

        {/* 3 Killer Features */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/50">
              Revolutionary Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              3 Features That <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">No Competitor</span> Has
            </h2>
          </div>

          <div className="space-y-16">
            {/* Feature 1: AI Course Factory */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/50">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Course Factory
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  One-Click Course Generation (Like NotebookLM for Video)
                </h3>
                <p className="text-xl text-gray-300 mb-6">
                  Record 1 meeting → AI chunks into 20 micro-modules (5-7 min each) → Auto-generate slides, quizzes, podcasts, ebook → Publish & sell in 15 minutes.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "📊 Auto-generate PowerPoint slides",
                    "📖 Create PDF ebooks & study guides",
                    "✅ Generate quizzes with explanations",
                    "🎙️ AI podcast (2-host conversation style)",
                    "📱 Optimize for TikTok/Reels/YouTube Shorts"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                  <div className="text-sm text-purple-300 font-semibold mb-1">TIME SAVED</div>
                  <div className="text-2xl font-bold text-white">
                    90% (20 hours → 2 hours)
                  </div>
                </div>
                <Link href="/ai-studio">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Try AI Studio <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-8 flex items-center justify-center">
                  <Brain className="w-32 h-32 text-purple-400" />
                </div>
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  Save 90% Time
                </div>
              </div>
            </div>

            {/* Feature 2: Live Sales CTA */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative">
                <div className="aspect-video bg-gradient-to-br from-pink-900 to-orange-900 rounded-2xl p-8 flex items-center justify-center">
                  <Zap className="w-32 h-32 text-orange-400" />
                </div>
                <div className="absolute -top-4 -left-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  3-5x Conversions
                </div>
              </div>
              <div className="order-1 md:order-2">
                <Badge className="mb-4 bg-orange-500/20 text-orange-300 border-orange-500/50">
                  <Zap className="w-4 h-4 mr-2" />
                  Live Sales CTA
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  TikTok Shop-Style Live Commerce (Push CTA to All Viewers)
                </h3>
                <p className="text-xl text-gray-300 mb-6">
                  During webinar/demo, push "Buy Now" button directly to viewers' screens with countdown timer. Impulse buying = 3-5x higher conversion than "link in chat".
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "💰 Push product offers during live demo",
                    "⏱️ FOMO countdown timers",
                    "📊 Real-time click tracking",
                    "🎯 Customizable CTA colors & copy",
                    "💳 Direct Midtrans checkout"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
                  <div className="text-sm text-orange-300 font-semibold mb-1">CONVERSION BOOST</div>
                  <div className="text-2xl font-bold text-white">
                    3-5x vs Traditional Webinars
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-orange-600 to-pink-600">
                  See Live Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Feature 3: Studio Mode */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/50">
                  <MonitorPlay className="w-4 h-4 mr-2" />
                  Studio Mode
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  OBS-Friendly for YouTubers & Streamers (Zero Audio Issues)
                </h3>
                <p className="text-xl text-gray-300 mb-6">
                  Zoom/Meet kills your OBS audio? We fixed it. Toggle "Studio Mode" → Clean feed (no UI) + "Original Sound" (no processing) = Perfect for live streaming.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    "🎥 Clean feed (hide all UI for OBS capture)",
                    "🎵 Original Sound mode (no audio processing)",
                    "🎙️ Zero conflicts with OBS/Streamlabs",
                    "🎬 Perfect for YouTube Live/Twitch",
                    "⌨️ Keyboard shortcut (Ctrl+Shift+U)"
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="text-sm text-green-300 font-semibold mb-1">AUDIO QUALITY</div>
                  <div className="text-2xl font-bold text-white">
                    Studio-Grade (No Zoom Robotic Sound)
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-teal-600">
                  Try Studio Mode <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-green-900 to-teal-900 rounded-2xl p-8 flex items-center justify-center">
                  <MonitorPlay className="w-32 h-32 text-green-400" />
                </div>
                <div className="absolute -top-4 -right-4 bg-teal-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  Zero Audio Issues
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="bg-black/30 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/50">
                Transparent Pricing
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Save <span className="text-green-400">71% vs Zoom</span>, Get <span className="text-purple-400">10x More Features</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="p-4 text-white font-semibold">Feature</th>
                    <th className="p-4 text-white font-semibold text-center">Zoom Pro</th>
                    <th className="p-4 text-white font-semibold text-center">Google Meet</th>
                    <th className="p-4 text-white font-semibold text-center bg-purple-900/30">
                      <Badge className="mb-2">Recommended</Badge>
                      <div>Chaesa Live Pro</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-white/10">
                    <td className="p-4 font-semibold">Price/Month</td>
                    <td className="p-4 text-center">Rp 240.000</td>
                    <td className="p-4 text-center">Rp 130.000</td>
                    <td className="p-4 text-center bg-purple-900/20 font-bold text-green-400">Rp 69.000</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Savings vs Competitor</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center">-</td>
                    <td className="p-4 text-center bg-purple-900/20 font-bold text-green-400">Save 71% (vs Zoom)</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Meeting Duration</td>
                    <td className="p-4 text-center">Unlimited</td>
                    <td className="p-4 text-center">Unlimited</td>
                    <td className="p-4 text-center bg-purple-900/20">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">AI Course Generator</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Live Sales CTA</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Studio Mode (OBS-Friendly)</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Original Sound (Audio Fix)</td>
                    <td className="p-4 text-center text-yellow-400">⚠️ Complex</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅ One Toggle</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">NotebookLM-Style Podcast</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Micro-Learning Chunking</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center bg-purple-900/20 text-green-400">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center mt-12">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-6 text-lg">
                  See Full Pricing <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Use Cases by Persona */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/50">
              Perfect For
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Who Benefits Most from Chaesa Live?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                persona: "E-Course Creators & Coaches",
                pain: "Spend 10-20 hours creating courses from Zoom recordings",
                solution: "Record 1 webinar → AI generates 20 modules → Sell in 15 minutes",
                roi: "Save 90% time, Earn 5x more courses",
                cta: "Create Your First Course",
                color: "blue"
              },
              {
                icon: DollarSign,
                persona: "Live Sellers & E-Commerce",
                pain: "Low webinar conversions, hard to close sales",
                solution: "Push CTA during live demo → Impulse buying → 3-5x conversions",
                roi: "3-5x higher conversion rate",
                cta: "Boost Your Sales",
                color: "orange"
              },
              {
                icon: Video,
                persona: "YouTubers & Content Creators",
                pain: "OBS audio issues, can't use Zoom for streaming",
                solution: "Studio Mode + Original Sound → Zero audio conflicts",
                roi: "Professional quality streaming",
                cta: "Fix Your Audio Issues",
                color: "green"
              },
              {
                icon: Users,
                persona: "Corporate Trainers & HR",
                pain: "Expensive training platforms, hard to track progress",
                solution: "Record training once → Auto-chunk → Gamified learning",
                roi: "Save 80% vs LinkedIn Learning",
                cta: "Start Corporate Training",
                color: "purple"
              }
            ].map((useCase, idx) => (
              <Card key={idx} className={`p-8 bg-${useCase.color}-900/20 border-${useCase.color}-500/30 backdrop-blur-sm hover:bg-${useCase.color}-900/30 transition-all`}>
                <useCase.icon className={`w-12 h-12 text-${useCase.color}-400 mb-4`} />
                <h3 className="text-2xl font-bold text-white mb-3">{useCase.persona}</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm text-red-400 font-semibold mb-1">❌ Pain Point:</div>
                    <div className="text-gray-300">{useCase.pain}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-400 font-semibold mb-1">✅ Chaesa Solution:</div>
                    <div className="text-gray-300">{useCase.solution}</div>
                  </div>
                  <div className={`bg-${useCase.color}-500/10 border border-${useCase.color}-500/30 rounded-lg p-3`}>
                    <div className="text-sm text-gray-400 mb-1">ROI</div>
                    <div className="text-lg font-bold text-white">{useCase.roi}</div>
                  </div>
                </div>
                <Button className={`w-full bg-gradient-to-r from-${useCase.color}-600 to-${useCase.color}-700`}>
                  {useCase.cta} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-black/30 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/50">
                Success Stories
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Early Adopters Are Saying
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "E-Course Creator",
                  avatar: "SC",
                  quote: "I used to spend 2 weeks creating a course. Now I do it in 1 day with Chaesa Live's AI. Already made Rp 50 juta from 5 courses!",
                  metric: "Rp 50 juta revenue"
                },
                {
                  name: "Budi Santoso",
                  role: "Live Seller",
                  avatar: "BS",
                  quote: "The Live CTA feature is a game changer. My webinar conversion went from 2% to 8%. That's 4x more sales!",
                  metric: "4x conversion boost"
                },
                {
                  name: "Amanda Wijaya",
                  role: "YouTuber (150K subs)",
                  avatar: "AW",
                  quote: "Finally, no more OBS audio issues! Studio Mode makes my live streams so much cleaner. Highly recommend for content creators.",
                  metric: "Zero audio issues"
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                    {testimonial.metric}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="p-12 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-sm text-center">
            <Badge className="mb-6 bg-green-500/20 text-green-300 border-green-500/50">
              <Gift className="w-4 h-4 mr-2" />
              Limited Time Offer
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to 10x Your Content Revenue?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 1,000+ creators who are already earning more with less effort. First 100 users get <span className="font-bold text-yellow-400">Lifetime Deal Rp 499K</span> (85% off).
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-12 py-6 text-lg">
                  <Rocket className="w-5 h-5 mr-2" />
                  Claim Lifetime Deal Now
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleStartMeeting}
                className="border-2 border-purple-500 text-purple-300 hover:bg-purple-500/20 px-12 py-6 text-lg"
              >
                Start Free Meeting
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              No credit card required • Cancel anytime • 7-day money-back guarantee
            </p>
          </Card>
        </div>

        {/* Trust Signals */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, label: "Enterprise-Grade Security" },
              { icon: Award, label: "99.9% Uptime SLA" },
              { icon: Users, label: "24/7 Support" },
              { icon: Lock, label: "GDPR Compliant" }
            ].map((trust, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3">
                <trust.icon className="w-10 h-10 text-purple-400" />
                <div className="text-gray-300 font-semibold">{trust.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/40 border-t border-white/10 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">
                © 2026 Chaesa Live. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                <Link href="/ai-studio" className="hover:text-white transition-colors">AI Studio</Link>
                <Link href="/micro-learning" className="hover:text-white transition-colors">Micro-Learning</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}