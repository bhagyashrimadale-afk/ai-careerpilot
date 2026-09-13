import React, { useState } from 'react';
import { Mic, Sparkles, CheckCircle2, MessageSquare, RefreshCw, Trophy, Play } from 'lucide-react';
import api from '../api/client';

export default function MockInterview() {
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [started, setStarted] = useState(false);

  const handleStartInterview = async () => {
    setEvaluating(true);
    try {
      const res = await api.post('/interview/start', { target_role: targetRole });
      setInterviewId(res.data.interview_id);
      setQuestions(res.data.questions || []);
      setCurrentIndex(0);
      setUserAnswer('');
      setEvaluation(null);
      setStarted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim() || !interviewId) return;
    const currentQ = questions[currentIndex];
    setEvaluating(true);

    try {
      const res = await api.post('/interview/evaluate-answer', {
        interview_id: interviewId,
        question_text: currentQ.text,
        question_type: currentQ.type,
        user_answer: userAnswer
      });
      setEvaluation(res.data.evaluation);
      setOverallScore(res.data.interview_overall_score);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setEvaluation(null);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Mic className="w-6 h-6 text-sky-400" />
          <span>AI Mock Interviewer</span>
        </h1>
        <p className="text-sm text-slate-400">Practice role-specific technical & HR questions with instant AI evaluation</p>
      </div>

      {!started ? (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Select Target Interview Role</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Our AI engine will simulate a real interview round covering technical architecture, coding concepts, and HR behavioral questions.
            </p>
          </div>

          <div className="max-w-xs mx-auto">
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Software Engineer">Software Engineer</option>
            </select>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={evaluating}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-3 rounded-xl transition inline-flex items-center space-x-2 shadow-lg shadow-sky-600/30 text-sm"
          >
            <Play className="w-4 h-4" />
            <span>{evaluating ? 'Initializing AI Session...' : 'Start Mock Interview Session'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Question {currentIndex + 1} of {questions.length}</span>
              <p className="text-sm font-bold text-white">{targetRole} Round</p>
            </div>
            {overallScore > 0 && (
              <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300 font-medium">Session Score: <strong className="text-white">{overallScore}%</strong></span>
              </div>
            )}
          </div>

          {/* Question Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/20">
                {currentQ?.type}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{currentQ?.text}</h3>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Answer</label>
              <textarea
                rows="5"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="Type or dictate your structured response here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleEvaluateAnswer}
                disabled={evaluating || !userAnswer.trim()}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-sky-600/30"
              >
                {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{evaluating ? 'AI Evaluating...' : 'Evaluate Answer'}</span>
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={!evaluation}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={() => setStarted(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  Complete Interview Session 🎉
                </button>
              )}
            </div>
          </div>

          {/* AI Feedback Output */}
          {evaluation && (
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">AI Response Assessment</span>
                <span className={`text-lg font-extrabold ${evaluation.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Score: {evaluation.score}/100
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-1">Constructive Feedback:</h4>
                <p className="text-xs text-slate-200 leading-relaxed">{evaluation.feedback}</p>
              </div>

              {evaluation.suggested_improvement && (
                <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200">
                  <span className="font-bold">Suggested Improvement: </span>
                  {evaluation.suggested_improvement}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
