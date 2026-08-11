// ============================================
// CONFIGURATION
// ============================================
const ANSWERS = {
    1: "08122006", 
    2: "20",       
    3: "CASSY2026" 
};


const PHOTOS = {
    1: { url: "wdbestsis.jpg", caption: "Happy Birthday!" },
    2: { url: "wdbestsis2.jpg", caption: "Best Coworker!" }, 
    3: { url: "wdbestsis.jpg", caption: "Love you!" }
};

// ============================================
// PAGE: INDEX.HTML (SECURITY CHECK)
// ============================================
if (document.getElementById('page-index')) {
    
    setupDigitInputs(1);
    setupDigitInputs(2);
    setupDigitInputs(3);

    function setupDigitInputs(level) {
        const group = document.getElementById(`group-${level}`);
        if(!group) return;

        const inputs = group.querySelectorAll('.digit-box');
        // Levels 1 & 2 are numeric-only (DOB, age); level 3 allows letters (passcode).
        const numericOnly = level !== 3;

        inputs.forEach((input, index) => {
            // Select existing value on focus so re-typing overwrites instead of requiring backspace first.
            input.addEventListener('focus', (e) => e.target.select());

            input.addEventListener('input', (e) => {
                let val = e.target.value.toUpperCase();
                if (numericOnly) {
                    val = val.replace(/[^0-9]/g, '');
                }
                e.target.value = val.slice(-1); 

                if (val.length > 0) {
                    inputs.forEach(i => i.classList.remove('error-state')); 
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus(); 
                    } else {
                        checkFullAnswer(level); 
                    }
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && input.value === '') {
                    if (index > 0) inputs[index - 1].focus();
                } else if (e.key === 'Enter') {
                    checkFullAnswer(level);
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                let text = (e.clipboardData || window.clipboardData).getData('text').toUpperCase().replace(/\s/g,'');
                if (numericOnly) {
                    text = text.replace(/[^0-9]/g, '');
                }
                let currentIndex = index;
                for (let i = 0; i < text.length; i++) {
                    if (currentIndex < inputs.length) {
                        inputs[currentIndex].value = text[i];
                        currentIndex++;
                    }
                }
                checkFullAnswer(level);
            });
        });
    }

    window.checkFullAnswer = function(level) {
        const group = document.getElementById(`group-${level}`);
        const inputs = group.querySelectorAll('.digit-box');
        let combinedVal = "";
        inputs.forEach(inp => combinedVal += inp.value.toUpperCase());

        if (combinedVal === ANSWERS[level]) {
            startLoading(level); 
        } else {
            triggerError(level); 
        }
    };

    function startLoading(level) {
        const currentLevelDiv = document.getElementById(`level-${level}`);
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('progress-fill');
        const statusText = document.getElementById('status-text');
        const loadText = document.getElementById('loading-text');

        currentLevelDiv.classList.remove('active');
        loadingScreen.classList.remove('hidden-panel');
        loadingScreen.style.display = 'flex'; 
        
        const duration = (level === 3) ? 2500 : 1700;
        let width = 0;
        const intervalTime = 20;
        const increment = 100 / (duration / intervalTime);

        statusText.innerText = "Status: processing data...";
        loadText.innerText = (level === 3) ? "Decrypting final gift..." : "Verifying credentials...";

        const timer = setInterval(() => {
            width += increment;
            progressBar.style.width = width + "%";

            if (width >= 100) {
                clearInterval(timer);
                
                loadingScreen.classList.add('hidden-panel');
                loadingScreen.style.display = 'none'; 
                progressBar.style.width = "0%"; 
                
                if (level < 3) {
                    document.getElementById(`level-${level+1}`).classList.add('active');
                    const nextGroup = document.getElementById(`group-${level+1}`);
                    const firstInput = nextGroup.querySelector('.digit-box');
                    if(firstInput) firstInput.focus();
                    statusText.innerText = "Status: waiting for input...";
                } else {
                    localStorage.setItem("auth_success", "true");
                    window.location.href = "surprise.html";
                }
            }
        }, intervalTime);
    }

    window.showHint = function() { 
        document.getElementById('hint-modal').classList.remove('hidden-panel');
    };
    window.closeHint = function() {
        document.getElementById('hint-modal').classList.add('hidden-panel');
    };

    function triggerError(level) {
        const container = document.querySelector('.system-window');
        const err = document.getElementById(`error-${level}`);
        const inputs = document.getElementById(`group-${level}`).querySelectorAll('.digit-box');
        
        container.classList.remove('shake');
        void container.offsetWidth; 
        container.classList.add('shake');
        
        inputs.forEach(inp => inp.classList.add('error-state'));
        err.style.opacity = '1';
        
        setTimeout(() => { 
            err.style.opacity = '0'; 
            inputs.forEach(inp => {
                inp.value = ''; 
                inp.classList.remove('error-state');
            });
            inputs[0].focus(); 
        }, 1000);
    }
}

