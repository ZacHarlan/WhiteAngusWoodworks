/**
 * Joinery quiz validation tests.
 * Uses jsdom to simulate the browser DOM that joinery-quiz.js needs.
 *
 * Run: node tests/quiz-tests.mjs
 */

import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Build the DOM sandbox ──
const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"></head>
<body>
  <div id="quiz-container">
    <div class="quiz-all-questions" id="quiz-all-questions"></div>
    <button id="quiz-submit">Submit Answers</button>
    <p id="quiz-submit-warning"></p>
  </div>
  <div id="quiz-results" style="display:none;">
    <div class="quiz-results-inner">
      <div class="quiz-score-ring">
        <svg viewBox="0 0 120 120" class="quiz-ring-svg">
          <circle cx="60" cy="60" r="52" class="quiz-ring-bg"/>
          <circle cx="60" cy="60" r="52" class="quiz-ring-fill" id="quiz-ring-fill"/>
        </svg>
        <span class="quiz-score-label" id="quiz-score-label"></span>
      </div>
      <h3 id="quiz-results-heading"></h3>
      <p id="quiz-results-percentile"></p>
      <p class="quiz-results-note">Based on all visitors who have taken this assessment.</p>
      <button id="quiz-retake">Take It Again</button>
    </div>
  </div>
