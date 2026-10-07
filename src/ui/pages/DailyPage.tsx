import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { scriptById, scriptAnswerCount, patternById } from '../../content/browser.ts';
import { phraseFrame } from '../../content/phraseFrames.ts';
import { todayHere } from '../../core/progress/days.ts';
import { GOAL_LABELS, type DailyRun, type DailyRunInput } from '../../core/progress/daily.ts';
import { secondsPerAnswer } from '../../core/progress/session.ts';
import { newWriteId } from '../../services/api/outbox.ts';
import { useApp } from '../../state/AppState.tsx';
import { chooseDailyScript, dailyListening, dailyPhrases, dailyReview, phraseRecall } from '../dailyBuilder.ts';
import { AudioButton, Card, Meter } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';
import { Icon } from '../components/icons.tsx';
import { inferredPracticeLevel, LearningPreferences } from '../components/LearningPreferences.tsx';
import { PracticalProgress } from '../components/PracticalProgress.tsx';
import { ScenarioPlayer } from '../components/ScenarioPlayer.tsx';
import { SpeakCheck } from '../components/Speaking.tsx';
import { ShadowRecorder } from '../components/ShadowRecorder.tsx';
import type { UiKey } from '../../i18n.ts';

const STAGES: UiKey[] = ['dailyLearn', 'dailyReview', 'dailyRecall', 'dailyConversation', 'dailyListen'];

/** Learner handover remounts the plan; another person's open round cannot follow. */
export function DailyPage() {
  const { studyingAs } = useApp();
  return <DailyPractice key={studyingAs} />;
}

