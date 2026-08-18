import React, { useState } from 'react';

// The 14 Mandatory Title 22 Caregiver Courses
const TITLE_22_COURSES = [
  { id: 1, title: "Dementia Care: This Is Your Brain on Music", hours: "1 hour", defaultStatus: "Completed" },
  { id: 2, title: "Dementia-Related Behaviors", hours: "3 hours", defaultStatus: "Completed" },
  { id: 3, title: "Dementia: Causes, Symptoms and Types", hours: "2 hours", defaultStatus: "Completed" },
  { id: 4, title: "Dementia: Getting Through the Day", hours: "2 hours", defaultStatus: "Completed" },
  { id: 5, title: "Hospice Care for RCFE", hours: "2 hours", defaultStatus: "Completed" },
  { id: 6, title: "Infection Control", hours: "1 hour", defaultStatus: "Completed" },
  { id: 7, title: "Managing Aggressive Behaviors", hours: "0.5 hour", defaultStatus: "Completed" },
  { id: 8, title: "Osteoporosis", hours: "2 hours", defaultStatus: "Completed" },
  { id: 9, title: "Physical Changes in Aging", hours: "1 hour", defaultStatus: "Completed" },
  { id: 10, title: "Postural Supports in RCFE", hours: "2 hours", defaultStatus: "Completed" },
  { id: 11, title: "Psychosocial Needs of Elders", hours: "2 hours", defaultStatus: "Completed" },
  { id: 12, title: "Recognizing and Reporting Abuse", hours: "1 hour", defaultStatus: "Completed" },
  { id: 13, title: "Residents' Rights in RCFE", hours: "1 hour", defaultStatus: "Completed" },
  { id: 14, title: "Restricted and Prohibited Conditions RCFE", hours: "1 hour", defaultStatus: "Completed" }
];

export default function App() {
  const [filter, setFilter] = useState('All Status');
  const [courses] = useState(TITLE_22_COURSES);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans antialiased text-gray-800">
      <div className="max-w-7xl mx-auto bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        
        {/* Header Block */}
        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Courses ({courses.length})
            </h1>
            
            {/* View Toggle Icons Anchor */}
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

        {/* 1992 Clean Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {courses
            .filter(c => filter === 'All Status' || c.defaultStatus === filter)
            .map((course) => (
              <div 
                key={course.id} 
                className="border border-blue-100/70 rounded-xl p-4 bg-blue-50/20 hover:bg-blue-50/40 transition-colors duration-150 flex flex-col justify-between min-h-[145px]"
              >
                {/* Course Metadata */}
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
                    onClick={() => alert(`Launching ${course.title}`)}
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