// ============================================
// PAGE: SURPRISE.HTML
// ============================================
if (document.getElementById('page-surprise')) {
    let isRevealed = false;
    const bg = document.getElementById('bg-elements');

    // Drifting embers — pure CSS dots (styled in style.css), no emoji/images needed.
    if(bg) { 
        for(let i=0; i<25; i++) {
            const el = document.createElement('div');
            el.classList.add('float-item');
            el.style.left = Math.random() * 100 + '%';
            el.style.animationDuration = (Math.random() * 10 + 12) + 's';
            el.style.animationDelay = (Math.random() * 8) + 's';
            bg.appendChild(el);
        }
    }

    const env = document.getElementById('envelope');
    const bouquet = document.getElementById('bouquet-section');
    const bgElem = document.getElementById('bg-elements');
    const fl1 = document.getElementById('flower-l1');
    const fl2 = document.getElementById('flower-l2');
    const lockBtn = document.getElementById('lock-btn');

    if(env) {
        function toggleEnvelope() {
            if (env.classList.contains('open')) {
                env.classList.remove('open');
            } else {
                env.classList.add('open');
                fireAllConfetti();
                if (!isRevealed) {
                    setTimeout(() => {
                        if(bouquet) bouquet.classList.remove('hidden-element');
                        if(bouquet) bouquet.classList.add('reveal-element');
                        if(bgElem) bgElem.classList.remove('hidden-element');
                        if(bgElem) bgElem.classList.add('reveal-element');
                        if(fl1) fl1.classList.remove('hidden-element');
                        if(fl1) fl1.classList.add('reveal-element');
                        if(fl2) fl2.classList.remove('hidden-element');
                        if(fl2) fl2.classList.add('reveal-element');
                        if(lockBtn) lockBtn.classList.remove('hidden-element');
                        if(lockBtn) lockBtn.classList.add('reveal-element');
                    }, 300);
                    isRevealed = true;
                }
            }
        }
        // Only bind hover-to-open on devices that truly support hover (mouse/trackpad).
        // Touch devices rely on click only, avoiding a mouseenter+click double-toggle.
        if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
            env.addEventListener('mouseenter', toggleEnvelope);
        }
        env.addEventListener('click', toggleEnvelope);
    }

    function fireAllConfetti() {
        if (typeof confetti === 'function') {
            const colors = ['#2dd6c4', '#cfa96a', '#e9f1ef'];
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors });
            confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors });
            confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors });
        }
    }

    window.showPhoto = function(id) {
        const img = document.getElementById('instax-img');
        const cap = document.getElementById('instax-caption');
        const overlay = document.getElementById('photo-overlay');
        if(PHOTOS[id]) {
            img.onerror = () => {
                img.onerror = null;
                img.removeAttribute('src');
                img.alt = 'Photo missing — check the filename in PHOTOS';
                cap.innerText = PHOTOS[id].caption + ' (photo not found)';
            };
            img.src = PHOTOS[id].url;
            cap.innerText = PHOTOS[id].caption;
            overlay.style.display = 'flex'; document.body.classList.add('blur-active');
        }
    };

    window.closePhoto = function(event) {
         if (!event || event.target.id === "photo-overlay") {
            document.getElementById('photo-overlay').style.display = 'none';
            document.body.classList.remove('blur-active');
         }
    };

    // Keyboard support for the bouquet blooms (role="button" tabindex="0" in the HTML)
    document.querySelectorAll('.mini-bloom').forEach(bloomEl => {
        bloomEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                bloomEl.click();
            }
        });
    });
}