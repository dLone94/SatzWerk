import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkpointById, scriptById, scriptAnswerCount, patternById } from '../../content/browser.ts';
import { otherExamples, phraseFrame } from '../../content/phraseFrames.ts';
import { todayHere } from '../../core/progress/days.ts';
import { GOAL_LABELS, type DailyRunInput } from '../../core/progress/daily.ts';
import { secondsPerAnswer } from '../../core/progress/session.ts';
import { newWriteId } from '../../services/api/outbox.ts';
import { useApp } from '../../state/AppState.tsx';
import { chooseDailyScript, dailyListening, dailyPhrases, dailyReview, fitsGoal, goalScripts, phraseRecall } from '../dailyBuilder.ts';
import { AudioButton, Card, Meter } from '../components/bits.tsx';
import { ExercisePlayer, type PlayerSummary } from '../components/ExercisePlayer.tsx';
import { Icon } from '../components/icons.tsx';
import { inferredPracticeLevel, LearningPreferences } from '../components/LearningPreferences.tsx';
import { ReminderInvite } from '../components/ReminderInvite.tsx';
import { PracticalProgress } from '../components/PracticalProgress.tsx';
import { ScenarioPlayer } from '../components/ScenarioPlayer.tsx';
import { SpeakCheck } from '../components/Speaking.tsx';
import { ShadowRecorder } from '../components/ShadowRecorder.tsx';
import { DackelMark, DackelScene } from '../components/Dackel.tsx';
import { GenderedGerman, NounDisplay, nounArticle } from '../components/Gender.tsx';
import { FinishTower } from '../components/FinishTower.tsx';
import { Rhythm } from '../components/Rhythm.tsx';
import { reviewItemsForPath } from '../reviewBuilder.ts';
import { DAILY_STAGES, fitsDailyPlan, todayStep, type TodayStep } from '../selectors.ts';

// Shared with Today, which names the part a practice reached.
const STAGES = DAILY_STAGES;

/** Learner handover remounts the plan; another person's open round cannot follow. */
export function DailyPage() {
  const { studyingAs } = useApp();
  return <DailyPractice key={studyingAs} />;
}

