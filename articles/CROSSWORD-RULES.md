# Crossword Puzzle Rules & Guidelines

Rules for creating and validating crossword puzzles on the White Angus Woodworks site.

---

## Grid Specifications

- **Grid size:** 11×11 (rows 0–10, columns 0–10)
- **Words per puzzle:** 5
- **Grid coordinate system:** Zero-indexed `(row, col)` starting from top-left

---

## Layout Rules

### 1. Bounds
Every letter of every word must fit within the 11×11 grid. No cell may have a row or column index outside `0–10`.

### 2. No Letter Conflicts
When two words cross at the same cell, both words must have the **same letter** at that position. For example, if an across word places an "A" at `(3, 5)`, any down word passing through `(3, 5)` must also have "A" at that cell.

### 3. All Words Connected
Every word must share at least one cell (intersection) with another word. There must be no isolated words — the entire puzzle must form one connected group. You can verify this with a BFS/DFS from any word; all 5 words should be reachable.

### 4. No Unintended Adjacency (Critical)
This is the rule most often violated. **Every pair of adjacent filled cells must belong to the same word in the direction of their adjacency:**

- **Horizontally adjacent** cells `(r, c)` and `(r, c+1)` must both belong to the **same across word**.
- **Vertically adjacent** cells `(r, c)` and `(r+1, c)` must both belong to the **same down word**.

If a down word's letter happens to land next to an across word's letter without them sharing a word in that direction, the grid is **invalid**. A solver should place letters only where they don't create accidental letter runs.

### 5. Word Boundaries
The cell immediately **before** a word's start and immediately **after** its end (in the word's direction) must be **empty**:

- For an across word starting at `(r, c)` with length `L`: cells `(r, c-1)` and `(r, c+L)` must be empty (or out of bounds).
- For a down word starting at `(r, c)` with length `L`: cells `(r-1, c)` and `(r+L, c)` must be empty (or out of bounds).

---

## Numbering Rules

### 6. Unique Clue Numbers
Each word gets a unique clue number. No two words may share the same number (unless they start at the exact same cell, which is the standard crossword convention for an across/down pair sharing a starting square).

### 7. Number Ordering
Clue numbers are assigned in **reading order**: top-to-bottom, left-to-right. The word (or pair of words) starting at the topmost, leftmost cell gets `#1`, the next gets `#2`, and so on. A word at `(0, 5)` is numbered before a word at `(1, 2)` because row 0 comes before row 1.

---

## File Structure

### Files to Update When Adding/Changing a Puzzle

1. **`articles/crossword.js`** — Add/update the puzzle definition in the `puzzles` object:
   ```javascript
   'article-filename.html': {
       containerId: 'topic-crossword',
       size: 11,
       words: [
           { answer: "WORD", r: 0, c: 0, dir: "H", num: 1 },
           // ... 5 words total
       ]
   }
   ```

2. **`articles/crossword-tests.html`** — Mirror the exact same puzzle data in the test page's `puzzles` object. Must match `crossword.js` exactly.

3. **Article HTML file** — Add the crossword section with:
   - The crossword container `<div>` with the matching `id` (e.g., `id="topic-crossword"`)
   - Clue lists grouped into **Across** and **Down** `<ul>` elements
   - Clue numbers in `<strong>` tags matching the word numbers
   - The `crossword.js` script tag: `<script src="crossword.js" defer></script>`

### Clue HTML Template
```html
<section class="crossword-section" id="challenge">
    <div class="divider" style="margin: 3rem auto;"></div>
    <h2 class="crossword-title">The [Topic] Challenge</h2>
    <p class="crossword-subtitle">Test your knowledge of [topic description].</p>

    <div class="crossword-container">
        <div class="grid-frame">
            <div class="crossword-grid" id="[topic]-crossword">
                <!-- JS will populate -->
            </div>
        </div>
        <div class="crossword-clues">
            <div class="clue-group">
                <h3>Across</h3>
                <ul id="across-clues">
                    <li><strong>[num]</strong> [clue text]</li>
                </ul>
            </div>
            <div class="clue-group">
                <h3>Down</h3>
                <ul id="down-clues">
                    <li><strong>[num]</strong> [clue text]</li>
                </ul>
            </div>
            <div class="crossword-actions">
                <button id="check-puzzle" class="btn-piano-black">Check Answers</button>
                <p id="crossword-feedback" class="fade-in"></p>
            </div>
        </div>
    </div>
</section>
```

---

## Validation Tests (6 total per puzzle)

The test page (`crossword-tests.html`) runs these 6 tests for every puzzle:

| # | Test | What It Checks |
|---|------|----------------|
| 1 | Bounds | All cells within 11×11 grid |
| 2 | No conflicts | Intersecting letters agree |
| 3 | Connectivity | All 5 words are connected (no islands) |
| 4 | No unintended adjacency | Adjacent filled cells share a word in that direction |
| 5 | Unique numbers | No duplicate clue numbers |
| 6 | Number ordering | Numbers follow top→bottom, left→right |

---

## Quick Checklist for New Puzzles

- [ ] Pick 5 words related to the article topic
- [ ] Place words on 11×11 grid satisfying all 7 rules above
- [ ] Assign clue numbers in reading order (top→bottom, left→right)
- [ ] Add puzzle data to `crossword.js`
- [ ] Add matching puzzle data to `crossword-tests.html`
- [ ] Add crossword HTML section to the article with correct clue numbers and across/down grouping
- [ ] Add `<script src="crossword.js" defer></script>` before `</body>` in the article
- [ ] Run the test page to confirm all 6 tests pass
