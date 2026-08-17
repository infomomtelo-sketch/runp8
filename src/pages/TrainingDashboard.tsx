import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import TrainingQuiz from '../components/TrainingQuiz';

interface Course {
  id: string;
  title: string;
  requiredHours: number;
  category: string;
  description: string;
}

const COMPLIANCE_COURSES: Course[] = [
  { 
    id: 'initial-orientation', 
    title: 'Initial Facility Orientation', 
    requiredHours: 40, 
    category: 'Core Compliance',
    description: 'Mandatory introduction covering Resident Rights, Medication Safety, and Emergency Procedures.'
  },
  { 
    id: 'dementia-care', 
    title: 'Dementia & Memory Care', 
    requiredHours: 8, 
    category: 'Specialized Training',
    description: 'Required specialized hours covering behavior management and communications in memory care.'
  },
  { 
    id: 'medication-assistance', 
    title: 'Safe Medication Assistance', 
    requiredHours: 4, 
    category: 'Health & Safety',
    description: 'Proper handling, logging, storage, and assistance protocols for PRN and daily medications.'
  },
  { 
    id: 'annual-ce', 
    title: 'Annual Continuing Education', 
    requiredHours: 20, 
    category: 'Recurring Mandate',
    description: 'Yearly ongoing learning credits required by the DSS to maintain active caregiver status.'
  }
];

export default function TrainingDashboard() {
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeQuizCourse, setActiveQuizCourse] = useState<{ id: string; hours: number } | null>(null);

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('caregiver_training_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const progressMap = data.reduce((acc, curr) => ({ 
          ...acc, 
          [curr.course_id]: curr 
        }), {});
        setProgress(progressMap);
      }
    } catch (err) {
      console.error("Error loading progress logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="text-center font-medium text-gray-600">Loading your compliance tracker...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <header className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Caregiver Training Center</h1>
            <p className="text-sm text-gray-500 mt-1">California Title 22 Compliance Logging & Certifications</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-semibold self-start sm:self-center">
            ✓ Connected to Secure DSS Logging Engine
          </div>
        </header>

        {/* Course Training Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {COMPLIANCE_COURSES.map((course) => {
            const track = progress[course.id] || { hours_completed: 0, quiz_passed: false };
            const completionPercent = Math.min(100, Math.round((track.hours_completed / course.requiredHours) * 100));

            return (
              <div key={course.id} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 uppercase tracking-wider">
                    {course.category}
                  </span>
                  <h3 className="font-bold text-lg text-gray-900 mt-3">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                    <span>Audit Progress</span>
                    <span className="font-bold text-gray-900">
                      {completionPercent}% ({track.hours_completed}/{course.requiredHours} hrs)
                    </span>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        track.quiz_passed ? 'bg-green-500' : 'bg-blue-600'
                      }`} 
                      style={{ width: `${completionPercent}%` }} 
                    />
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => !track.quiz_passed && setActiveQuizCourse({ id: course.id, hours: course.requiredHours })}
                    className={`w-full mt-5 py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors ${
                      track.quiz_passed 
                        ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' 
                        : 'bg-gray-950 text-white hover:bg-gray-800 shadow-sm'
                    }`}
                  >
                    {track.quiz_passed ? '✓ Course Complete & Logged' : 'Launch Training Session'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Overlay Link */}
        {activeQuizCourse && (
          <TrainingQuiz 
            courseId={activeQuizCourse.id}
            hoursToEarn={activeQuizCourse.hours}
            onClose={() => {
              setActiveQuizCourse(null);
              fetchUserProgress(); // Automatically updates layout values on save without full reload
            }}
          />
        )}
        
      </div>
    </div>
  );
}