function DailyPractice() {
  const { t, say, lang, profile, lessons, reviewItems, mistakes, scenarioRuns, dailyRuns, stats, studyDays,
    recordDailyRun, recordScenarioRun, tts, checkpointResults } = useApp();
  const day = todayHere();
  const goal = profile.learningGoal ?? 'everyday';
  const level = profile.practiceLevel ?? inferredPracticeLevel(lessons, checkpointResults);
  const script = chooseDailyScript(goal, level, scenarioRuns, day);
  const finished = dailyRuns.find(run => run.day === day && run.stage === 5);
  const [run, setRun] = useState<DailyRunInput | null>(null);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [listeningSummary, setListeningSummary] = useState<PlayerSummary | null>(null);
  const busyRef = useRef(false);
  const retryRef = useRef<(() => Promise<void>) | null>(null);
  /*
   * A goal or level chosen since a round began is a new plan. Choosing one
   * used to change nothing: the card went on showing the open round, offered
   * only to continue it, and estimated the time of the new plan instead. The
   * new plan now comes first, and the open round stays one tap away, unless
   * the new plan is the very conversation already under way. A level the app
   * only inferred from the lessons was never chosen, so opening a lesson of
   * the next level does not set aside the round under way.
   */
  // Shared with Today, so its "Continue your practice" means the round offered here.
  const fitsPlan = (round: DailyRunInput) => fitsDailyPlan(round, script.id, goal, profile.practiceLevel);
  // Today's unfinished rounds, the one in hand first. Switching to a new plan
  // and back leaves two of them, and the one that fits the plan is the one to
  // continue: the latest alone would start that plan over and strand its parts.
  const openToday = [...(run && run.stage < 5 ? [run] : []), ...dailyRuns.filter(round =>
    round.id !== run?.id && round.day === day && round.stage < 5 && scriptById(round.scriptId))];
  const fitting = openToday.find(fitsPlan);
  // With none that fits, the plan card starts a new round and keeps the latest one tap away.
  const earlier = fitting ? undefined : openToday[0];
  // What the plan card offers. Also what follows a finished round: a beginner
  // has a single conversation, and "Try another practice" brought back the same one.
  const planScript = fitting ? scriptById(fitting.scriptId)! : script;
  // The script on screen: the round being played, or the plan card's.
  const currentScript = run && !paused ? scriptById(run.scriptId)! : planScript;
  // Which lines are new depends on what is in review, and answering today's
  // recall puts them there. Counting only what was met before today keeps the
  // same cards through the whole day: a round reopened after a reload listens
  // to the phrases it began with. Reviewing a met phrase today changes when it
  // was last reviewed but not whether it was met, and the cards ask no more.
  const metBefore = reviewItems.filter(item => {
    const at = new Date(item.createdAt);
    return !Number.isNaN(at.getTime()) && todayHere(at) < day;
  });
  const metKey = metBefore.map(item => item.refId).sort().join(' ');
  const phrases = useMemo(() => dailyPhrases(currentScript, lang, metBefore, day),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [currentScript.id, lang, day, metKey]);
  /*
   * The review part is the same size whatever the daily goal. It used to be a
   * third of the goal in items, so everybody on the old default of 20 minutes
   * had six; moving the default to 10 would have cut a new learner's practice
   * to three and left it further from the goal it was meant to bring closer.
   * The goal counts the minutes; the practice is the day's one practice.
   */
  const review = useMemo(() => dailyReview(reviewItems, mistakes, currentScript.level, lang),
  // Frozen at the beginning of a run: due dates move with every answer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [run?.id, currentScript.id, lang]);
  const recall = phraseRecall(currentScript, lang, phrases);
  const listening = dailyListening(currentScript, lang, phrases);
  const estimate = Math.max(5, Math.ceil((scriptAnswerCount(currentScript, lang) + recall.length + review.length + listening.length)
    * secondsPerAnswer(stats).seconds / 60 + 2));

  useEffect(() => () => tts.cancel(), [tts]);
  /*
   * Each part, and the finish, starts at the top of the page. They swap in
   * place under the same address, so the page kept the scroll of the part
   * before: Finish sits under a long card on a phone, and the celebration
   * opened with its picture and tick above the screen. A layout effect, so it
   * runs before the conversation scrolls its first line into view. Not on
   * arrival: the route has already been put at the top.
   */
  const arrived = useRef(false);
  useLayoutEffect(() => {
    if (!arrived.current) {
      arrived.current = true;
      return;
    }
    window.scrollTo(0, 0);
  }, [run?.stage, paused]);
  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('.daily-page h1');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }, [run?.stage, paused]);
  // "Next phrase" swaps the card in place; its title says which phrase is now on it.
  const phraseTitle = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => { if (cardIndex > 0) phraseTitle.current?.focus(); }, [cardIndex]);

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
  function start(prior?: DailyRunInput) {
    void change(async () => {
      const next: DailyRunInput = prior ?? { id: newWriteId(), day, scriptId: script.id, goal,
        stage: 0, total: 0, firstTryCorrect: 0, listeningCompleted: false };
      await persist(next);
      setPaused(false);
      setCardIndex(0);
      setListeningSummary(null);
    });
  }
  function resume(round: DailyRunInput) {
    if (round.id === run?.id) setPaused(false);
    else start(round);
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

  /*
   * The finish's next step, worked out once as it opens. Its minutes and its
   * runs can still arrive after it (time studied while reading it, a server
   * answer), and the one button changing from "Start the lesson" to "Today"
   * as the learner reached for it was worse than either.
   */
  const settled = useRef<{ id: string; step: TodayStep } | null>(null);

  const notice = problem ? <div className="task__warn" role="alert"><p>{t('dailySaveFailed')}</p>
    <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => { if (retryRef.current) void change(retryRef.current); }}>{t('retry')}</button></div> : null;
  /*
   * The finish celebrates what was really done, and only that: the phrases
   * met on the cards, the answers right first time, the streak once there is
   * one, and the day's goal and week as Today counts them, with today's dot
   * filling in. Then the one next step Today would now offer, worked out the
   * same way from the same rows, so the two never send the learner to
   * different places. Doing it again is still offered, quietly.
   */
  if (run?.stage === 5) {
    if (settled.current?.id !== run.id) {
      const minutesToday = Math.floor((studyDays.find(entry => entry.day === day)?.secondsActive ?? 0) / 60);
      settled.current = { id: run.id, step: todayStep({ lessons, reviewItems: reviewItemsForPath(reviewItems, lang), mistakes,
        onboarded: profile.onboarded, checkpointResults, dailyRuns, minutesToday, targetMinutes: profile.dailyTargetMinutes,
        fitsPlan }) };
    }
    const next = settled.current.step;
    // A phrase met in a practice finished earlier today is not new a second
    // time: "Practise it again" used to claim the same three new phrases.
    const earlierToday = new Set(dailyRuns.filter(round => round.day === day && round.stage >= 5 && round.id !== run.id)
      .flatMap(round => { const played = scriptById(round.scriptId); return played ? dailyPhrases(played, lang, metBefore, day) : []; })
      .map(card => card.german));
    const freshCards = phrases.filter(card => !card.again && !earlierToday.has(card.german));
    const fresh = freshCards.length;
    const again = phrases.length - fresh;
    // The words of the phrases met for the first time today: the tower's blocks.
    const newWords = freshCards.flatMap(card => card.words).map(entry => ({ display: entry.display, article: nounArticle(entry) }));
    const onward = nextOffer(next);
    // Once the day is done, the course's next step is still offered, quietly,
    // as Today offers it: the finish used to hide it behind a tap on Today.
    const more = next.kind === 'done' && next.then === 'course'
      ? nextOffer({ ...next, kind: next.course.kind as TodayStep['kind'], to: next.course.to })
      : undefined;
    return <div className="page daily-page">
      <section className="daily-finished" aria-labelledby="daily-title">
        <FinishTower words={newWords} className="daily-finished__tower"
          fallback={<DackelScene className="daily-finished__scene" bubble="Geschafft!" />} />
        <span className="daily-finished__mark" aria-hidden="true"><Icon name="check" size={30} /></span>
        <p className="section-eyebrow">{t('dailyFinishedEyebrow')}</p><h1 id="daily-title">{t('dailyFinished')}</h1>
        <p className="daily-finished__ability">{say(currentScript.goal)}</p>
        <ul className="daily-finished__wins" aria-label={t('dailyWinsTitle')}>
          {fresh > 0 ? <li><Icon name="check" size={16} />{t('dailyWinNewPhrases', { n: fresh })}</li> : null}
          {again > 0 ? <li><Icon name="check" size={16} />{t('dailyWinPhrasesAgain', { n: again })}</li> : null}
          {run.total > 0 ? <li><Icon name="check" size={16} />{t('exerciseScore', { correct: run.firstTryCorrect, total: run.total })}</li> : null}
          {/* A streak of one is only today, which everything here already says. */}
          {stats.streak > 1 ? <li><Icon name="flame" size={16} />{t('todayStreak', { n: stats.streak })}</li> : null}
        </ul>
        {/* What comes next straight after the wins: under the rhythm card it
            sat below the fold on a phone, and it is the one thing to tap. */}
        <div className="daily-finished__next">
          <p className="section-eyebrow">{t('dailyFinishedNext')}</p>
          {/* A day that is done says so, as Today will, before the way back to it. */}
          {next.kind === 'done' ? <p className="daily-finished__done">
            {`${t(next.goalMet ? 'todayDoneGoal' : 'todayDoneAll')}${next.then ? '' : ` ${t('todayDoneRest')}`}`}</p> : null}
          <Link className="btn btn--primary" to={onward.to}>{onward.label}<Icon name="arrow" size={20} /></Link>
          {onward.minutes ? <p className="daily-finished__time">{t('dashboardEstimate', { n: onward.minutes })}</p> : null}
          {more ? <p className="daily-finished__more"><span>{t('todayKeepGoing')}</span>
            <Link to={more.to}>{more.label}<Icon name="arrow" size={16} /></Link></p> : null}
          <button type="button" className="linklike daily-finished__again" onClick={() => { setRun(null); setPaused(false); }}>
            {t(planScript.id === currentScript.id ? 'dailyAgain' : 'dailyAnother')}</button>
        </div>
        <Rhythm celebrate />
        {phrases.length > 0 ? <div className="daily-finished__phrases">
          <h2 id="daily-phrases-title">{t('dailyPhrasesTitle')}</h2>
          <ul aria-labelledby="daily-phrases-title">{phrases.map(card => <li key={card.step.id}>
            <span><span className="daily-finished__german" lang="de">{card.german}</span>
              <span className="daily-finished__purpose">{say(card.purpose)}</span></span>
            <AudioButton text={card.german} compact /></li>)}</ul>
        </div> : null}
        <p className="muted">{t('dailyFinishedNote')}</p>
      </section><ReminderInvite /><PracticalProgress week={false} /></div>;
  }

  if (!run || paused) return <div className="page daily-page">
    <header className="daily-intro"><p className="section-eyebrow">{t('dailyEyebrow')}</p>
      <h1 className="page__title">{t('dailyTitle')}</h1><p className="page__lede">{t('dailyLede')}</p></header>
    <section className="daily-plan" aria-labelledby="daily-plan-title">
      <div className="daily-plan__copy"><span className="daily-plan__tag">{say(GOAL_LABELS[goal])} · {currentScript.level.toUpperCase()}</span>
        <h2 id="daily-plan-title">{say(currentScript.goal)}</h2>
        {/* A conversation from outside the goal says why; the tag alone hid that. */}
        {fitsGoal(currentScript, goal) ? null
          : <p>{t(goalScripts(goal, currentScript.level).length > 0 ? 'dailyGoalResting' : 'dailyGoalElsewhere')}</p>}
        <p>{t('dailyPlanNote')}</p>
        <button type="button" className="btn btn--primary daily-plan__start" disabled={busy}
          onClick={() => fitting ? resume(fitting) : start()}>
          {t(busy ? 'loading' : fitting ? 'dailyResume' : 'dailyStart')}<Icon name="arrow" size={20} /></button>
        <p className="daily-plan__estimate">{t('dailyEstimate', { n: estimate })}</p>
        {earlier ? <button type="button" className="btn btn--ghost daily-plan__earlier" disabled={busy} onClick={() => resume(earlier)}>
          {t('dailyResumeEarlier', { plan: `${say(GOAL_LABELS[earlier.goal])} · ${scriptById(earlier.scriptId)!.level.toUpperCase()}` })}</button> : null}
      </div><div className="daily-plan__world"><DackelScene />
        <p className="daily-plan__world-note">{t('playAdventureNote')}</p></div>
    </section>{notice}
    <ol className="daily-plan__steps">{STAGES.map((key, index) => <li key={key}>
      <span>{String(index + 1).padStart(2, '0')}</span><strong>{t(key)}</strong></li>)}</ol>
    {finished && openToday.length === 0 ? <p className="daily-already"><Icon name="check" size={18} />{t('dailyAlreadyDone')}</p> : null}
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
    {run.stage === 0 && card ? <Card title={t('dailyPhraseCount', { n: cardIndex + 1, total: phrases.length })} titleRef={phraseTitle}>
      <div className="phrase-card"><div className="phrase-card__buddy"><DackelMark /><span>{t('playSayIt')}</span>
        {card.again ? <span className="phrase-card__again">{t('dailyPhraseAgain')}</span> : null}</div>
        <p className="phrase-card__purpose">{say(card.purpose)}</p>
        <p className="phrase-card__german" lang="de"><GenderedGerman text={card.german} /></p>
        <div className="phrase-card__audio"><AudioButton text={card.german} /><AudioButton text={card.german} slow /></div>
        {frame ? <div className="phrase-frame"><p className="phrase-card__pattern"><span>{t('dailyBuildingBlock')}</span><strong lang="de">{frame.template}</strong></p>
          <p className="muted">{t('dailySwapNote')}</p>{otherExamples(frame, card.german).map(example => <p className="phrase-frame__example" key={example.de}>
            <span lang="de">{example.de}</span><span>{say(example.gloss)}</span><AudioButton text={example.de} compact /></p>)}</div> : null}
        {!frame ? (card.step.reviewTargets ?? []).map(id => patternById(id)).filter(Boolean).map(pattern =>
          <p className="phrase-card__pattern" key={pattern!.id}><span>{t('dailyBuildingBlock')}</span><strong lang="de">{pattern!.template}</strong></p>) : null}
        {card.words.filter(word => word.wordType === 'noun').map(word => <p className="phrase-card__noun" key={word.id}>
          <span lang="de"><NounDisplay entry={word} />{word.plural ? ` → ${word.plural}` : ''}</span><span>{say(word.translation)}</span></p>)}
        <p className="muted">{t('dailyPhraseTip')}</p><SpeakCheck target={card.german} spec={card.step.answer} />
      </div><div className="section-nav"><button type="button" className="btn btn--primary" disabled={busy}
        onClick={() => cardIndex + 1 < phrases.length ? setCardIndex(cardIndex + 1) : advance(1)}>
        {t(cardIndex + 1 < phrases.length ? 'dailyNextPhrase' : 'dailyPutToUse')}</button></div>
    </Card> : null}
    {/* Shown even with nothing due: jumping past it left the track ticking a part that never happened. */}
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

  /**
   * The step Today would lead with now, as a button. A day that is done
   * goes back to Today, which says so and offers more without pressing it;
   * so does the daily practice itself, since this page already holds it.
   */
  function nextOffer(next: TodayStep): { to: string; label: string; minutes?: number } {
    const title = say(next.course.title);
    // How long the step takes, as Today says it beside the same step.
    const minutes = next.course.estimatedMinutes || undefined;
    switch (next.kind) {
      case 'continue-lesson': return { to: next.to, label: `${t('dashboardContinue')}: ${title}`, minutes };
      case 'start-lesson': return { to: next.to, label: `${t('dashboardStartLesson')}: ${title}`, minutes };
      case 'checkpoint': return { to: next.to, label: `${t(checkpointById(next.to.slice('/checkpoint/'.length))?.scope === 'level'
        ? 'levelCheckpoint' : 'unitCheckpoint')}: ${title}`, minutes };
      case 'review': return { to: next.to, label: t('todayReviewTitle', { n: next.due }), minutes: Math.max(1, Math.round(next.due * 0.4)) };
      case 'mistakes': return { to: next.to, label: title, minutes };
      default: return { to: '/', label: t('navToday') };
    }
  }
}
