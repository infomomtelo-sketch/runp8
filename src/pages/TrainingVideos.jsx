import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

// 14 Mandatory Title 22 Caregiver Courses with open-access video stream paths
const TRAINING_COURSES = [
  { id: 1, title: "Dementia Care: This Is Your Brain on Music", duration: "1 Hour", type: "Core", videoUrl: "https://zencdn.net" },
  { id: 2, title: "Dementia-Related Behaviors & Communication", duration: "3 Hours", type: "Core", videoUrl: "https://html5demos.com" },
  { id: 3, title: "Infection Control & Safety Protocols", duration: "1 Hour", type: "Core", videoUrl: "https://zencdn.net" },
  { id: 4, title: "Residents' Rights in RCFE", duration: "1 Hour", type: "Core", videoUrl: "https://html5demos.com" },
  { id: 5, title: "Postural Supports & Restraints Guidelines", duration: "1 Hour", type: "Core", videoUrl: "https://zencdn.net" },
  { id: 6, title: "Medication Management & Safety", duration: "2 Hours", type: "Core", videoUrl: "https://html5demos.com" },
  { id: 7, title: "Assisting with Activities of Daily Living (ADLs)", duration: "2 Hours", type: "Core", videoUrl: "https://zencdn.net" },
  { id: 8, title: "Emergency Preparedness & Disaster Plans", duration: "1 Hour", type: "Core", videoUrl: "https://html5demos.com" },
  { id: 9, title: "Food Safety and Nutritional Requirements", duration: "1 Hour", type: "Elective", videoUrl: "https://zencdn.net" },
  { id: 10, title: "Reporting Requirements & Abuse Prevention", duration: "1 Hour", type: "Core", videoUrl: "https://html5demos.com" },
  { id: 11, title: "Psychosocial Needs of the Elderly", duration: "1 Hour", type: "Elective", videoUrl: "https://zencdn.net" },
  { id: 12, title: "Basic First Aid & Physical Environment Safety", duration: "1 Hour", type: "Core", videoUrl: "https://html5demos.com" },
  { id: 13, title: "Caregiver Boundaries & Ethics", duration: "1 Hour", type: "Elective", videoUrl: "https://zencdn.net" },
  { id: 14, title: "Hospice Care and Comfort Protocols", duration: "2 Hours", type: "Elective", videoUrl: "https://html5demos.com" }
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
        const { data, error } = await supabase.from('caregiver_training_progress').select('course_id');
        if (error) throw error;
        if (data) setCompletedVideos(data.map(row => row.course_id));
      } catch (err) {
        console.error("Error logs:", err.message);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('caregiver_training_progress').upsert({ user_id: user.id, course_id: courseId, course_title: courseTitle }, { onConflict: 'user_id,course_id' });
      alert("✅ Success! Progress saved.");
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleQuizAnswer = async (isCorrect) => {
    if (isCorrect) {
      setShowPopQuiz(false);
      videoRef.current.play();
      if (!completedVideos.includes(activeVideo.id)) {
        setCompletedVideos([...completedVideos, activeVideo.id]);
        await saveProgressToSupabase(activeVideo.id, activeVideo.title);
      }
    } else {
      alert("Incorrect answer. Try again.");
    }
  };

  if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Syncing logs...</div>;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', boxSizing: 'border-box' }}>
      <header style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb' }}>TITLE 22 CALIFORNIA COMPLIANCE</span>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '4px 0 0 0' }}>Interactive Video Training Dashboard</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative', backgroundColor: '#000000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}>
            <video key={activeVideo.id} ref={videoRef} src={activeVideo.videoUrl} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} onTimeUpdate={handleTimeUpdate} />
            {showPopQuiz && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>🔒 In-Video Learning Validation</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 24px 0' }}>Select the core objective of this compliance video framework:</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleQuizAnswer(true)} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Correct Answer</button>
                  <button onClick={() => handleQuizAnswer(false)} style={{ backgroundColor: '#334155', color: '#cbd5e1', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Wrong Answer</button>
                </div>
              </div>
            )}
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '9999px' }}>{activeVideo.type} Module</span>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '12px 0 4px 0' }}>{activeVideo.title}</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>Required Track Time: {activeVideo.duration}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', maxHeight: '580px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', margin: '0' }}>Modules Tracker</h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '9999px' }}>{completedVideos.length} / 14</span>
          </div>
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', flex: '1' }}>
            {TRAINING_COURSES.map((course) => {
              const isSelected = activeVideo.id === course.id;
              const isDone = completedVideos.includes(course.id);
              return (
                <button key={course.id} onClick={() => { setActiveVideo(course); setShowPopQuiz(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px', borderRadius: '8px', border: isSelected ? '1px solid #2563eb' : '1px solid #e5e7eb', backgroundColor: isSelected ? '#eff6ff' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '12px' }}>
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#1e3a8a' : '#111827', margin: '0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{course.title}</h4>
                    <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', display: 'block' }}>{course.duration}</span>
                  </div>
                  <div>{isDone ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span> : <span style={{ color: '#9ca3af' }}>⏵</span>}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
