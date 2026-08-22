import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

// 🆕 Real Video Data Added Here
const TRAINING_COURSES = [
  { 
    id: 1, 
    title: "Dementia Care: This Is Your Brain on Music", 
    duration: "1 Hour", 
    type: "Core",
    videoUrl: "https://googleapis.com" 
  },
  { 
    id: 2, 
    title: "Dementia-Related Behaviors & Communication", 
    duration: "3 Hours", 
    type: "Core",
    videoUrl: "https://googleapis.com" 
  },
  { 
    id: 3, 
    title: "Infection Control & Safety Protocols", 
    duration: "1 Hour", 
    type: "Core",
    videoUrl: "https://googleapis.com" 
  },
  { 
    id: 4, 
    title: "Residents' Rights in RCFE", 
    duration: "1 Hour", 
    type: "Core",
    videoUrl: "https://googleapis.com" 
  },
  { id: 5, title: "Postural Supports & Restraints Guidelines", duration: "1 Hour", type: "Core", videoUrl: "" },
  { id: 6, title: "Medication Management & Safety", duration: "2 Hours", type: "Core", videoUrl: "" },
  { id: 7, title: "Assisting with Activities of Daily Living (ADLs)", duration: "2 Hours", type: "Core", videoUrl: "" },
  { id: 8, title: "Emergency Preparedness & Disaster Plans", duration: "1 Hour", type: "Core", videoUrl: "" },
  { id: 9, title: "Food Safety and Nutritional Requirements", duration: "1 Hour", type: "Elective", videoUrl: "" },
  { id: 10, title: "Reporting Requirements & Abuse Prevention", duration: "1 Hour", type: "Core", videoUrl: "" },
  { id: 11, title: "Psychosocial Needs of the Elderly", duration: "1 Hour", type: "Elective", videoUrl: "" },
  { id: 12, title: "Basic First Aid & Physical Environment Safety", duration: "1 Hour", type: "Core", videoUrl: "" },
  { id: 13, title: "Caregiver Boundaries & Ethics", duration: "1 Hour", type: "Elective", videoUrl: "" },
  { id: 14, title: "Hospice Care and Comfort Protocols", duration: "2 Hours", type: "Elective", videoUrl: "" }
];

export default function TrainingVideos() {
  const [activeVideo, setActiveVideo] = useState(TRAINING_COURSES[0]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [showPopQuiz, setShowPopQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('caregiver_training_progress')
          .select('course_id');

        if (error) throw error;
        if (data) {
          setCompletedVideos(data.map(row => row.course_id));
        }
      } catch (err) {
        console.error("Error loading progress:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    if (currentTime >= 5 && !completedVideos.includes(activeVideo.id) && !showPopQuiz) {
      videoRef.current.pause();
      setShowPopQuiz(true);
    }
  };

  const saveProgressToSupabase = async (courseId, courseTitle) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("🔒 Auth Error: Please log in to save your training progress!");
        return;
      }

      const { error } = await supabase
        .from('caregiver_training_progress')
        .upsert({ 
          user_id: user.id, 
          course_id: courseId, 
          course_title: courseTitle 
        }, { onConflict: 'user_id,course_id' });

      if (error) {
        alert(`❌ Supabase Error: ${error.message}`);
        throw error;
      }
      alert("✅ Success! Progress saved.");
    } catch (err) {
      console.error("Database save failed:", err.message);
    }
  };

  const handleQuizAnswer = async (isCorrect) => {
    if (isCorrect) {
      setShowPopQuiz(false);
      videoRef.current.play();
      
      if (!completedVideos.includes(activeVideo.id)) {
        const updated = [...completedVideos, activeVideo.id];
        setCompletedVideos(updated);
        await saveProgressToSupabase(activeVideo.id, activeVideo.title);
      }
    } else {
      alert("Incorrect answer. Try again to resume video.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-medium text-gray-500">Syncing training logs...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-sans text-gray-900 bg-gray-50/50 rounded-2xl border border-gray-100">
      <header className="mb-6">
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Title 22 California RCFE Compliance</span>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">Interactive Video Learning Portal</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-md border border-gray-900">
            <video 
              key={activeVideo.id} // Forces video source to refresh instantly on click
              ref={videoRef}
              src={activeVideo.videoUrl || "https://googleapis.com"}
              controls
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain"
            />

            {showPopQuiz && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-base font-bold text-white">🔒 In-Video Learning Validation</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6">Select the core objective of this compliance video framework:</p>
                <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md px-4">
                  <button onClick={() => handleQuizAnswer(true)} className="flex-1 text-xs font-semibold bg-blue-600 text-white py-3 px-4 rounded-xl shadow">
                    Resident Dignity & Care Safety
                  </button>
                  <button onClick={() => handleQuizAnswer(false)} className="flex-1 text-xs font-semibold bg-slate-800 text-slate-300 py-3 px-4 rounded-xl border border-slate-700">
                    Bypass Protocol Steps
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">{activeVideo.type} Module</span>
              <h2 className="text-base font-bold text-gray-900 mt-1.5">{activeVideo.title}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Required Track Time: {activeVideo.duration}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col h-[520px]">
          <div className="mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Modules Completed</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{completedVideos.length} / 14</span>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1">
            {TRAINING_COURSES.map((course) => {
              const isSelected = activeVideo.id === course.id;
              const isDone = completedVideos.includes(course.id);
              return (
                <button
                  key={course.id}
                  onClick={() => {
                    setActiveVideo(course);
                    setShowPopQuiz(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-blue-950' : 'text-gray-900'}`}>{course.id}. {course.title}</h4>
                    <span className="text-[10px] text-gray-400 font-medium">{course.duration}</span>
                  </div>
                  <div>{isDone ? <span className="text-green-600 text-xs font-bold">✓</span> : <span className="text-gray-400 text-xs">⏵</span>}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
