'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, t } from '@/lib/i18n';

type Q = {
  id: number;
  cat: string;
  shot?: string;
  ru: { q: string; opts: string[] };
  uz: { q: string; opts: string[] };
};

type State =
  | { kind: 'intro' }
  | { kind: 'loading' }
  | { kind: 'running'; questions: Q[]; idx: number; answeredIds: number[]; correct: number; incorrect: number; total: number }
  | { kind: 'finished'; correct: number; incorrect: number; total: number }
  | { kind: 'error'; msg: string };

export default function TestRunner({ locale, startMode }: { locale: Locale; startMode: 'intro' | 'resume' }) {
  const router = useRouter();
  const [state, setState] = useState<State>(startMode === 'intro' ? { kind: 'intro' } : { kind: 'loading' });
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<{ correctIndex: number; isCorrect: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startedOnce = useRef(false);

  // Resume: fetch state on mount.
  useEffect(() => {
    if (startMode === 'resume' && !startedOnce.current) {
      startedOnce.current = true;
      void fetchState();
    }
  }, [startMode]);

  async function fetchState() {
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/test/state', { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'finished') {
        setState({ kind: 'finished', correct: data.correctCount, incorrect: data.incorrectCount, total: data.totalCount });
        return;
      }
      if (data.status === 'in_progress') {
        const remaining = (data.questions as Q[]).filter((q) => !data.answeredIds.includes(q.id));
        const allOrdered = [...remaining, ...data.questions.filter((q: Q) => data.answeredIds.includes(q.id))];
        setState({
          kind: 'running',
          questions: allOrdered,
          idx: 0,
          answeredIds: data.answeredIds,
          correct: data.correctCount,
          incorrect: data.incorrectCount,
          total: data.totalCount,
        });
        return;
      }
      setState({ kind: 'intro' });
    } catch {
      setState({ kind: 'error', msg: t(locale, 'common_error') });
    }
  }

  async function startTest() {
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/test/start', { method: 'POST' });
      if (res.status === 409) {
        // already done
        const r = await fetch('/api/test/state', { cache: 'no-store' });
        const d = await r.json();
        setState({ kind: 'finished', correct: d.correctCount ?? 0, incorrect: d.incorrectCount ?? 0, total: d.totalCount ?? 20 });
        return;
      }
      if (res.status === 429) {
        // IP limit exceeded - one test per month per IP
        const data = await res.json();
        setState({ kind: 'error', msg: data.message || t(locale, 'ip_limit_exceeded') });
        return;
      }
      if (!res.ok) throw new Error('start failed');
      // Now load full state with public questions.
      await fetchState();
    } catch {
      setState({ kind: 'error', msg: t(locale, 'common_error') });
    }
  }

  async function submitAnswer() {
    if (state.kind !== 'running' || selected === null || submitting) return;
    const q = state.questions[state.idx];
    setSubmitting(true);
    try {
      const res = await fetch('/api/test/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.id, selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'answer failed');
      setRevealed({ correctIndex: data.correctIndex, isCorrect: data.isCorrect });
      setState((prev) =>
        prev.kind === 'running'
          ? { ...prev, correct: data.correctCount, incorrect: data.incorrectCount, total: data.totalCount, answeredIds: [...prev.answeredIds, q.id] }
          : prev,
      );
    } catch {
      setState({ kind: 'error', msg: t(locale, 'common_error') });
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (state.kind !== 'running') return;
    const isLast = state.idx + 1 >= state.questions.length;
    setSelected(null);
    setRevealed(null);
    if (isLast) {
      void finish();
      return;
    }
    setState({ ...state, idx: state.idx + 1 });
  }

  async function finish() {
    try {
      const res = await fetch('/api/test/finish', { method: 'POST' });
      const data = await res.json();
      setState({ kind: 'finished', correct: data.correctCount, incorrect: data.incorrectCount, total: data.totalCount });
      router.refresh();
    } catch {
      setState({ kind: 'error', msg: t(locale, 'common_error') });
    }
  }

  // Intro / start screen — rendered alongside parent intro
  if (state.kind === 'intro') {
    return (
      <button onClick={startTest} className="btn-primary mt-6 w-full">
        {t(locale, 'test_start')}
      </button>
    );
  }

  if (state.kind === 'loading') {
    return <div className="mx-auto max-w-xl p-6 text-center text-gray-500">{t(locale, 'common_loading')}</div>;
  }

  if (state.kind === 'error') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-6 border-red-200 bg-red-50">
          <div className="text-red-700 font-semibold">{t(locale, 'common_error')}</div>
          <div className="text-sm text-red-600">{state.msg}</div>
        </div>
      </div>
    );
  }

  if (state.kind === 'finished') {
    const total = state.total || 20;
    const pct = Math.round(((state.correct || 0) / total) * 100);
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-6 text-center">
          <h1 className="text-2xl font-bold text-lume-navy">{t(locale, 'test_finished_title')}</h1>
          <div className="mt-4 inline-flex flex-col items-center">
            <div className="text-5xl font-bold text-lume-navy">{pct}%</div>
            <div className="text-xs text-gray-400 mt-1">{state.correct}/{total}</div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="stat-box-correct">
              <div className="text-3xl font-bold text-emerald-600">{state.correct}</div>
              <div className="text-xs text-emerald-700">{t(locale, 'test_score_correct')}</div>
            </div>
            <div className="stat-box-incorrect">
              <div className="text-3xl font-bold text-red-600">{state.incorrect}</div>
              <div className="text-xs text-red-700">{t(locale, 'test_score_incorrect')}</div>
            </div>
          </div>
          <a href="/" className="btn-secondary mt-6 inline-flex">{t(locale, 'test_back_home')}</a>
        </div>
      </div>
    );
  }

  // Running
  const q = state.questions[state.idx];
  const text = locale === 'uz' ? q.uz : q.ru;
  const remaining = state.total - state.answeredIds.length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-box">
          <div className="text-xs text-gray-500">{t(locale, 'test_correct')}</div>
          <div className="text-2xl font-bold text-emerald-600">{state.correct}</div>
        </div>
        <div className="stat-box">
          <div className="text-xs text-gray-500">{t(locale, 'test_incorrect')}</div>
          <div className="text-2xl font-bold text-red-600">{state.incorrect}</div>
        </div>
        <div className="stat-box">
          <div className="text-xs text-gray-500">{t(locale, 'test_remaining')}</div>
          <div className="text-2xl font-bold text-lume-navy">{remaining}</div>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>
            {t(locale, 'test_question')} {state.idx + 1} {t(locale, 'test_of')} {state.total}
          </span>
          <span>{Math.round(((state.idx) / state.total) * 100)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-lume-navy transition-all"
            style={{ width: `${Math.min(100, (state.idx / state.total) * 100)}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="card p-5">
        {q.shot && (
          <figure className="shot-frame mb-4">
            <img src={`/${q.shot}`} alt={t(locale, 'test_view_screenshot')} loading="lazy" />
          </figure>
        )}
        <h2 className="text-lg font-semibold text-lume-navy leading-snug">{text.q}</h2>

        <div className="mt-4 grid gap-2">
          {text.opts.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = revealed?.correctIndex === i;
            const isWrong = revealed && isSelected && !revealed.isCorrect && i !== revealed.correctIndex;
            const cls = revealed
              ? isCorrect
                ? 'question-option question-option-correct'
                : isWrong
                ? 'question-option question-option-wrong'
                : 'question-option question-option-default opacity-60'
              : isSelected
              ? 'question-option question-option-selected'
              : 'question-option question-option-default';
            return (
              <button
                key={i}
                disabled={!!revealed}
                onClick={() => setSelected(i)}
                className={cls}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          {!revealed && (
            <button onClick={submitAnswer} disabled={selected === null || submitting} className="btn-primary">
              {submitting ? t(locale, 'common_loading') : t(locale, 'test_submit_answer')}
            </button>
          )}
          {revealed && (
            <button onClick={next} className="btn-primary">
              {state.idx + 1 >= state.total ? t(locale, 'test_finish') : t(locale, 'test_next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
