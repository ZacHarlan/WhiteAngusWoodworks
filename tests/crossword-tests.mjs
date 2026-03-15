/**
 * Crossword puzzle validation tests.
 * Mirrors the puzzle data from articles/crossword.js and validates
 * grid bounds, letter conflicts, connectivity, adjacency, numbering.
 *
 * Run: node tests/crossword-tests.mjs
 */

// ── Puzzle data (mirrored from crossword.js) ──
const puzzles = {
  'wood-glue-guide.html': {
    size: 11,
    words: [
      { answer: "REVERSIBLE", r: 0, c: 1, dir: "V", num: 1 },
      { answer: "PVA", r: 2, c: 0, dir: "H", num: 2 },
      { answer: "HIDE", r: 2, c: 4, dir: "V", num: 3 },
      { answer: "SQUEEZEOUT", r: 5, c: 1, dir: "H", num: 4 },
      { answer: "EPOXY", r: 9, c: 1, dir: "H", num: 5 }
    ]
  },
  'ai-woodworking-design.html': {
    size: 11,
    words: [
      { answer: "CNC", r: 3, c: 0, dir: "V", num: 1 },
      { answer: "VECTOR", r: 4, c: 6, dir: "V", num: 2 },
      { answer: "DESK", r: 4, c: 8, dir: "V", num: 3 },
      { answer: "CANTILEVER", r: 5, c: 0, dir: "H", num: 4 },
      { answer: "LAYOUT", r: 7, c: 1, dir: "H", num: 5 }
    ]
  },
  'dovetailed-tea-box.html': {
    size: 11,
    words: [
      { answer: "TEA", r: 0, c: 5, dir: "V", num: 1 },
      { answer: "MALLET", r: 0, c: 7, dir: "V", num: 2 },
      { answer: "DOVETAIL", r: 1, c: 2, dir: "H", num: 3 },
      { answer: "PIANO", r: 3, c: 3, dir: "V", num: 4 },
      { answer: "WALNUT", r: 5, c: 2, dir: "H", num: 5 }
    ]
  },
  'staining-guide.html': {
    size: 11,
    words: [
      { answer: "SANDING", r: 0, c: 8, dir: "V", num: 1 },
      { answer: "MINERAL", r: 1, c: 3, dir: "H", num: 2 },
      { answer: "BLOTCH", r: 4, c: 3, dir: "V", num: 3 },
      { answer: "GRAIN", r: 4, c: 5, dir: "H", num: 4 },
      { answer: "POPPING", r: 6, c: 2, dir: "H", num: 5 }
    ]
  },
  'box-joint-jig.html': {
    size: 11,
    words: [
      { answer: "KERF", r: 1, c: 4, dir: "H", num: 1 },
      { answer: "FENCE", r: 1, c: 7, dir: "V", num: 2 },
      { answer: "SPACING", r: 3, c: 2, dir: "H", num: 3 },
      { answer: "BLADE", r: 5, c: 3, dir: "H", num: 4 },
      { answer: "DADO", r: 5, c: 6, dir: "V", num: 5 }
    ]
  },
  'benefits-custom-furniture.html': {
    size: 11,
    words: [
      { answer: "JOINERY", r: 0, c: 4, dir: "V", num: 1 },
      { answer: "CUSTOM", r: 1, c: 0, dir: "H", num: 2 },
      { answer: "WALNUT", r: 3, c: 1, dir: "H", num: 3 },
      { answer: "HEIRLOOM", r: 5, c: 1, dir: "H", num: 4 },
      { answer: "MAPLE", r: 5, c: 8, dir: "V", num: 5 }
    ]
  },
  'sandpaper-guide.html': {
    size: 11,
    words: [
      { answer: "CERAMIC", r: 0, c: 5, dir: "V", num: 1 },
      { answer: "GARNET", r: 1, c: 9, dir: "V", num: 2 },
      { answer: "ORBITAL", r: 2, c: 4, dir: "H", num: 3 },
      { answer: "GRIT", r: 4, c: 3, dir: "V", num: 4 },
      { answer: "GRAIN", r: 5, c: 2, dir: "H", num: 5 }
    ]
  }
};

// ── Helpers ──
function getCells(word) {
  const cells = [];
  for (let i = 0; i < word.answer.length; i++) {
    const row = word.dir === "H" ? word.r : word.r + i;
    const col = word.dir === "H" ? word.c + i : word.c;
    cells.push({ row, col, char: word.answer[i] });
  }
  return cells;
}

// ── Test functions ──

function testBounds(config) {
  const { size, words } = config;
  const oob = [];
  words.forEach(w => {
    getCells(w).forEach(({ row, col }) => {
      if (row < 0 || row >= size || col < 0 || col >= size)
        oob.push(`${w.answer}(${row},${col})`);
    });
  });
  return oob.length === 0
    ? { passed: true, message: 'All words fit within the grid' }
    : { passed: false, message: `Out of bounds: ${oob.join(', ')}` };
}

