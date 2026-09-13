import React, { useState, useEffect } from 'react';
import { BrainCircuit, Clock, CheckCircle2, XCircle, AlertCircle, Award, ArrowRight } from 'lucide-react';
import api from '../api/client';

export default function AptitudeTests() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/aptitude/categories')
      .then(res => setCategories(res.data.categories || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Countdown timer effect during quiz
  useEffect(() => {
    if (quizData && !quizSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizData, quizSubmitted, timeLeft]);

  const startQuiz = async (cat) => {
    setActiveCategory(cat);
    setUserAnswers({});
    setQuizSubmitted(false);
    setResults(null);

    try {
      const res = await api.get(`/aptitude/quiz/${cat.id}`);
      setQuizData(res.data);
      setTimeLeft(res.data.time_limit_seconds || 300);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerSelect = (questionId, option) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleQuizSubmit = async () => {
    if (!activeCategory || quizSubmitted) return;
    setQuizSubmitted(true);

    try {
      const res = await api.post(`/aptitude/submit/${activeCategory.id}`, { answers: userAnswers });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Loading placement aptitude modules...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <BrainCircuit className="w-6 h-6 text-amber-400" />
          <span>Aptitude Practice & Timed Quizzes</span>
        </h1>
        <p className="text-sm text-slate-400">Timed quantitative, logical reasoning, and verbal tests with weak-topic analysis</p>
      </div>

      {!quizData ? (
        /* Category Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{cat.description}</p>
                <p className="text-xs text-amber-400 font-semibold mt-3">Quizzes available ({cat.question_count} questions)</p>
              </div>
              <button
                onClick={() => startQuiz(cat)}
                className="mt-6 w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-600/30"
              >
                <span>Start Timed Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Active Quiz Workspace */
        <div className="space-y-6">
          {/* Header & Timer Bar */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-white text-base">{activeCategory?.name} Quiz</h2>
              <span className="text-xs text-slate-400">Answer all questions before timer expires</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                timeLeft < 60 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-slate-900 text-amber-400 border-slate-700'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>

              {!quizSubmitted && (
                <button
                  onClick={handleQuizSubmit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>

          {/* Results Diagnostic Card */}
          {results && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Quiz Score Summary</h3>
                  <p className="text-xs text-slate-400">Score Percentage: <span className="text-amber-400 font-bold">{results.score_percentage}%</span></p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-white">{results.correct_answers}</span>
                  <span className="text-slate-400 text-sm"> / {results.total_questions} Correct</span>
                </div>
              </div>

              {results.weak_topics?.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-300">Weak Topics Identified: </span>
                  <span className="text-slate-300">{results.weak_topics.join(', ')}</span>
                </div>
              )}

              <button
                onClick={() => setQuizData(null)}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                Back to Categories
              </button>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {quizData.questions?.map((q, idx) => (
              <div key={q.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-amber-400 text-sm">Q{idx + 1}.</span>
                  <p className="font-medium text-slate-200 text-sm">{q.question_text}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                  {Object.entries(q.options).map(([key, opt]) => {
                    const isSelected = userAnswers[q.id] === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleAnswerSelect(q.id, key)}
                        disabled={quizSubmitted}
                        className={`p-3 rounded-xl border text-left text-xs transition flex items-center space-x-2 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white font-semibold'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-amber-400">
                          {key}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation after submission */}
                {results?.details && (
                  <div className="mt-3 pl-6 pt-3 border-t border-slate-700/60 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-blue-400">
                      Correct Option: {results.details.find(d => d.question_id === q.id)?.correct_answer}
                    </p>
                    <p><span className="text-slate-400">Explanation:</span> {results.details.find(d => d.question_id === q.id)?.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
