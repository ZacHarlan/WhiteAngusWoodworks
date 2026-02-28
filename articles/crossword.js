/**
 * White Angus Woodworks - Interactive Crossword
 * Thematic puzzles for all articles
 */

document.addEventListener('DOMContentLoaded', () => {
    // Puzzle Data Configuration
    const puzzles = {
        'wood-glue-guide.html': {
            containerId: 'glue-crossword',
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
            containerId: 'ai-crossword',
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
            containerId: 'tea-box-crossword',
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
            containerId: 'staining-crossword',
            size: 11,
            words: [
                { answer: "SANDING", r: 0, c: 8, dir: "V", num: 1 },
                { answer: "MINERAL", r: 1, c: 3, dir: "H", num: 2 },
                { answer: "BLOTCH", r: 4, c: 3, dir: "V", num: 3 },
                { answer: "GRAIN", r: 4, c: 5, dir: "H", num: 4 },
                { answer: "POPPING", r: 6, c: 2, dir: "H", num: 5 }
            ]
        },
        'joinery-strength.html': {
            containerId: 'joinery-crossword',
            size: 11,
            words: [
                { answer: "MECHANICAL", r: 3, c: 0, dir: "H", num: 1 },
                { answer: "CHEMICAL", r: 3, c: 7, dir: "V", num: 2 },
                { answer: "TENON", r: 5, c: 6, dir: "H", num: 3 },
                { answer: "MORTISE", r: 7, c: 3, dir: "H", num: 4 },
                { answer: "GRAIN", r: 9, c: 5, dir: "H", num: 5 }
            ]
        },
        'box-joint-jig.html': {
            containerId: 'box-joint-crossword',
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
            containerId: 'benefits-crossword',
            size: 11,
            words: [
                { answer: "JOINERY", r: 0, c: 4, dir: "V", num: 1 },
                { answer: "CUSTOM", r: 1, c: 0, dir: "H", num: 2 },
                { answer: "WALNUT", r: 3, c: 1, dir: "H", num: 3 },
                { answer: "HEIRLOOM", r: 5, c: 1, dir: "H", num: 4 },
                { answer: "MAPLE", r: 5, c: 8, dir: "V", num: 5 }
            ]
        }
    };

    // Determine current puzzle based on filename
    const filename = window.location.pathname.split('/').pop();
    const config = puzzles[filename];

    if (!config) {
        console.warn('No crossword puzzle defined for this page:', filename);
        return;
    }

    const gridContainer = document.getElementById(config.containerId);
    const checkBtn = document.getElementById('check-puzzle');
    const feedback = document.getElementById('crossword-feedback');

    if (!gridContainer || !checkBtn) return;

    const GRID_SIZE = config.size;
    const words = config.words;
    const gridData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    const cellNumbers = {};

    words.forEach(w => {
        const chars = w.answer.split('');
        chars.forEach((char, i) => {
            const row = w.dir === "H" ? w.r : w.r + i;
            const col = w.dir === "H" ? w.c + i : w.c;
            gridData[row][col] = char;

            if (i === 0) {
                cellNumbers[`${row}-${col}`] = w.num;
            }
        });
    });

    let currentDirection = 'H';

    // Render Grid
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'crossword-cell';

            if (gridData[r][c] === 0) {
                cellDiv.classList.add('black');
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = r;
                input.dataset.col = c;
                input.dataset.answer = gridData[r][c];

                if (cellNumbers[`${r}-${c}`]) {
                    const numDiv = document.createElement('span');
                    numDiv.className = 'crossword-number';
                    numDiv.textContent = cellNumbers[`${r}-${c}`];
                    cellDiv.appendChild(numDiv);
                }

                input.addEventListener('keydown', handleKeyNavigation);
                input.addEventListener('focus', () => highlightClue(r, c));
                input.addEventListener('click', () => {
                    const junction = words.filter(w => {
                        const length = w.answer.length;
                        if (w.dir === "H") return w.r === r && c >= w.c && c < w.c + length;
                        return w.c === c && r >= w.r && r < w.r + length;
                    }).length > 1;

                    if (junction) {
                        currentDirection = currentDirection === 'H' ? 'V' : 'H';
                        highlightClue(r, c);
                    }
                });
                input.addEventListener('input', (e) => {
                    if (e.target.value) {
                        autoTab(e.target);
                    }
                });

                cellDiv.appendChild(input);
            }
            gridContainer.appendChild(cellDiv);
        }
    }

    // Attach click listeners to clues
    const clueGroups = ['across-clues', 'down-clues'];
    clueGroups.forEach(groupId => {
        const groupEl = document.getElementById(groupId);
        if (groupEl) {
            groupEl.querySelectorAll('li').forEach(li => {
                li.addEventListener('click', () => {
                    const num = parseInt(li.querySelector('strong').textContent);
                    currentDirection = groupId === 'across-clues' ? 'H' : 'V';
                    focusWordInGrid(num, currentDirection);
                });
                li.style.cursor = 'pointer';
            });
        }
    });

    function focusWordInGrid(num, dir) {
        const word = words.find(w => w.num === num && w.dir === dir);
        if (word) {
            const firstInput = document.querySelector(`input[data-row="${word.r}"][data-col="${word.c}"]`);
            if (firstInput) firstInput.focus();
        }
    }

    function highlightClue(r, c) {
        const possibleWords = words.filter(w => {
            const length = w.answer.length;
            if (w.dir === "H") {
                return w.r === r && c >= w.c && c < w.c + length;
            } else {
                return w.c === c && r >= w.r && r < w.r + length;
            }
        });

        let activeWord = possibleWords.find(w => w.dir === currentDirection);
        if (!activeWord && possibleWords.length > 0) {
            activeWord = possibleWords[0];
            currentDirection = activeWord.dir;
        }

        document.querySelectorAll('.crossword-cell').forEach(cell => cell.classList.remove('cell-highlight'));
        document.querySelectorAll('.clue-group li').forEach(li => li.classList.remove('active-clue'));

        if (activeWord) {
            const w = activeWord;
            for (let i = 0; i < w.answer.length; i++) {
                const row = w.dir === "H" ? w.r : w.r + i;
                const col = w.dir === "H" ? w.c + i : w.c;
                const cell = document.querySelector(`.crossword-cell input[data-row="${row}"][data-col="${col}"]`);
                if (cell) cell.parentElement.classList.add('cell-highlight');
            }

            const listId = w.dir === "H" ? "across-clues" : "down-clues";
            const items = document.getElementById(listId).querySelectorAll('li');
            items.forEach(li => {
                const strong = li.querySelector('strong');
                if (strong && strong.textContent === w.num.toString()) {
                    li.classList.add('active-clue');
                    li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    }

    function handleKeyNavigation(e) {
        const r = parseInt(e.target.dataset.row);
        const c = parseInt(e.target.dataset.col);
        let nextRow = r, nextCol = c;

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.target.value = '';
        }

        switch (e.key) {
            case 'ArrowRight': nextCol++; break;
            case 'ArrowLeft': nextCol--; break;
            case 'ArrowDown': nextRow++; break;
            case 'ArrowUp': nextRow--; break;
            case 'Backspace':
                if (!e.target.value) {
                    let prevRow = r, prevCol = c;
                    if (currentDirection === 'H') prevCol--; else prevRow--;
                    const prevInput = document.querySelector(`input[data-row="${prevRow}"][data-col="${prevCol}"]`);
                    if (prevInput) {
                        prevInput.focus();
                        prevInput.value = '';
                    }
                }
                return;
            default: return;
        }

        const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextInput) nextInput.focus();
    }

    function autoTab(current) {
        const r = parseInt(current.dataset.row);
        const c = parseInt(current.dataset.col);
        let nextRow = r, nextCol = c;

        if (currentDirection === 'H') nextCol++; else nextRow++;

        const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextInput) nextInput.focus();
    }

    function triggerCelebration() {
        // 1. Show Success Modal (Create it if it doesn't exist)
        let modal = document.querySelector('.celebration-overlay');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'celebration-overlay';
            modal.innerHTML = `
                <div class="achievement-card">
                    <div class="achievement-badge">🪚</div>
                    <h2 class="achievement-title">Master Woodworker</h2>
                    <p class="achievement-text">Perfect joints! You've nailed every answer and proven your craft. The shop is proud.</p>
                    <button class="btn btn-primary" id="return-to-shop">Return to Shop</button>
                </div>
            `;
            document.body.appendChild(modal);

            // Fix CSP violation by avoiding inline onclick
            document.getElementById('return-to-shop').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        setTimeout(() => {
            modal.classList.add('active');

            // 2. Start Confetti (Wood Shavings) AFTER modal is active 
            // This ensures they appear over the modal (if z-index is correct)
            const species = ['walnut', 'maple', 'cherry'];
            for (let i = 0; i < 100; i++) {
                const shaving = document.createElement('div');
                const wood = species[Math.floor(Math.random() * species.length)];
                shaving.className = `shaving shaving-${wood} shaving-animate`;

                shaving.style.left = Math.random() * 100 + 'vw';
                shaving.style.top = -Math.random() * 20 - 5 + 'vh';
                shaving.style.width = (Math.random() * 10 + 5) + 'px';
                shaving.style.height = (Math.random() * 20 + 10) + 'px';
                shaving.style.animationDuration = (Math.random() * 3 + 2) + 's';
                shaving.style.animationDelay = (Math.random() * 2) + 's';
                shaving.style.opacity = (Math.random() * 0.5 + 0.5).toString(); // Better visibility

                document.body.appendChild(shaving);

                setTimeout(() => shaving.remove(), 5000);
            }
        }, 500);
    }

    checkBtn.addEventListener('click', () => {
        const inputs = document.querySelectorAll('.crossword-cell input');
        let allCorrect = true;
        let filledCount = 0;

        inputs.forEach(input => {
            const val = input.value.trim().toUpperCase();
            if (val) filledCount++;
            if (val === input.dataset.answer) {
                input.parentElement.classList.add('cell-correct', 'cell-bounce');
            } else {
                input.parentElement.classList.remove('cell-correct', 'cell-bounce');
                if (val) allCorrect = false;
            }
        });

        if (filledCount < inputs.length) allCorrect = false;

        if (filledCount === 0) {
            feedback.textContent = "Start typing to solve the puzzle!";
            feedback.style.color = "var(--color-walnut)";
        } else if (filledCount < inputs.length) {
            feedback.textContent = `You've filled ${filledCount} of ${inputs.length} boxes. Keep going!`;
            feedback.style.color = "#d32f2f";
        } else if (allCorrect) {
            feedback.textContent = "🎉 Master Woodworker! You nailed it.";
            feedback.style.color = "#2e7d32";
            triggerCelebration();
        } else {
            feedback.textContent = "Some joints are still a bit loose. Check your spelling!";
            feedback.style.color = "#d32f2f";
        }
    });
});