</body></html>`;

const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
const { window } = dom;
const { document } = window;

// Stub scrollIntoView (not supported in jsdom)
window.Element.prototype.scrollIntoView = function() {};

// Load joinery-quiz.js into the jsdom window
const quizSrc = readFileSync(path.join(__dirname, '..', 'articles', 'joinery-quiz.js'), 'utf8');
window.eval(quizSrc);

const Q = window.__quiz;

// ── Test helpers ──
const results = [];

function assert(name, condition, detail) {
  results.push({ name, pass: !!condition, detail: detail || '' });
}

function resetQuiz() {
  Q.buildQuiz();
}

function clickOption(questionIdx, optionIdx) {
  const opts = document.getElementById('quiz-opts-' + questionIdx);
  if (!opts) return;
  const btns = opts.querySelectorAll('.quiz-option');
  if (btns[optionIdx]) btns[optionIdx].click();
}

function clickSubmit() {
  document.getElementById('quiz-submit').click();
}

// ────────────────────────────────────────────
// GROUP 1: Data integrity
// ────────────────────────────────────────────

assert('Exactly 5 questions defined', Q.questions.length === 5, 'Found ' + Q.questions.length);

let maxOpts = 0;
const allLe4 = Q.questions.every(q => { if (q.options.length > maxOpts) maxOpts = q.options.length; return q.options.length <= 4; });
assert('Every question has at most 4 options', allLe4, 'Max: ' + maxOpts);

assert('Every question has at least 2 options', Q.questions.every(q => q.options.length >= 2));

assert('Answer index in bounds for every question', Q.questions.every(q => typeof q.answer === 'number' && q.answer >= 0 && q.answer < q.options.length));

const qTexts = Q.questions.map(q => q.q);
assert('No duplicate question text', new Set(qTexts).size === qTexts.length);

assert('No duplicate options within any question', Q.questions.every(q => new Set(q.options).size === q.options.length));

// ────────────────────────────────────────────
// GROUP 2: DOM rendering
// ────────────────────────────────────────────
resetQuiz();

const cards = document.querySelectorAll('#quiz-all-questions .quiz-card');
assert('5 question cards rendered in DOM', cards.length === 5, 'Found ' + cards.length);

let allHaveQ = true;
cards.forEach(card => { if (!card.querySelector('.quiz-question')?.textContent.trim()) allHaveQ = false; });
assert('Each card has non-empty question text', allHaveQ);

const optCounts = [];
cards.forEach(card => optCounts.push(card.querySelectorAll('.quiz-option').length));
assert('Each card has exactly 4 option buttons', optCounts.every(c => c === 4), 'Counts: [' + optCounts.join(', ') + ']');

let allLabeled = true;
cards.forEach((card, i) => {
  const label = card.querySelector('.quiz-card-number');
  if (!label || label.textContent !== `Question ${i + 1} of 5`) allLabeled = false;
});
assert('Each card labeled "Question N of 5"', allLabeled);

assert('Quiz container is visible', document.getElementById('quiz-container').style.display !== 'none');
assert('Results panel hidden initially', document.getElementById('quiz-results').style.display === 'none');

// ────────────────────────────────────────────
// GROUP 3: Selection behavior
// ────────────────────────────────────────────
resetQuiz();

clickOption(0, 2);
let opts0 = document.getElementById('quiz-opts-0').querySelectorAll('.quiz-option');
assert('Clicking option adds .selected class', opts0[2].classList.contains('selected'));

clickOption(0, 1);
opts0 = document.getElementById('quiz-opts-0').querySelectorAll('.quiz-option');
let selectedCount = 0;
opts0.forEach(btn => { if (btn.classList.contains('selected')) selectedCount++; });
assert('Only one option selected after switching', selectedCount === 1 && opts0[1].classList.contains('selected'));

assert('Internal selection state updated', Q.getSelections()[0] === 1);

// ────────────────────────────────────────────
// GROUP 4: Submit validation
// ────────────────────────────────────────────
resetQuiz();

clickSubmit();
let warning = document.getElementById('quiz-submit-warning').textContent;
assert('Submit with no answers shows warning', warning.length > 0 && warning.indexOf('Please answer') === 0);
assert('Warning references unanswered questions', warning.indexOf('1') !== -1 && warning.indexOf('5') !== -1);
assert('Quiz not submitted when answers missing', !Q.isSubmitted());

resetQuiz();
clickOption(0, 0);
clickOption(2, 1);
clickOption(4, 3);
clickSubmit();
warning = document.getElementById('quiz-submit-warning').textContent;
assert('Partial answers still shows warning', warning.length > 0 && warning.indexOf('2') !== -1 && warning.indexOf('4') !== -1);

// ────────────────────────────────────────────
// GROUP 5: Grading — all correct
// ────────────────────────────────────────────
resetQuiz();
Q.questions.forEach((q, i) => clickOption(i, q.answer));
clickSubmit();

assert('Quiz marked submitted after all answered', Q.isSubmitted());

let allCardsCorrect = true;
for (let i = 0; i < 5; i++) {
  if (!document.getElementById('quiz-card-' + i).classList.contains('card-correct')) allCardsCorrect = false;
}
assert('All 5 cards get .card-correct', allCardsCorrect);

let allGreen = true;
Q.questions.forEach((q, qi) => {
  const btns = document.getElementById('quiz-opts-' + qi).querySelectorAll('.quiz-option');
  if (!btns[q.answer].classList.contains('correct')) allGreen = false;
});
assert('Correct option gets .correct class', allGreen);

let allCorrectFb = true;
for (let i = 0; i < 5; i++) {
  if (document.getElementById('quiz-fb-' + i).textContent !== 'Correct!') allCorrectFb = false;
}
assert('Feedback says "Correct!" when right', allCorrectFb);

let allDisabled = true;
for (let i = 0; i < 5; i++) {
  document.getElementById('quiz-opts-' + i).querySelectorAll('.quiz-option').forEach(btn => { if (!btn.disabled) allDisabled = false; });
}
assert('All option buttons disabled after submit', allDisabled);

// ────────────────────────────────────────────
// GROUP 6: Grading — all wrong
// ────────────────────────────────────────────
resetQuiz();
Q.questions.forEach((q, i) => clickOption(i, (q.answer + 1) % q.options.length));
clickSubmit();

let allCardsWrong = true;
for (let i = 0; i < 5; i++) {
  if (!document.getElementById('quiz-card-' + i).classList.contains('card-incorrect')) allCardsWrong = false;
}
assert('All 5 cards get .card-incorrect when all wrong', allCardsWrong);

let coloringOk = true;
Q.questions.forEach((q, qi) => {
  const btns = document.getElementById('quiz-opts-' + qi).querySelectorAll('.quiz-option');
  const wrongIdx = (q.answer + 1) % q.options.length;
  if (!btns[wrongIdx].classList.contains('incorrect')) coloringOk = false;
  if (!btns[q.answer].classList.contains('correct')) coloringOk = false;
});
assert('Wrong gets .incorrect, correct gets .correct', coloringOk);

let allWrongFb = true;
for (let i = 0; i < 5; i++) {
  if (document.getElementById('quiz-fb-' + i).textContent.indexOf('Not quite') === -1) allWrongFb = false;
}
assert('Feedback says "Not quite" for wrong answers', allWrongFb);

// ────────────────────────────────────────────
// GROUP 7: Results screen (5/5)
// ────────────────────────────────────────────
resetQuiz();
Q.questions.forEach((q, i) => clickOption(i, q.answer));
clickSubmit();

assert('Results panel visible after submit', document.getElementById('quiz-results').style.display === 'block');
assert('Quiz container hidden when results shown', document.getElementById('quiz-container').style.display === 'none');
assert('Score label shows "5/5"', document.getElementById('quiz-score-label').textContent === '5/5');
assert('Heading is "Master Craftsman!" for 5/5', document.getElementById('quiz-results-heading').textContent === 'Master Craftsman!');

const pctText = document.getElementById('quiz-results-percentile').textContent;
assert('Percentile shows 98% for 5/5', pctText.indexOf('98%') !== -1 && pctText.indexOf('as well or better') !== -1);

// ────────────────────────────────────────────
// GROUP 8: Results for 0/5
// ────────────────────────────────────────────
resetQuiz();
Q.questions.forEach((q, i) => clickOption(i, (q.answer + 1) % q.options.length));
clickSubmit();

assert('Score label shows "0/5"', document.getElementById('quiz-score-label').textContent === '0/5');
assert('Heading is "Room to grow!" for 0/5', document.getElementById('quiz-results-heading').textContent === 'Room to grow!');
assert('Percentile shows 12% for 0/5', document.getElementById('quiz-results-percentile').textContent.indexOf('12%') !== -1);

// ────────────────────────────────────────────
// GROUP 9: Retake functionality
// ────────────────────────────────────────────
document.getElementById('quiz-retake').click();

assert('After retake, quiz container visible', document.getElementById('quiz-container').style.display === 'block');
assert('After retake, results panel hidden', document.getElementById('quiz-results').style.display === 'none');

const freshCards = document.querySelectorAll('#quiz-all-questions .quiz-card');
assert('After retake, 5 fresh cards rendered', freshCards.length === 5);

let noGrading = true;
freshCards.forEach(c => { if (c.classList.contains('card-correct') || c.classList.contains('card-incorrect')) noGrading = false; });
assert('After retake, no cards have grading classes', noGrading);

assert('After retake, all selections reset to -1', Q.getSelections().every(s => s === -1));
assert('After retake, submitted state is false', !Q.isSubmitted());
assert('After retake, submit button says "Submit Answers"', document.getElementById('quiz-submit').textContent === 'Submit Answers');

// ────────────────────────────────────────────
// GROUP 10: Post-retake completion
// ────────────────────────────────────────────
resetQuiz();
Q.questions.forEach((q, i) => clickOption(i, q.answer));
clickSubmit();
assert('Can complete quiz again after retake', Q.isSubmitted());

// ── Output ──
let totalPass = 0;
let totalFail = 0;
results.forEach(r => { if (r.pass) totalPass++; else totalFail++; });

const groups = [
  { name: 'Data Integrity', from: 0, to: 5 },
  { name: 'DOM Rendering', from: 6, to: 11 },
  { name: 'Selection Behavior', from: 12, to: 14 },
  { name: 'Submit Validation', from: 15, to: 18 },
  { name: 'Grading — All Correct', from: 19, to: 23 },
  { name: 'Grading — All Wrong', from: 24, to: 26 },
  { name: 'Results Screen (5/5)', from: 27, to: 31 },
  { name: 'Results Screen (0/5)', from: 32, to: 34 },
  { name: 'Retake Functionality', from: 35, to: 41 },
  { name: 'Post-Retake Completion', from: 42, to: 42 }
];

for (const g of groups) {
  const groupResults = results.slice(g.from, g.to + 1);
  const groupFail = groupResults.some(r => !r.pass);
  console.log(`\n  ${groupFail ? '✗' : '✓'} ${g.name}`);
  for (const r of groupResults) {
    const icon = r.pass ? '✓' : '✗';
    const detail = r.detail ? ` (${r.detail})` : '';
    console.log(`    ${icon} ${r.name}${detail}`);
  }
}

console.log(`\n${totalPass}/${results.length} quiz tests passed${totalFail > 0 ? '  (' + totalFail + ' failed)' : ''}`);
process.exit(totalFail === 0 ? 0 : 1);