function testNoConflicts(config) {
  const grid = {};
  const conflicts = [];
  config.words.forEach(w => {
    getCells(w).forEach(({ row, col, char }) => {
      const key = `${row},${col}`;
      if (grid[key] && grid[key].char !== char) {
        conflicts.push(`(${row},${col}): "${grid[key].word}" has '${grid[key].char}' but "${w.answer}" has '${char}'`);
      }
      grid[key] = { char, word: w.answer };
    });
  });
  return conflicts.length === 0
    ? { passed: true, message: 'No letter conflicts' }
    : { passed: false, message: conflicts.join('; ') };
}

function testAllConnected(config) {
  const wordCellSets = config.words.map(w => {
    const set = new Set();
    getCells(w).forEach(({ row, col }) => set.add(`${row},${col}`));
    return { answer: w.answer, cells: set };
  });

  const adj = config.words.map(() => new Set());
  for (let i = 0; i < wordCellSets.length; i++) {
    for (let j = i + 1; j < wordCellSets.length; j++) {
      for (const cell of wordCellSets[i].cells) {
        if (wordCellSets[j].cells.has(cell)) {
          adj[i].add(j);
          adj[j].add(i);
          break;
        }
      }
    }
  }

  const visited = new Set([0]);
  const queue = [0];
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of adj[cur]) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }

  const isolated = config.words
    .filter((_, i) => !visited.has(i))
    .map(w => w.answer);

  return isolated.length === 0
    ? { passed: true, message: 'All words are connected' }
    : { passed: false, message: `Disconnected words: ${isolated.join(', ')}` };
}

function testUniqueNumbers(config) {
  const seen = {};
  const dupes = [];
  config.words.forEach(w => {
    if (seen[w.num]) dupes.push(`#${w.num} used by both "${seen[w.num]}" and "${w.answer}"`);
    seen[w.num] = w.answer;
  });
  return dupes.length === 0
    ? { passed: true, message: 'All clue numbers are unique' }
    : { passed: false, message: dupes.join('; ') };
}

function testNumberOrder(config) {
  const entries = config.words.map(w => ({ num: w.num, r: w.r, c: w.c }));
  const cellMap = {};
  entries.forEach(e => {
    const key = `${e.r}-${e.c}`;
    if (!cellMap[key]) cellMap[key] = { r: e.r, c: e.c, nums: [] };
    cellMap[key].nums.push(e.num);
  });
  const cells = Object.values(cellMap)
    .map(c => ({ ...c, num: Math.min(...c.nums) }))
    .sort((a, b) => a.r - b.r || a.c - b.c);

  for (let i = 1; i < cells.length; i++) {
    if (cells[i].num < cells[i - 1].num) {
      return { passed: false, message: `#${cells[i].num} at (${cells[i].r},${cells[i].c}) appears after #${cells[i - 1].num} at (${cells[i - 1].r},${cells[i - 1].c})` };
    }
  }
  return { passed: true, message: 'Clue numbers follow correct order' };
}

function testNoUnintendedAdjacency(config) {
  const { size, words } = config;
  const grid = {};
  const hMem = {};
  const vMem = {};

  words.forEach((w, idx) => {
    getCells(w).forEach(({ row, col }) => {
      const key = `${row},${col}`;
      grid[key] = true;
      if (w.dir === 'H') {
        if (!hMem[key]) hMem[key] = new Set();
        hMem[key].add(idx);
      } else {
        if (!vMem[key]) vMem[key] = new Set();
        vMem[key].add(idx);
      }
    });
  });

  const violations = [];
  for (const key of Object.keys(grid)) {
    const [r, c] = key.split(',').map(Number);
    const rightKey = `${r},${c + 1}`;
    if (grid[rightKey]) {
      const h1 = hMem[key] || new Set();
      const h2 = hMem[rightKey] || new Set();
      let shared = false;
      for (const v of h1) { if (h2.has(v)) { shared = true; break; } }
      if (!shared) violations.push(`(${r},${c})→(${r},${c + 1}): no shared across word`);
    }
    const botKey = `${r + 1},${c}`;
    if (grid[botKey]) {
      const v1 = vMem[key] || new Set();
      const v2 = vMem[botKey] || new Set();
      let shared = false;
      for (const v of v1) { if (v2.has(v)) { shared = true; break; } }
      if (!shared) violations.push(`(${r},${c})→(${r + 1},${c}): no shared down word`);
    }
  }

  return violations.length === 0
    ? { passed: true, message: 'No unintended adjacency' }
    : { passed: false, message: violations.join('; ') };
}

// ── Run all tests ──
const testDefs = [
  { label: 'Bounds', fn: testBounds },
  { label: 'No conflicts', fn: testNoConflicts },
  { label: 'Connected', fn: testAllConnected },
  { label: 'No unintended adjacency', fn: testNoUnintendedAdjacency },
  { label: 'Unique numbers', fn: testUniqueNumbers },
  { label: 'Number order', fn: testNumberOrder },
];

let totalPass = 0;
let totalFail = 0;

for (const [pageName, config] of Object.entries(puzzles)) {
  console.log(`\n  ${pageName}`);
  for (const t of testDefs) {
    const result = t.fn(config);
    const icon = result.passed ? '✓' : '✗';
    console.log(`    ${icon} ${t.label}: ${result.message}`);
    if (result.passed) totalPass++;
    else totalFail++;
  }
}

console.log(`\n${totalPass} passed, ${totalFail} failed across ${Object.keys(puzzles).length} puzzles`);
process.exit(totalFail === 0 ? 0 : 1);
