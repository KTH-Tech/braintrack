# BrainTrack Terminology Glossary

Authoritative product copy for the learner-facing surfaces (study, dashboard, practice/drill pages). Use these terms consistently in EN and AF across `client/src/pages/**` and shared components.

## Core terms

| Concept | EN | AF | Notes |
| --- | --- | --- | --- |
| Short, often timed assessment session | **Quiz** | **Vasvraag** | Used for the Daily Quiz, Boost Quiz, Recommended Quiz, Quick Quiz. |
| Working through questions to learn / improve | **Practice** | **Oefening** | Default verb/noun for question sets that are not a quiz. Replaces older "drill" copy on in-product surfaces. |
| Mixed-topic practice block | **Mixed practice** | **Gemengde oefening** | Was previously "Mixed drill" in EN — now aligned to AF. |
| Timed exam-style attempt | **Mock exam** | **Proefeksamen** | Distinct from a quiz. |
| Daily streak event | **Daily Challenge** | **Daaglikse Uitdaging** | The daily-challenge page only. |

## Rules

1. **In-product surfaces** (study, dashboard, subject detail, revision, DBE practice, study calendar): use **Quiz** or **Practice** only — never "Drill" in EN.
2. **AF copy** must mirror EN concept-for-concept: never pair `oefening` with `drill` or `vasvraag` with `practice`.
3. **Marketing surfaces** (landing, features, research, subscribe, parent-purchase) may keep evocative phrasing such as "exam technique drills" where it is part of long-form prose, but new product copy should prefer the terms above.
4. When in doubt, prefer **Practice / Oefening**.

## K3 fix log (Task #298)

- `client/src/pages/subject-detail.tsx`: "Mixed drill - all topics" → "Mixed practice - all topics"; "Timed mixed drill (40 marks)" → "Timed mixed practice (40 marks)" so the EN copy matches the existing AF "Gemengde oefening".
