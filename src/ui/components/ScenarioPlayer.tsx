import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ScenarioBeat, ScenarioScript, TeachingLanguage } from '../../content/types.ts';
import { useApp } from '../../state/AppState.tsx';
import { AudioButton } from './bits.tsx';
import { ExercisePlayer, type PlayerSummary } from './ExercisePlayer.tsx';

/**
 * Plays one scenario script.
 *
 * Two decisions are worth stating, because both of them are about honesty
 * rather than about React:
 *
 * 1. **The other person's German arrives without a translation.** You get the
 *    line, you get a button that plays it, and the meaning is one press away.
 *    In the room there is no subtitle, and a conversation mode that shows one
 *    by default is practising reading while calling itself listening. The
 *    transcript above reveals every line you have already answered, so nothing
 *    stays hidden once you are past it.
 *
 * 2. **Your turn is an ordinary exercise, played by the ordinary player.**
 *    Same validator, same hints, same mandatory retype. A scenario cannot mark
 *    an answer more kindly than a lesson would, because it is not marking it.
 */

interface Segment {
  /** What is said or happens before you speak. */
  lead: ScenarioBeat[];
  /** Your turn, if this segment has one. The last segment may not. */
  turn?: Extract<ScenarioBeat, { who: 'you' }>;
}

function visible(beat: ScenarioBeat, lang: TeachingLanguage): boolean {
  if (beat.who === 'you') return !beat.exercise.only || beat.exercise.only.includes(lang);
  return !beat.only || beat.only.includes(lang);
}

/**
 * Group the beats so that everything said before your turn arrives with it.
 *
 * Otherwise a learner presses "continue" through three lines of somebody
 * else's speech before being allowed to answer, which is not how being spoken
 * to works.
 */
export function segmentsOf(script: ScenarioScript, lang: TeachingLanguage): Segment[] {
  const segments: Segment[] = [];
  let lead: ScenarioBeat[] = [];
  for (const beat of script.beats) {
    if (!visible(beat, lang)) continue;
    if (beat.who === 'you') {
      segments.push({ lead, turn: beat });
      lead = [];
    } else {
      lead.push(beat);
    }
  }
  if (lead.length > 0) segments.push({ lead });
  return segments;
}

interface Said {
  /** Index of the segment this belongs to. */
  segment: number;
  text: string;
}

export interface ScenarioPlayerProps {
  script: ScenarioScript;
  onFinish: (summary: PlayerSummary) => void;
  onExit: () => void;
}

export function ScenarioPlayer({ script, onFinish, onExit }: ScenarioPlayerProps) {
  const { lang, say, t, tts } = useApp();
  const segments = useMemo(() => segmentsOf(script, lang), [script, lang]);

  const [cursor, setCursor] = useState(0);
  const [said, setSaid] = useState<Said[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  /** The partner's newest line, for a screen reader. */
  const [heard, setHeard] = useState('');
  const liveRef = useRef<HTMLDivElement | null>(null);

  const current = segments[cursor];

  // Speak the other person's line as it arrives. You are being talked to.
  useEffect(() => {
    if (!current) return;
    const spoken = current.lead.filter((beat) => beat.who === 'them');
    const last = spoken[spoken.length - 1];
    if (last && last.who === 'them') tts.speak(last.de);
    /*
     * And say it to a screen reader. The new line used to arrive in a fresh
     * node with nothing listening for it, so a blind learner had to go and
     * look for what had been said. The region below stays mounted and only
     * its text changes, which is what gets announced.
     */
    setHeard('');
    const lines = spoken.map((beat) => (beat.who === 'them' ? beat.de : '')).join(' ');
    const timer = window.setTimeout(() => setHeard(lines), 50);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  useEffect(() => {
    liveRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [cursor]);

  const toggleReveal = useCallback((key: string) => {
    setRevealed((open) => {
      const next = new Set(open);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const finishSegment = useCallback(
    (summary: PlayerSummary) => {
      const nextCorrect = firstTryCorrect + summary.firstTryCorrect;
      const nextAnswered = answered + summary.total;
      setFirstTryCorrect(nextCorrect);
      setAnswered(nextAnswered);
      if (cursor + 1 >= segments.length) {
        onFinish({
          total: nextAnswered,
          firstTryCorrect: nextCorrect,
          accuracy: nextAnswered > 0 ? nextCorrect / nextAnswered : 0,
        });
        return;
      }
      setCursor((index) => index + 1);
    },
    [cursor, segments.length, firstTryCorrect, answered, onFinish],
  );

  if (!current) return null;

  const renderLead = (beats: ScenarioBeat[], segmentIndex: number, past: boolean) =>
    beats.map((beat, index) => {
      const key = `${segmentIndex}-${index}`;
      if (beat.who === 'narrator') {
        return (
          <p key={key} className="chat__stage">
            {say(beat.text)}
          </p>
        );
      }
      if (beat.who !== 'them') return null;
      const open = past || revealed.has(key);
      return (
        <div key={key} className="chat__turn chat__turn--them">
          <p className="chat__who">{say(script.partner)}</p>
          <div className="chat__bubble">
            <p className="chat__de" lang="de">
              {beat.de}
            </p>
            <div className="chat__tools">
              <AudioButton text={beat.de} compact />
              {!past ? (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  aria-expanded={open}
                  onClick={() => toggleReveal(key)}
                >
                  {t('scenarioMeaning')}
                </button>
              ) : null}
            </div>
            {open ? <p className="chat__gloss">{say(beat.gloss)}</p> : null}
            {open && beat.note ? <p className="chat__note">{say(beat.note)}</p> : null}
          </div>
        </div>
      );
    });

  return (
    <div className="scenario">
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true" lang="de">
        {heard}
      </p>
      <header className="scenario__head">
        <div>
          <p className="scenario__progress">
            {t('exerciseProgress', { done: Math.min(cursor + 1, segments.length), total: segments.length })}
          </p>
          <p className="scenario__goal">{say(script.goal)}</p>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onExit}>
          {t('scenarioLeave')}
        </button>
      </header>

      <div className="chat">
        {segments.slice(0, cursor).map((segment, index) => (
          <div key={index} className="chat__past">
            {renderLead(segment.lead, index, true)}
            {segment.turn ? (
              <div className="chat__turn chat__turn--you">
                <p className="chat__who">{t('scenarioYou')}</p>
                <div className="chat__bubble chat__bubble--you">
                  {said
                    .filter((entry) => entry.segment === index)
                    .map((entry, position) => (
                      <p key={position} className="chat__de" lang="de">
                        {entry.text}
                      </p>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}

        <div ref={liveRef} className="chat__live">
          {renderLead(current.lead, cursor, false)}
        </div>
      </div>

      {current.turn ? (
        <ExercisePlayer
          key={current.turn.exercise.id}
          exercises={[current.turn.exercise]}
          context="scenario"
          level={script.level}
          hideProgress
          // The one place the microphone can answer rather than only rehearse.
          allowSpeaking
          onStepDone={({ given }) => setSaid((entries) => [...entries, { segment: cursor, text: given }])}
          onFinish={finishSegment}
        />
      ) : (
        <button
          type="button"
          className="btn btn--primary"
          autoFocus
          onClick={() => finishSegment({ total: 0, firstTryCorrect: 0, accuracy: 0 })}
        >
          {t('exerciseContinue')}
        </button>
      )}
    </div>
  );
}
