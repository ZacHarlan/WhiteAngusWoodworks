(function() {
    var questions = [
        {
            q: "According to the article, what is the fundamental flaw of metal screws in wood furniture?",
            options: [
                "They rust over time and stain the wood",
                "Metal is harder than wood, so the screw wallows out the hole over years of use",
                "Screws split the wood grain when driven in",
                "They prevent the wood from being stained"
            ],
            answer: 1
        },
        {
            q: "A superior wood joint relies on two types of strength. What are they?",
            options: [
                "Tensile strength and shear strength",
                "Mechanical strength (geometry locking) and chemical strength (glue bond)",
                "Compressive strength and lateral resistance",
                "Grain alignment and moisture resistance"
            ],
            answer: 1
        },
        {
            q: "Why is the mortise and tenon called 'the king of joints'?",
            options: [
                "It uses the least amount of wood material",
                "It's the easiest joint for beginners",
                "It provides massive glue surface area on all four sides and resists twisting and racking",
                "It was invented by royalty for palace furniture"
            ],
            answer: 2
        },
        {
            q: "What makes a dovetail joint uniquely effective for drawers?",
            options: [
                "The glue dries faster in wedge-shaped cuts",
                "Pulling on the drawer front tightens the joint due to the wedge shape",
                "The tails allow the drawer to slide more smoothly",
                "Dovetails use less wood than other corner joints"
            ],
            answer: 1
        },
        {
            q: "How does a breadboard end on a dining table handle wood movement?",
            options: [
                "It uses flexible metal brackets on every tenon",
                "The entire breadboard is floating with no glue at all",
                "Only the center tenon is glued; the outer tenons float in elongated holes",
                "The breadboard is attached with screws that can be loosened seasonally"
            ],
            answer: 2
        }
    ];

    var selections = [-1, -1, -1, -1, -1];
    var submitted = false;
    var container = document.getElementById('quiz-container');
    var wrapper = document.getElementById('quiz-all-questions');
    var submitBtn = document.getElementById('quiz-submit');
    var warningEl = document.getElementById('quiz-submit-warning');
    var resultsPanel = document.getElementById('quiz-results');
    var retakeBtn = document.getElementById('quiz-retake');

    function buildQuiz() {
        wrapper.innerHTML = '';
        warningEl.textContent = '';
        submitted = false;
        selections = [-1, -1, -1, -1, -1];
        submitBtn.style.display = 'block';

        questions.forEach(function(q, qi) {
            var card = document.createElement('div');
            card.className = 'quiz-card';
            card.id = 'quiz-card-' + qi;

            var num = document.createElement('p');
            num.className = 'quiz-card-number';
            num.textContent = 'Question ' + (qi + 1) + ' of ' + questions.length;
            card.appendChild(num);

            var question = document.createElement('p');
            question.className = 'quiz-question';
            question.textContent = q.q;
            card.appendChild(question);

            var opts = document.createElement('div');
            opts.className = 'quiz-options';
            opts.id = 'quiz-opts-' + qi;

            q.options.forEach(function(text, oi) {
                var btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = text;
                btn.addEventListener('click', function() { selectOption(qi, oi); });
                opts.appendChild(btn);
            });

            card.appendChild(opts);

            var feedback = document.createElement('p');
            feedback.className = 'quiz-card-feedback';
            feedback.id = 'quiz-fb-' + qi;
            card.appendChild(feedback);

            wrapper.appendChild(card);
        });
    }

    function selectOption(qi, oi) {
        if (submitted) return;
        selections[qi] = oi;
        warningEl.textContent = '';
        var btns = document.getElementById('quiz-opts-' + qi).querySelectorAll('.quiz-option');
        btns.forEach(function(btn, i) {
            btn.classList.toggle('selected', i === oi);
        });
    }

    submitBtn.addEventListener('click', function() {
        if (submitted) return;

        // Check all answered
        var unanswered = [];
        selections.forEach(function(s, i) { if (s === -1) unanswered.push(i + 1); });
        if (unanswered.length > 0) {
            warningEl.textContent = 'Please answer ' + (unanswered.length === 1
                ? 'question ' + unanswered[0]
                : 'questions ' + unanswered.join(', ')) + ' before submitting.';
            // Scroll to first unanswered
            document.getElementById('quiz-card-' + (unanswered[0] - 1)).scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        submitted = true;
        var score = 0;

        questions.forEach(function(q, qi) {
            var card = document.getElementById('quiz-card-' + qi);
            var btns = document.getElementById('quiz-opts-' + qi).querySelectorAll('.quiz-option');
            var fb = document.getElementById('quiz-fb-' + qi);

            btns.forEach(function(btn) { btn.disabled = true; });

            btns[q.answer].classList.remove('selected');
            btns[q.answer].classList.add('correct');

            if (selections[qi] === q.answer) {
                score++;
                card.classList.add('card-correct');
                fb.textContent = 'Correct!';
                fb.className = 'quiz-card-feedback correct-msg';
            } else {
                btns[selections[qi]].classList.remove('selected');
                btns[selections[qi]].classList.add('incorrect');
                card.classList.add('card-incorrect');
                fb.textContent = 'Not quite — the correct answer is highlighted above.';
                fb.className = 'quiz-card-feedback incorrect-msg';
            }
        });

        // Go straight to results
        showResults(score);
    });

    function showResults(score) {
        container.style.display = 'none';
        resultsPanel.style.display = 'block';

        document.getElementById('quiz-score-label').textContent = score + '/' + questions.length;

        var fraction = score / questions.length;
        var circumference = 326.73;
        var offset = circumference * (1 - fraction);
        setTimeout(function() {
            document.getElementById('quiz-ring-fill').style.strokeDashoffset = offset;
        }, 100);

        var headings = [
            "Room to grow!",
            "Getting there!",
            "Not bad at all!",
            "Impressive!",
            "Well done!",
            "Master Craftsman!"
        ];
        document.getElementById('quiz-results-heading').textContent = headings[score];

        var percentiles = [12, 31, 54, 72, 88, 98];
        var pctText = score === questions.length
            ? 'You scored as well or better than ' + percentiles[score] + '% of people who took this quiz.'
            : 'You scored better than ' + percentiles[score] + '% of people who took this quiz.';
        document.getElementById('quiz-results-percentile').textContent = pctText;

        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    retakeBtn.addEventListener('click', function() {
        resultsPanel.style.display = 'none';
        container.style.display = 'block';
        document.getElementById('quiz-ring-fill').style.strokeDashoffset = 326.73;
        submitBtn.textContent = 'Submit Answers';
        // Re-bind original submit handler by rebuilding
        buildQuiz();
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    buildQuiz();

    // Expose for testing
    if (typeof window !== 'undefined') {
        window.__quiz = {
            questions: questions,
            getSelections: function() { return selections; },
            isSubmitted: function() { return submitted; },
            buildQuiz: buildQuiz
        };
    }
})();
