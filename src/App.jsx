import { useEffect, useState } from 'react';
import { WEEKS, ALL_QUESTIONS } from './data/questions.js';
import { buildWeekTest, buildMixedTest } from './lib/shuffle.js';

const MIXED_COUNT = 15;
const LETTERS = 'ABCDEFGH';

export default function App() {
  const [view, setView] = useState({ name: 'home' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  if (view.name === 'quiz') {
    return <Quiz key={view.startedAt} test={view} onExit={() => setView({ name: 'home' })} />;
  }
  return <Home onStart={(t) => setView({ name: 'quiz', startedAt: Date.now(), ...t })} />;
}

function Home({ onStart }) {
  return (
    <main className="page">
      <header className="home-head">
        <h1>IIoT assignment practice</h1>
        <p className="lede">
          Introduction to Industry 4.0 and Industrial Internet of Things. Pick a week to take its
          assignment. Questions and options are shuffled on every attempt, and nothing is saved, so
          you can repeat a week as often as you like.
        </p>
      </header>

      <section aria-label="Weekly assignments" className="week-grid">
        {WEEKS.map((w) => (
          <button
            key={w.week}
            className="week-tile"
            onClick={() => onStart({ kind: 'week', week: w.week, title: `Week ${w.week}` })}
          >
            <span className="week-num">{String(w.week).padStart(2, '0')}</span>
            <span className="week-body">
              <span className="week-name">Week {w.week}</span>
              <span className="week-topic">{w.topic}</span>
              <span className="week-count">{w.questions.length} questions</span>
            </span>
          </button>
        ))}
      </section>

      <button
        className="mixed-tile"
        onClick={() => onStart({ kind: 'mixed', title: 'Mixed test' })}
      >
        <span className="mixed-title">Mixed test</span>
        <span className="mixed-desc">
          {MIXED_COUNT} random questions drawn from all {ALL_QUESTIONS.length} across the 12 weeks.
          A different set every time.
        </span>
      </button>
    </main>
  );
}

function Quiz({ test, onExit }) {
  const make = () => (test.kind === 'week' ? buildWeekTest(test.week) : buildMixedTest(MIXED_COUNT));
  const [items, setItems] = useState(make);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  const total = items.length;
  const answered = Object.keys(answers).length;
  const correct = items.filter((q) => answers[q.id] === q.answer).length;
  const skipped = total - answered;
  const wrong = answered - correct;
  const firstUnanswered = items.find((q) => answers[q.id] === undefined);

  const pick = (qid, orig) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: orig }));
    setConfirming(false);
  };

  const submit = () => {
    if (skipped > 0 && !confirming) {
      setConfirming(true);
      return;
    }
    setSubmitted(true);
    setConfirming(false);
    window.scrollTo({ top: 0 });
  };

  const retake = () => {
    setItems(make());
    setAnswers({});
    setSubmitted(false);
    setConfirming(false);
    setOnlyMistakes(false);
    window.scrollTo({ top: 0 });
  };

  const jumpTo = (q) => {
    document.getElementById(`q-${q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const visible = submitted && onlyMistakes ? items.filter((q) => answers[q.id] !== q.answer) : items;
  const pct = Math.round((correct / total) * 100);

  return (
    <div className="quiz">
      <header className="quiz-bar">
        <div className="quiz-bar-inner">
          <button className="link-btn" onClick={onExit}>
            All weeks
          </button>
          <h1 className="quiz-title">{test.title}</h1>
          <span className="quiz-progress" aria-live="polite">
            {submitted ? `Score ${correct} / ${total}` : `${answered} / ${total} answered`}
          </span>
        </div>
        {!submitted && (
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${(answered / total) * 100}%` }} />
          </div>
        )}
      </header>

      <main className="page quiz-page">
        {submitted && (
          <section className="result" aria-label="Your result">
            <div className="result-score">
              <span className="score-big">
                {correct}
                <span className="score-of">/{total}</span>
              </span>
              <span className="score-pct">{pct}%</span>
            </div>
            <p className="result-breakdown">
              {correct} correct, {wrong} wrong{skipped > 0 ? `, ${skipped} not answered` : ''}.
              Correct answers are marked in green below.
            </p>
            <div className="result-actions">
              <button className="btn primary" onClick={retake}>
                Retake with new shuffle
              </button>
              <button className="btn" onClick={onExit}>
                Back to all weeks
              </button>
              {correct < total && (
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={onlyMistakes}
                    onChange={(e) => setOnlyMistakes(e.target.checked)}
                  />
                  Show only questions I missed
                </label>
              )}
            </div>
          </section>
        )}

        <div className="questions">
          {visible.map((q) => {
            const n = items.indexOf(q) + 1;
            const picked = answers[q.id];
            const status = !submitted
              ? ''
              : picked === undefined
                ? 'skipped'
                : picked === q.answer
                  ? 'right'
                  : 'missed';
            return (
              <article key={q.id} id={`q-${q.id}`} className={`question ${status}`}>
                <div className="q-head">
                  <span className="q-num">Question {n}</span>
                  {test.kind === 'mixed' && <span className="q-week">Week {q.week}</span>}
                  {status === 'skipped' && <span className="q-flag">Not answered</span>}
                </div>
                <p className="q-text" id={`qt-${q.id}`}>
                  {q.q}
                </p>
                <div className="options" role="radiogroup" aria-labelledby={`qt-${q.id}`}>
                  {q.shuffled.map((o, i) => {
                    const isPicked = picked === o.orig;
                    const isAnswer = o.orig === q.answer;
                    let cls = 'opt';
                    if (isPicked) cls += ' picked';
                    if (submitted && isAnswer) cls += ' correct';
                    if (submitted && isPicked && !isAnswer) cls += ' wrong';
                    return (
                      <label key={o.orig} className={cls}>
                        <input
                          type="radio"
                          name={q.id}
                          checked={isPicked}
                          disabled={submitted}
                          onChange={() => pick(q.id, o.orig)}
                        />
                        <span className="opt-letter" aria-hidden="true">
                          {LETTERS[i]}
                        </span>
                        <span className="opt-text">{o.text}</span>
                        {submitted && isAnswer && <span className="opt-tag">Correct answer</span>}
                        {submitted && isPicked && !isAnswer && (
                          <span className="opt-tag">Your answer</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        {!submitted && (
          <footer className="submit-zone">
            {confirming && firstUnanswered && (
              <div className="warn" role="alert">
                <p>
                  {skipped} {skipped === 1 ? 'question is' : 'questions are'} not answered yet.
                  Unanswered questions count as wrong.
                </p>
                <button className="link-btn" onClick={() => jumpTo(firstUnanswered)}>
                  Go to first unanswered
                </button>
              </div>
            )}
            <button className="btn primary big" onClick={submit}>
              {confirming ? 'Submit anyway' : 'Submit test'}
            </button>
          </footer>
        )}

        {submitted && (
          <div className="end-actions">
            <button className="btn primary" onClick={retake}>
              Retake with new shuffle
            </button>
            <button className="btn" onClick={onExit}>
              Back to all weeks
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
