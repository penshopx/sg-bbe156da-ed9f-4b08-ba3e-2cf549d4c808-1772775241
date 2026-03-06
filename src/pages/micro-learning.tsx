import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { microLearningService } from "@/services/microLearningService";
import { meetingService } from "@/services/meetingService";
import {
  Sparkles,
  BookOpen,
  Video,
  Clock,
  Users,
  TrendingUp,
  Download,
  Share2,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  Award,
  Target,
  Zap,
  Instagram,
  Youtube,
  Linkedin,
  Music,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];
type CourseModule = Database["public"]["Tables"]["course_modules"]["Row"];

export default function MicroLearning() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("create");
  const [courses, setCourses] = useState<Course[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string>("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load user's courses
      const { data: coursesData } = await microLearningService.getUserCourses();
      if (coursesData) setCourses(coursesData);

      // Load meetings with recordings
      const { data: meetingsData } = await meetingService.getUserMeetings();
      if (meetingsData) setMeetings(meetingsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!selectedMeeting || !courseTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a meeting and enter a course title",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Create course
      const { data: course, error: courseError } = await microLearningService.createCourseFromMeeting(
        selectedMeeting,
        courseTitle,
        courseDescription
      );

      if (courseError || !course) throw courseError;

      toast({
        title: "Course Created! 🎉",
        description: "Now chunking meeting into micro-modules...",
      });

      // Step 2: Chunk meeting into modules
      const meeting = meetings.find(m => m.id === selectedMeeting);
      const recordingUrl = meeting?.recording_url || "https://placeholder.com/recording.mp4";

      const { data: modules, error: chunkError } = await microLearningService.chunkMeetingIntoModules(
        course.id,
        recordingUrl
      );

      if (chunkError) throw chunkError;

      toast({
        title: "Success! ✨",
        description: `Created ${modules?.modulesCreated || 8} micro-learning modules!`,
      });

      // Refresh data
      await loadData();
      setActiveTab("courses");

      // Reset form
      setSelectedMeeting("");
      setCourseTitle("");
      setCourseDescription("");
    } catch (error) {
      console.error("Course creation error:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishCourse = async (courseId: string) => {
    try {
      const { error } = await microLearningService.publishCourse(courseId, 99000);
      if (error) throw error;

      toast({
        title: "Course Published! 🎉",
        description: "Your course is now available in the marketplace",
      });

      await loadData();
    } catch (error) {
      console.error("Publish error:", error);
      toast({
        title: "Publish Failed",
        description: "Failed to publish course",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await microLearningService.deleteCourse(courseId);
      if (error) throw error;

      toast({
        title: "Course Deleted",
        description: "Course has been removed",
      });

      await loadData();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <SEO
        title="Micro-Learning Generator - Break Meetings into 5-Minute Modules | Chaesa Live"
        description="Transform long meetings into bite-sized learning modules. AI automatically splits your content into 5-7 minute chunks with quizzes, slides, and more."
      />
      <Head>
        <link rel="canonical" href="https://chaesa.live/micro-learning" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mb-4 text-white hover:bg-white/10"
            >
              ← Back to Home
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-10 h-10 text-yellow-400" />
              <h1 className="text-4xl font-bold text-white">Micro-Learning Generator</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Transform long meetings into bite-sized 5-7 minute learning modules
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/10 border border-white/20">
              <TabsTrigger value="create" className="data-[state=active]:bg-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Course
              </TabsTrigger>
              <TabsTrigger value="courses" className="data-[state=active]:bg-white/20">
                <BookOpen className="w-4 h-4 mr-2" />
                My Courses ({courses.length})
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-white/20">
                <TrendingUp className="w-4 h-4 mr-2" />
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20">
                <Target className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* CREATE TAB */}
            <TabsContent value="create" className="space-y-6">
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Create Micro-Learning Course
                </h2>
                <p className="text-gray-300 mb-6">
                  Select a meeting recording and we'll automatically chunk it into 5-7 minute
                  modules, complete with slides, quizzes, and summaries!
                </p>

                {/* Feature Preview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <Video className="w-8 h-8 text-blue-400 mb-2" />
                    <h3 className="text-white font-semibold">Auto-Chunking</h3>
                    <p className="text-sm text-gray-400">5-7 min modules</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <BookOpen className="w-8 h-8 text-green-400 mb-2" />
                    <h3 className="text-white font-semibold">Mini Slides</h3>
                    <p className="text-sm text-gray-400">3-5 slides each</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <CheckCircle className="w-8 h-8 text-yellow-400 mb-2" />
                    <h3 className="text-white font-semibold">Quick Quiz</h3>
                    <p className="text-sm text-gray-400">3-5 questions</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <Award className="w-8 h-8 text-purple-400 mb-2" />
                    <h3 className="text-white font-semibold">Gamification</h3>
                    <p className="text-sm text-gray-400">Badges & points</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-2">Select Meeting Recording:</Label>
                    <select
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                      value={selectedMeeting}
                      onChange={(e) => setSelectedMeeting(e.target.value)}
                    >
                      <option value="">Choose a meeting...</option>
                      {meetings.map((meeting) => (
                        <option key={meeting.id} value={meeting.id}>
                          {meeting.title || `Meeting ${meeting.meeting_code}`} -{" "}
                          {new Date(meeting.created_at).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-white mb-2">Course Title:</Label>
                    <Input
                      placeholder="e.g., Digital Marketing Masterclass"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2">Description (Optional):</Label>
                    <textarea
                      placeholder="Describe what this course teaches..."
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white h-24"
                    />
                  </div>

                  <Button
                    onClick={handleCreateCourse}
                    disabled={isProcessing || !selectedMeeting || !courseTitle}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Micro-Learning Course
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* How It Works */}
              <Card className="p-6 bg-white/5 border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">AI Analysis</h4>
                    <p className="text-sm text-gray-400">
                      Analyze meeting transcript to detect topic changes
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Smart Chunking</h4>
                    <p className="text-sm text-gray-400">
                      Split video into 5-7 minute modules at natural breakpoints
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Generate Content</h4>
                    <p className="text-sm text-gray-400">
                      Create slides, quizzes, summaries for each module
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Ready to Publish</h4>
                    <p className="text-sm text-gray-400">
                      Export to any platform or sell in our marketplace
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* MY COURSES TAB */}
            <TabsContent value="courses" className="space-y-4">
              {courses.length === 0 ? (
                <Card className="p-12 bg-white/5 border-white/10 text-center">
                  <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Create your first micro-learning course from a meeting recording
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    Create Course Now
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <Card
                      key={course.id}
                      className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-white">
                              {course.title}
                            </h3>
                            {course.is_published && (
                              <Badge className="bg-green-500">Published</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-3">
                            {course.description || "No description"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              {course.total_modules || 0} modules
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {Math.floor((course.total_duration || 0) / 60)} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {course.enrolled_count || 0} learners
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/course/${course.id}`)}
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {!course.is_published && (
                          <Button
                            size="sm"
                            onClick={() => handlePublishCourse(course.id)}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Publish
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* MARKETPLACE TAB */}
            <TabsContent value="marketplace" className="space-y-4">
              <Card className="p-12 bg-white/5 border-white/10 text-center">
                <TrendingUp className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Marketplace Coming Soon!
                </h3>
                <p className="text-gray-400">
                  Sell your micro-learning courses to thousands of learners
                </p>
              </Card>
            </TabsContent>

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="space-y-4">
              <Card className="p-12 bg-white/5 border-white/10 text-center">
                <Target className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-gray-400">
                  Track learner progress, engagement, and course performance
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}