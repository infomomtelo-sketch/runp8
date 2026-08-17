import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const SAMPLE_QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "According to Title 22 rules, what must be done before giving a resident a PRN (as-needed) medication?",
    options: [
      "Give it whenever the resident asks for it without checking logs.",
      "Check the clear, specific written directions from the doctor first.",
      "Ask another caregiver if it seems like a good idea.",
      "Wait until the end of the shift to record it."
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    text: "Where must centrally stored medications be kept in a residential care facility?",
    options: [
      "On a kitchen counter for easy access.",
      "In a locked cabinet or safe area that clients cannot access.",
      "In the manager's open desk drawer.",
      "In the resident's unlocked nightstand drawer."
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    text: "What must you do instantly after assisting a resident with their daily medications?",
    options: [
      "Tell the next shift worker during handoff.",
      "Write it down on a scrap paper to log at the end of the week.",
      "Document it immediately on the resident's Centrally Stored Medication Record.",
      "Call the doctor to confirm they took it."
    ],
    correctAnswer: 2
  }
];

interface QuizProps {
  courseId: string;
  hoursToEarn: number;
  onClose: () => void;
}

export default function TrainingQuiz({ courseId, hoursToEarn, onClose }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleNext = () => {
    if (selectedAns === SAMPLE_QUIZ_QUESTIONS[currentIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }

    if (currentIdx + 1 < SAMPLE_QUIZ_QUESTIONS.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAns(null);
    } else {
      setQuizFinished(true);
    }
  };

  const saveResultsToDatabase = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const finalPercentage = Math.round((score / SAMPLE_QUIZ_QUESTIONS.length) * 100);
      const passed = finalPercentage >= 80;

      const { error } = await supabase
        .from('caregiver_training_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          hours_completed: passed ? hoursToEarn : 0,
          quiz_passed: passed,
          highest_score: finalPercentage,
          last_active_at: new Date().toISOString(),
          completed_at: passed ? new Date().toISOString() : null
        }, { onConflict: 'user_id,course_id' });

      if (error) throw error;
      onClose();
    } catch (err) {
      console.error("Could not save training quiz logs:", err);
    } finally {
      setSaving(false);
    }
  };

  const activeQuestion = SAMPLE_QUIZ_QUESTIONS[currentIdx];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border flex flex-col">
        
        <div className="bg-slate-950 p-4 text-white flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Title 22 Quiz Engine</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        {!quizFinished ? (
          <div className="p-6 space-y-6">
            <div>
              <span className="text-xs text-slate-400 font-medium">Question {currentIdx + 1} of {SAMPLE_QUIZ_QUESTIONS.length}</span>
              <h2 className="text-lg font-bold text-slate-900 mt-1 leading-snug">{activeQuestion.text}</h2>
            </div>

            <div className="space-y-3">
              {activeQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAns(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all ${
                    selectedAns === idx 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedAns === null}
              className="w-full bg-slate-950 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors shadow-sm"
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div className="p-6 text-center space-y-6">
            <div>
              <div className="text-4xl">🎯</div>
              <h2 className="text-xl font-bold text-slate-900 mt-3">Quiz Complete!</h2>
              <p className="text-sm text-slate-500 mt-1">
                You got {score} out of {SAMPLE_QUIZ_QUESTIONS.length} correct.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border inline-block">
              <span className="text-xs text-slate-500 block font-medium">Final Percentage Score</span>
              <span className={`text-2xl font-black ${
                Math.round((score / SAMPLE_QUIZ_QUESTIONS.length) * 100) >= 80 ? 'text-green-600' : 'text-amber-600'
              }`}>
                {Math.round((score / SAMPLE_QUIZ_QUESTIONS.length) * 100)}%
              </span>
            </div>

            <button
              onClick={saveResultsToDatabase}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              {saving ? 'Saving Logs...' : 'Finish & Close Session'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
