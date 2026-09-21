import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, Clock, CheckCircle2, XCircle, AlertCircle, Award, 
  ArrowRight, RefreshCw, Zap, Lightbulb, BookOpen, Target
} from 'lucide-react';
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <div className="flex flex-col items-center space-y-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Loading Aptitude Practice Quizzes...</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/60 via-slate-800 to-orange-950/60 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Campus Aptitude Diagnostics</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Aptitude Tests & Weak-Topic Analysis</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Master placement aptitude rounds with timed quizzes across Quantitative Math, Logical Reasoning, and Verbal Comprehension.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 text-center shrink-0">
            <span className="text-xs font-semibold text-slate-400 block uppercase">Test Categories</span>
            <span className="text-2xl font-black text-amber-400 mt-0.5 block">{categories.length} Topics Ready</span>
          </div>
        </div>
      </div>

      {!quizData ? (
        /* Category Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const colors = [
              { border: 'hover:border-amber-500/50', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' },
              { border: 'hover:border-indigo-500/50', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30' },
              { border: 'hover:border-emerald-500/50', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' }
            ];
            const theme = colors[idx % colors.length];

            return (
              <div 
                key={cat.id} 
                className={`bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl ${theme.border} hover:scale-[1.01] group`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition">
                      <BrainCircuit className="w-6 h-6 text-amber-400" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
                      {cat.question_count} Questions
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-white">{cat.name}</h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{cat.description}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Timed Test: ~{cat.question_count * 1.5} Minutes</span>
                  </div>
                </div>

                <button
                  onClick={() => startQuiz(cat)}
                  className={`mt-6 w-full text-white text-xs font-bold py-3 rounded-2xl transition flex items-center justify-center space-x-2 shadow-xl ${theme.btn}`}
                >
                  <span>Start Timed Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Active Quiz Workspace */
        <div className="space-y-6">
          {/* Header & Live Timer Bar */}
          <div className="bg-slate-800/90 border border-slate-700/90 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Live Assessment Mode</span>
              <h2 className="font-extrabold text-white text-xl mt-0.5">{activeCategory?.name}</h2>
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-mono text-base font-black border ${
                timeLeft < 60 ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-slate-900 text-amber-400 border-slate-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span>{formatTime(timeLeft)}</span>
              </div>

              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition shadow-lg shadow-emerald-600/30"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={() => setQuizData(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition"
                >
                  Back to Categories
                </button>
              )}
            </div>
          </div>

          {/* Diagnostic Results Summary Modal/Card */}
          {results && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Diagnostic Results Summary</span>
                  <h3 className="text-2xl font-black text-white mt-1">Quiz Completed! 🎉</h3>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center bg-slate-900 p-3 px-5 rounded-2xl border border-slate-700">
                    <span className="text-xs text-slate-400 block font-medium">Score Accuracy</span>
                    <span className="text-3xl font-black text-amber-400">{results.score_percentage}%</span>
                  </div>
                  <div className="text-center bg-slate-900 p-3 px-5 rounded-2xl border border-slate-700">
                    <span className="text-xs text-slate-400 block font-medium">Correct</span>
                    <span className="text-3xl font-black text-emerald-400">{results.correct_answers} / {results.total_questions}</span>
                  </div>
                </div>
              </div>

              {results.weak_topics?.length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Identified Weak Topics for Revision:</span>
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {results.weak_topics.map((wt, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold">
                        ⚠️ {wt}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  🌟 Outstanding! Zero weak topics identified. Perfect score performance!
                </div>
              )}
            </div>
          )}

          {/* Question Cards List */}
          <div className="space-y-6">
            {quizData.questions?.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];

              return (
                <div key={q.id} className="bg-slate-800/90 border border-slate-700/90 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex items-start space-x-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <p className="font-bold text-white text-base leading-relaxed">{q.question_text}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {Object.entries(q.options).map(([key, opt]) => {
                      const isSelected = selectedOpt === key;

                      return (
                        <button
                          key={key}
                          onClick={() => handleAnswerSelect(q.id, key)}
                          disabled={quizSubmitted}
                          className={`p-4 rounded-2xl border text-left text-xs transition-all duration-200 flex items-center space-x-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500 text-white font-bold ring-2 ring-amber-500/30 shadow-lg'
                              : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-900 hover:border-slate-600'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400 border border-slate-700'
                          }`}>
                            {key}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Step-by-Step Explanation after submission */}
                  {results?.details && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-blue-400">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        <span>Step-by-Step Solution & Explanation:</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-6">
                        {results.details.find(d => d.question_id === q.id)?.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