function DailyPractice() {
  const { t, say, lang, profile, lessons, reviewItems, mistakes, scenarioRuns, dailyRuns, stats,
    recordDailyRun, recordScenarioRun, tts } = useApp();
  const day = todayHere();
  const goal = profile.learningGoal ?? 'everyday';
  const level = profile.practiceLevel ?? inferredPracticeLevel(lessons);
  const script = chooseDailyScript(goal, level, scenarioRuns, day);
  const saved = dailyRuns.find(run => run.day === day && run.stage < 5 && scriptById(run.scriptId));
  const finished = dailyRuns.find(run => run.day === day && run.stage === 5);
  const [run, setRun] = useState<DailyRunInput | null>(null);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [listeningSummary, setListeningSummary] = useState<PlayerSummary | null>(null);
  const busyRef = useRef(false);
  const retryRef = useRef<(() => Promise<void>) | null>(null);
  const currentScript = run ? scriptById(run.scriptId)! : script;
  const phrases = dailyPhrases(currentScript, lang);
  const review = useMemo(() => dailyReview(reviewItems, mistakes, currentScript.level, lang,
    Math.max(2, Math.min(6, Math.round(profile.dailyTargetMinutes / 3)))),
  // Frozen at the beginning of a run: due dates move with every answer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [run?.id, currentScript.id, lang, profile.dailyTargetMinutes]);
  const recall = phraseRecall(currentScript, lang);
  const listening = dailyListening(currentScript, lang);
  const estimate = Math.max(5, Math.ceil((scriptAnswerCount(currentScript, lang) + recall.length + review.length + listening.length)
    * secondsPerAnswer(stats).seconds / 60 + 2));

  useEffect(() => () => tts.cancel(), [tts]);
  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('.daily-page h1');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }, [run?.stage, paused]);

  async function persist(next: DailyRunInput) {
    await recordDailyRun(next);
    setRun(next);
  }
  async function change(work: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setProblem(false);
    try { await work(); retryRef.current = null; } catch { setProblem(true); retryRef.current = work; }
    finally { setBusy(false); busyRef.current = false; }
  }
  function start(prior?: DailyRun) {
    void change(async () => {
      const next: DailyRunInput = prior ?? { id: newWriteId(), day, scriptId: script.id, goal,
        stage: 0, total: 0, firstTryCorrect: 0, listeningCompleted: false };
      await persist(next);
      setPaused(false);
      setCardIndex(0);
      setListeningSummary(null);
    });
  }
  function advance(stage: number, summary?: PlayerSummary, listened = false) {
    if (!run) return;
    let conversationSaved = false;
    void change(async () => {
      if (run.stage === 3 && summary && !conversationSaved) {
        await recordScenarioRun(currentScript.id, summary.total, summary.firstTryCorrect);
        conversationSaved = true;
      }
      await persist({ ...run, stage, total: run.total + (summary?.total ?? 0),
        firstTryCorrect: run.firstTryCorrect + (summary?.firstTryCorrect ?? 0),
        listeningCompleted: run.listeningCompleted || listened });
      setListeningSummary(null);
      setCardIndex(0);
    });
  }

  const notice = problem ? <div className="task__warn" role="alert"><p>{t('dailySaveFailed')}</p>
    <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => { if (retryRef.current) void change(retryRef.current); }}>{t('retry')}</button></div> : null;
  if (run?.stage === 5) return <div className="page daily-page">
    <section className="daily-finished" aria-labelledby="daily-title"><span className="daily-finished__mark" aria-hidden="true"><Icon name="check" size={30} /></span>
      <p className="section-eyebrow">{t('dailyFinishedEyebrow')}</p><h1 id="daily-title">{t('dailyFinished')}</h1>
      <p>{t('exerciseScore', { correct: run.firstTryCorrect, total: run.total })}</p>
      <p className="daily-finished__ability">{say(currentScript.goal)}</p>
      <p className="muted">{t('dailyFinishedNote')}</p>
      <div className="section-nav"><Link className="btn btn--primary" to="/">{t('navToday')}</Link>
        <button type="button" className="btn btn--ghost" onClick={() => { setRun(null); setPaused(false); }}>{t('dailyAnother')}</button></div>
    </section><PracticalProgress /></div>;

  if (!run || paused) return <div className="page daily-page">
    <header className="daily-intro"><p className="section-eyebrow">{t('dailyEyebrow')}</p>
      <h1 className="page__title">{t('dailyTitle')}</h1><p className="page__lede">{t('dailyLede')}</p></header>
    <section className="daily-plan" aria-labelledby="daily-plan-title">
      <div className="daily-plan__copy"><span className="daily-plan__tag">{say(GOAL_LABELS[run?.goal ?? saved?.goal ?? goal])} · {(run ? currentScript : saved ? scriptById(saved.scriptId)! : script).level.toUpperCase()}</span>
        <h2 id="daily-plan-title">{say((run ? currentScript : saved ? scriptById(saved.scriptId)! : script).goal)}</h2>
        <p>{t('dailyPlanNote')}</p>
        <button type="button" className="btn daily-plan__start" disabled={busy}
          onClick={() => paused ? setPaused(false) : start(saved)}>
          {t(busy ? 'loading' : run || saved ? 'dailyResume' : 'dailyStart')}<Icon name="arrow" size={20} /></button>
        <p className="daily-plan__estimate">{t('dailyEstimate', { n: estimate })}</p>
      </div><ol className="daily-plan__steps">{STAGES.map((key, index) => <li key={key}>
        <span>{String(index + 1).padStart(2, '0')}</span><strong>{t(key)}</strong></li>)}</ol>
    </section>{notice}
    {finished && !saved && !run ? <p className="daily-already"><Icon name="check" size={18} />{t('dailyAlreadyDone')}</p> : null}
    <details className="daily-settings"><summary>{t('dailyPersonalise')}</summary><LearningPreferences /></details>
    <PracticalProgress />
    <Link className="daily-targeted-link" to="/session">{t('dailyOnlyReview')}<Icon name="arrow" size={18} /></Link>
  </div>;

  const stageLabel = STAGES[run.stage]!;
  const card = phrases[cardIndex];
  const frame = card ? phraseFrame(card.german) : undefined;
  return <div className="page page--player daily-page" data-study-active="true">
    <header className="daily-running-head"><div><p className="section-eyebrow">{t('dailyTitle')}</p>
      <h1 className="page__title">{t(stageLabel)}</h1></div>
      <button type="button" className="btn btn--ghost btn--sm" disabled={busy} onClick={() => { tts.cancel(); setPaused(true); }}>{t('dailyPause')}</button></header>
    <ol className="daily-stage-track" aria-label={t('dailyPlanProgress')}>{STAGES.map((key, index) =>
      <li key={key} className={index < run.stage ? 'is-done' : index === run.stage ? 'is-current' : ''}
        aria-current={index === run.stage ? 'step' : undefined}><span>{index < run.stage ? <Icon name="check" size={14} /> : index + 1}</span><span>{t(key)}</span></li>)}</ol>
    {notice}
    {run.stage === 0 && card ? <Card title={t('dailyPhraseCount', { n: cardIndex + 1, total: phrases.length })}>
      <div className="phrase-card"><p className="phrase-card__purpose">{say(card.purpose)}</p>
        <p className="phrase-card__german" lang="de">{card.german}</p>
        <div className="phrase-card__audio"><AudioButton text={card.german} /><AudioButton text={card.german} slow /></div>
        {frame ? <div className="phrase-frame"><p className="phrase-card__pattern"><span>{t('dailyBuildingBlock')}</span><strong lang="de">{frame.template}</strong></p>
          <p className="muted">{t('dailySwapNote')}</p>{frame.examples.map(example => <p className="phrase-frame__example" key={example.de}>
            <span lang="de">{example.de}</span><span>{say(example.gloss)}</span><AudioButton text={example.de} compact /></p>)}</div> : null}
        {!frame ? (card.step.reviewTargets ?? []).map(id => patternById(id)).filter(Boolean).map(pattern =>
          <p className="phrase-card__pattern" key={pattern!.id}><span>{t('dailyBuildingBlock')}</span><strong lang="de">{pattern!.template}</strong></p>) : null}
        {card.words.filter(word => word.wordType === 'noun').map(word => <p className="phrase-card__noun" key={word.id}>
          <span lang="de">{word.display}{word.plural ? ` → ${word.plural}` : ''}</span><span>{say(word.translation)}</span></p>)}
        <p className="muted">{t('dailyPhraseTip')}</p><SpeakCheck target={card.german} spec={card.step.answer} />
      </div><div className="section-nav"><button type="button" className="btn btn--primary" disabled={busy}
        onClick={() => cardIndex + 1 < phrases.length ? setCardIndex(cardIndex + 1) : advance(review.length > 0 ? 1 : 2)}>
        {t(cardIndex + 1 < phrases.length ? 'dailyNextPhrase' : 'dailyPutToUse')}</button></div>
    </Card> : null}
    {run.stage === 1 ? review.length > 0 ? <ExercisePlayer key={`${run.id}-review`} exercises={review} context="review"
      level={currentScript.level} onFinish={summary => advance(2, summary)} /> : <Card title={t('dailyReviewClear')}>
        <p>{t('dailyReviewClearNote')}</p><button type="button" className="btn btn--primary" disabled={busy} onClick={() => advance(2)}>{t('exerciseContinue')}</button></Card> : null}
    {run.stage === 2 ? <ExercisePlayer key={`${run.id}-recall`} exercises={recall} context="practice" level={currentScript.level}
      onFinish={summary => advance(3, summary)} /> : null}
    {run.stage === 3 ? <><p className="daily-stage-note">{t('dailyConversationNote')}</p>
      <ScenarioPlayer key={`${run.id}-conversation`} script={currentScript} onExit={() => setPaused(true)} onFinish={summary => advance(4, summary)} /></> : null}
    {run.stage === 4 && tts.available && !listeningSummary ? <ExercisePlayer key={`${run.id}-listen`} exercises={listening}
      context="practice" level={currentScript.level} onFinish={setListeningSummary} /> : null}
    {run.stage === 4 && (!tts.available || listeningSummary) ? <Card title={t('dailyShadowTitle')}>
      <p>{t(tts.available ? 'dailyShadowNote' : 'dailyAudioUnavailable')}</p>
      <div className="shadow-lines">{phrases.slice(0, 2).map(phrase => <div key={phrase.step.id}>
        <p lang="de">{phrase.german}</p><div className="phrase-card__audio"><AudioButton text={phrase.german} /><AudioButton text={phrase.german} slow /></div>
        <SpeakCheck target={phrase.german} spec={phrase.step.answer} /></div>)}</div>
      <p className="muted">{t('dailyShadowNoScore')}</p>
      <ShadowRecorder />
      <button type="button" className="btn btn--primary" disabled={busy} onClick={() => advance(5, listeningSummary ?? undefined, Boolean(listeningSummary))}>{t('dailyFinish')}</button>
    </Card> : null}
    <Meter value={run.stage / 5} label={t('dailyPlanProgress')} />
  </div>;
}
