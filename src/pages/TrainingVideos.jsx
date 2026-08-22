import React, { useState, useRef, useEffect } from 'react';

// 14 Mandatory Title 22 Caregiver Courses
const TRAINING_COURSES = [
  { id: 1, title: "Dementia Care: This Is Your Brain on Music", duration: "1 Hour", type: "Core" },
  { id: 2, title: "Dementia-Related Behaviors & Communication", duration: "3 Hours", type: "Core" },
  { id: 3, title: "Infection Control & Safety Protocols", duration: "1 Hour", type: "Core" },
  { id: 4, title: "Residents' Rights in RCFE", duration: "1 Hour", type: "Core" },
  { id: 5, title: "Postural Supports & Restraints Guidelines", duration: "1 Hour", type: "Core" },
  { id: 6, title: "Medication Management & Safety", duration: "2 Hours", type: "Core" },
  { id: 7, title: "Assisting with Activities of Daily Living (ADLs)", duration: "2 Hours", type: "Core" },
  { id: 8, title: "Emergency Preparedness & Disaster Plans", duration: "1 Hour", type: "Core" },
  { id: 9, title: "Food Safety and Nutritional Requirements", duration: "1 Hour", type: "Elective" },
  { id: 10, title: "Reporting Requirements & Abuse Prevention", duration: "1 Hour", type: "Core" },
  { id: 11, title: "Psychosocial Needs of the Elderly", duration: "1 Hour", type: "Elective" },
  { id: 12, title: "Basic First Aid & Physical Environment Safety", duration: "1 Hour", type: "Core" },
  { id: 13, title: "Caregiver Boundaries & Ethics", duration: "1 Hour", type: "Elective" },
  { id: 14, title: "Hospice Care and Comfort Protocols", duration: "2 Hours", type: "Elective" }
];

export default function TrainingVideos() {
  const [activeVideo, setActiveVideo] = useState(TRAINING_COURSES[0]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPopQuiz, setShowPopQuiz] = useState(false);
  const videoRef = useRef(null);

  // Trigger interactive question 5 seconds into sample playback
  const handleTimeUpdate = (e) => {
    const currentTime = e.target.currentTime;
    if (currentTime >= 5 && !completedVideos.includes(activeVideo.id) && !showPopQuiz) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPopQuiz(true);
    }
  };

  const handleQuizAnswer = (isCorrect) => {
    if (isCorrect) {
      setShowPopQuiz(false);
      videoRef.current.play();
      setIsPlaying(true);
      
      // Mark course complete
      if (!completedVideos.includes(activeVideo.id)) {
        setCompletedVideos([...completedVideos, activeVideo.id]);
      }
    } else {
      alert("Incorrect answer. Please try again to continue the video.");
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', color: '#111827' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Title 22 Interactive Caregiver Video Portal</h1>
        <p style={{ color: '#4b5563' }}>Complete all 14 mandatory modules. Watch videos fully and pass checkpoints to finish.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Large screen sidebar switch layout emulation */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Left: Video Player */}
          <div style={{ flex: '2', minWidth: '300px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'relative', backgroundColor: '#000000', borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              {/* Fallback real placeholder video feed */}
              <video 
                ref={videoRef}
                src="https://googleapis.com"
                controls
                onTimeUpdate={handleTimeUpdate}
                style={{ width: '100%', height: '100%' }}
              />

              {/* Interactive Popup Overlay */}
              {showPopQuiz && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', color: '#ffffff', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>🔒 Knowledge Checkpoint</h3>
                  <p style={{ marginBottom: '20px', maxWidth: '400px' }}>To verify active learning, please answer: What is the main focus of this compliance section?</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleQuizAnswer(true)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Resident Dignity and Care Safety
                    </button>
                    <button onClick={() => handleQuizAnswer(false)} style={{ backgroundColor: '#4b5563', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                      Ignoring Protocol Guidelines
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px' }}>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '9999px' }}>
                {activeVideo.type}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '8px' }}>{activeVideo.title}</h2>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Duration Requirement: {activeVideo.duration}</p>
            </div>
          </div>

          {/* Right: 14 Course List */}
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxHeight: '600px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Course Tracker ({completedVideos.length}/14 Complete)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {TRAINING_COURSES.map((course) => {
                const isCurrent = activeVideo.id === course.id;
                const isDone = completedVideos.includes(course.id);
                return (
                  <button
                    key={course.id}
                    onClick={() => {
                      setActiveVideo(course);
                      setShowPopQuiz(false);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: '6px',
                      border: isCurrent ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      backgroundColor: isCurrent ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: isCurrent ? '#1e3a8a' : '#111827' }}>
                        {course.id}. {course.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{course.duration}</div>
                    </div>
                    <div>
                      {isDone ? (
                        <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Done</span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>⏵ Play</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
