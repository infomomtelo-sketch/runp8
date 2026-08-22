import React, { useState } from 'react';
import { COURSES_DATA } from './coursesData';
import TrainingVideos from './pages/TrainingVideos'; // Imported your new file

export default function App() {
  const [filter, setFilter] = useState('All Status');
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'videos'>('dashboard'); // Tracks active page view
  
  const [courses, setCourses] = useState(
    COURSES_DATA.map(course => ({ ...course, defaultStatus: 'Completed' }))
  );

  // Find the details of whichever course module is currently selected
  const activeCourse = courses.find(c => c.id === activeQuizId);

  // 🎥 View Condition 1: Show Interactive Training Videos Page
  if (currentView === 'videos') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans antialiased text-gray-800">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className="mb-4 inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-sm transition"
          >
            ← Back to Main Dashboard
          </button>
          <TrainingVideos />
        </div>
      </div>
    );
  }

  // 📝 View Condition 2: Dynamic Quiz Window
  if (activeQuizId && activeCourse) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans antialiased text-gray-800">
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          
          {/* Quiz Navigation Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Title 22 Compliance Training</span>
              <h1 className="text-lg font-bold text-gray-900 leading-tight mt-0.5">{activeCourse.title}</h1>
            </div>
            <button 
              onClick={() => setActiveQuizId(null)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Interactive Placeholder Sandbox for your TrainingQuiz content */}
          <div className="bg-blue-50/30 border border-dashed border-blue-200 rounded-xl p-8 text-center my-6">
            <p className="text-sm text-blue-900 font-semibold mb-1">Interactive Video Framework & Assessment Portal</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              This sandbox component serves as the gateway to stream the required video modules and launch the certified verification test questions for compliance credit.
            </p>
          </div>

          {/* Quiz Action Block */}
          <div className="flex justify-end pt-4 border-t">
            <button 
              onClick={() => {
                alert(`Assessment completed for: ${activeCourse.title}`);
                setActiveQuizId(null);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
            >
              Submit Completed Assessment
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 🗂️ View Condition 3: Main Courses Dashboard View
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans antialiased text-gray-800">
      <div className="max-w-7xl mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        
        {/* Header Block */}
        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Courses ({courses.length})
              </h1>
            </div>
            
            {/* 🆕 Navigation Trigger for Videos */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setCurrentView('videos')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                🎥 Launch Interactive Training Videos
              </button>

              <div className="flex items-center gap-1.5 text-gray-400">
                <button className="p-1 hover:text-blue-600 transition" title="List view">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button className="p-1 text-blue-600 transition" title="Grid view">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Tab Filter Navigation */}
          <div className="flex flex-wrap gap-1.5">
            {['All Status', 'Not Started', 'In Progress', 'Completed'].map((tab) => {
              const isActive = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {courses
            .filter(c => filter === 'All Status' || c.defaultStatus === filter)
            .map((course) => (
              <div 
                key={course.id} 
                className="border border-blue-100/70 rounded-xl p-4 bg-blue-50/20 hover:bg-blue-50/40 transition-colors duration-150 flex flex-col justify-between min-h-[145px]"
              >
                <div>
                  <h3 className="font-bold text-xs text-blue-950 leading-tight tracking-tight mb-1">
                    {course.title}
                  </h3>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {course.hours}
                  </span>
                </div>
                
                {/* Bottom Action Row */}
                <div className="flex justify-between items-center text-[11px] pt-3 mt-4 border-t border-gray-100/60">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-500">
                    <span className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                    {course.defaultStatus}
                  </span>
                  
                  <button 
                    onClick={() => setActiveQuizId(course.id)}
                    className="text-blue-600 font-bold hover:text-blue-800 transition tracking-wide"
                  >
                    Go
                  </button>
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}
