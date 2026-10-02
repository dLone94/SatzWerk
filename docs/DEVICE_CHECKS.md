# Phone release checks

Automated coverage runs with `npm run test:browser`. The server, database,
Chromium service worker and actual network failures are exercised locally.
Speech recognition, voice playback and push permission/error branches also
have unit tests. These checks do not establish physical-device reliability.

Status on 2 October 2026: **physical iOS/Android checks pending**. No physical
phone or real push credentials were available in this environment. Record the
OS, browser version, installed/tab mode, date and outcome against each row.
Use a disposable learner on a password-protected test deployment.

| Check | Steps | Pass condition |
| --- | --- | --- |
| iOS installation | Safari → Add to Home Screen → open installed app | Correct icon, safe-area spacing, no browser chrome; language survives reopening |
| iOS tab reminder | Open Settings in a Safari tab | Installation guidance appears instead of a promise that push is enabled |
| Android installation | Chrome → install → open at 320–430 px widths | Navigation, keyboard, umlaut keys and answer field remain reachable |
| Recorded German | Play German phrase; replay slowly; interrupt with a different phrase | German audio plays once; older audio stops; slow playback remains intelligible |
| Missing recording | Test a phrase without a recording | German device voice is used when available; missing voice gives an honest unavailable state |
| Microphone denied | Deny microphone in Real Life; try typing | Clear permission guidance; typing completes the same conversation |
| Microphone allowed | Grant microphone; speak German; stop mid-turn | Recognised text can be reviewed; stop releases the microphone; no duplicate submission |
| Interrupted speech | Switch apps while recording; return; cancel and retry | No stuck listening state or active microphone after leaving the exercise |
| Offline continuation | Save the current level; open a lesson online; turn on airplane mode; answer | Verdict appears; answers wait; changing/adding learners is blocked until queued work is sent |
| Offline reopening | Close app in airplane mode and reopen | App opens to connection guidance; no fabricated progress; reconnect restores actual progress |
| iOS push | Configure test VAPID/cron; enable from an installed-app tap; send reminder | One notification at configured time; tap opens app; disabling stops future delivery |
| Android push | Enable from a tap; background app; send reminder; revoke permission | Delivery/tap work; denied state is clear; revoked/expired subscription is handled |
| Household push ownership | Enable for one learner; hand over; change time zone | Reminder is associated with the intended learner and local day, without revealing another learner's work |
| Larger text / VoiceOver / TalkBack | Increase text size; traverse course summaries and a correction | Controls stay visible; current lesson and checkpoint state announced; route heading receives focus |

Keep actual device outcomes with a release record. Remote CI cannot replace
these checks. No live reminders were sent during this work.
