# IIoT assignment practice

Practice site for the NPTEL course "Introduction to Industry 4.0 and Industrial Internet of Things" (Weeks 1–12, 180 questions). Runs fully on your machine, no backend.

## Run it

```
npm install
npm run dev
```

Then open the local address Vite prints (usually http://localhost:5173).

## How it works

- Home page lists Weeks 1–12 plus a Mixed test (15 random questions from all weeks).
- No timer. Submit to see your score with correct answers in green and wrong picks in red.
- Every attempt shuffles question order and option order, and avoids repeating both the original order and your previous attempt's order.
- Nothing is saved. Retake or go back and the progress resets.

## Editing questions

All questions live in `src/data/questions.js`. Each entry has `q` (question), `o` (options in original order) and `a` (correct letter).
