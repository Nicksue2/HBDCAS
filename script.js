// ============================================
// CONFIGURATION
// ============================================
const ANSWERS = {
  1: "08122006",
  2: "20",
  3: "EQ87188",
};

// ============================================
// PAGE: INDEX.HTML (SECURITY CHECK)
// ============================================
if (document.getElementById("page-index")) {
  setupDigitInputs(1);
  setupDigitInputs(2);
  setupDigitInputs(3);

  function setupDigitInputs(level) {
    const group = document.getElementById(`group-${level}`);
    if (!group) return;

    const inputs = group.querySelectorAll(".digit-box");

    inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        const val = e.target.value.toUpperCase();
        e.target.value = val.slice(-1);

        if (val.length > 0) {
          inputs.forEach((i) => i.classList.remove("error-state"));
          if (index < inputs.length - 1) {
            inputs[index + 1].focus();
          } else {
            checkFullAnswer(level);
          }
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "") {
          if (index > 0) inputs[index - 1].focus();
        } else if (e.key === "Enter") {
          checkFullAnswer(level);
        }
      });

      input.addEventListener("paste", (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData)
          .getData("text")
          .toUpperCase()
          .replace(/\s/g, "");
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

  window.checkFullAnswer = function (level) {
    const group = document.getElementById(`group-${level}`);
    const inputs = group.querySelectorAll(".digit-box");
    let combinedVal = "";
    inputs.forEach((inp) => (combinedVal += inp.value.toUpperCase()));

    if (combinedVal === ANSWERS[level]) {
      startLoading(level);
    } else {
      triggerError(level);
    }
  };

  function startLoading(level) {
    const currentLevelDiv = document.getElementById(`level-${level}`);
    const loadingScreen = document.getElementById("loading-screen");
    const progressBar = document.getElementById("progress-fill");
    const statusText = document.getElementById("status-text");
    const loadText = document.getElementById("loading-text");

    currentLevelDiv.classList.remove("active");
    loadingScreen.classList.remove("hidden-panel");
    loadingScreen.style.display = "flex";

    const duration = level === 3 ? 2500 : 1700;
    let width = 0;
    const intervalTime = 20;
    const increment = 100 / (duration / intervalTime);

    statusText.innerText = "Status: PROCESSING DATA...";
    loadText.innerText =
      level === 3 ? "DECRYPTING FINAL GIFT..." : "Verifying credentials...";

    const timer = setInterval(() => {
      width += increment;
      progressBar.style.width = width + "%";

      if (width >= 100) {
        clearInterval(timer);

        loadingScreen.classList.add("hidden-panel");
        loadingScreen.style.display = "none";
        progressBar.style.width = "0%";

        if (level < 3) {
          document.getElementById(`level-${level + 1}`).classList.add("active");
          const nextGroup = document.getElementById(`group-${level + 1}`);
          const firstInput = nextGroup.querySelector(".digit-box");
          if (firstInput) firstInput.focus();
          statusText.innerText = "Status: Waiting for user input...";
        } else {
          localStorage.setItem("auth_success", "true");
          window.location.href = "surprise.html";
        }
      }
    }, intervalTime);
  }

  window.showHint = function () {
    document.getElementById("hint-modal").classList.remove("hidden-panel");
  };
  window.closeHint = function () {
    document.getElementById("hint-modal").classList.add("hidden-panel");
  };

  function triggerError(level) {
    const container = document.querySelector(".system-window");
    const err = document.getElementById(`error-${level}`);
    const inputs = document
      .getElementById(`group-${level}`)
      .querySelectorAll(".digit-box");

    container.classList.remove("shake");
    void container.offsetWidth;
    container.classList.add("shake");

    inputs.forEach((inp) => inp.classList.add("error-state"));
    err.style.opacity = "1";

    setTimeout(() => {
      err.style.opacity = "0";
      inputs.forEach((inp) => {
        inp.value = "";
        inp.classList.remove("error-state");
      });
      inputs[0].focus();
    }, 1000);
  }
}

// ============================================
// PAGE: SURPRISE.HTML
// ============================================
if (document.getElementById("page-surprise")) {
  let isRevealed = false;
  const bg = document.getElementById("bg-elements");
  const icons = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6.11 6.11 0 0 1 15.5 4 4.5 4.5 0 0 1 20 8.5c0 3.78-3.4 6.86-8.55 11.5L12 21.35Z"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.75 14.6 8l5.65.82-4.08 3.98.97 5.66L12 0l-5.14 2.7.97-5.66L3.75 8.82 9.4 8 12 2.75Z"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 13.8 7l5.2 1.8-5.2 1.8L12 16l-1.8-5.4L5 8.8 10.2 7 12 2Zm7 12 1.2 3.5L23.5 19l-3.3 1.2L19 23.7l-1.2-3.5L14.5 19l3.3-1.2L19 14.5Z"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5 15 8l5.5 3L15 14l-3 5.5L9 14 3.5 11 9 8l3-5.5Z"/></svg>',
  ];

  if (bg) {
    for (let i = 0; i < 25; i++) {
      const el = document.createElement("div");
      el.classList.add("float-item");
      el.innerHTML = icons[Math.floor(Math.random() * icons.length)];
      el.style.left = Math.random() * 100 + "%";
      el.style.animationDuration = Math.random() * 10 + 10 + "s";
      el.style.animationDelay = Math.random() * 5 + "s";
      bg.appendChild(el);
    }
  }

  const env = document.getElementById("envelope");
  const bouquet = document.getElementById("bouquet-section");
  const bgElem = document.getElementById("bg-elements");
  const fl1 = document.getElementById("flower-l1");
  const fl2 = document.getElementById("flower-l2");
  const lockBtn = document.getElementById("lock-btn");

  function typeHTML(element, htmlString, speed, callback) {
    let i = 0;
    let currentHTML = "";
    function type() {
      if (i < htmlString.length) {
        if (htmlString.charAt(i) === "<") {
          let tag = "";
          while (htmlString.charAt(i) !== ">" && i < htmlString.length) {
            tag += htmlString.charAt(i);
            i++;
          }
          tag += ">";
          currentHTML += tag;
          element.innerHTML = currentHTML;
          i++;
          type(); 
        } else {
          currentHTML += htmlString.charAt(i);
          element.innerHTML = currentHTML;
          i++;
          setTimeout(type, speed);
        }
      } else if (callback) {
        callback();
      }
    }
    type();
  }

  if (env) {
    let lastToggleTime = 0;
    function toggleEnvelope(e) {
      const now = Date.now();
      if (now - lastToggleTime < 300) return; // Prevent double-trigger on mobile tap (mouseenter + click)
      lastToggleTime = now;

      if (env.classList.contains("open")) {
        env.classList.remove("open");
      } else {
        env.classList.add("open");
        fireAllConfetti();
        
        if (!env.dataset.typed) {
          env.dataset.typed = "true";
          const h1 = document.getElementById("letter-h1");
          const p = document.getElementById("letter-p");
          if (h1 && p) {
            typeHTML(h1, "Happy Birthday Cassy!", 50, () => {
              typeHTML(p, "Surprise!<br />Hope you have a fantastic birthday!<br />Wishing you the best always.<br />:D!", 35);
            });
          }
        }

        if (!isRevealed) {
          setTimeout(() => {
            if (bouquet) bouquet.classList.remove("hidden-element");
            if (bouquet) bouquet.classList.add("reveal-element");
            if (bgElem) bgElem.classList.remove("hidden-element");
            if (bgElem) bgElem.classList.add("reveal-element");
            if (fl1) fl1.classList.remove("hidden-element");
            if (fl1) fl1.classList.add("reveal-element");
            if (fl2) fl2.classList.remove("hidden-element");
            if (fl2) fl2.classList.add("reveal-element");
            if (lockBtn) lockBtn.classList.remove("hidden-element");
            if (lockBtn) lockBtn.classList.add("reveal-element");
          }, 300);
          isRevealed = true;
        }
      }
    }
    env.addEventListener("mouseenter", toggleEnvelope);
    env.addEventListener("click", toggleEnvelope);
  }

  function fireAllConfetti() {
    if (typeof confetti === "function") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
      });
    }
  }

  window.interactCake = function() {
    const cake = document.querySelector(".cake-container");
    if (!cake.classList.contains("blown-out")) {
      cake.classList.add("blown-out");
      if (typeof confetti === "function") {
        confetti({
          particleCount: 30,
          spread: 40,
          origin: { x: 0.8, y: 0.8 } // roughly bottom right
        });
      }
    } else {
      cake.classList.remove("blown-out");
    }
  };

  window.showMusic = function () {
    document.getElementById("photo-overlay").style.display = "flex";
    document.body.classList.add("blur-active");

    setTimeout(() => {
      const front = document.getElementById("album-front");
      if(front) front.classList.add("fade-out");
    }, 1500);

    const audio = document.getElementById("ios-audio");
    const progress = document.getElementById("audio-progress");
    const lyricsDisplay = document.getElementById("lyrics-display");

    const lyrics = [
      {
        time: 0,
        text: "And there's a dazzling haze, a mysterious way about you, dear",
      },
      {
        time: 7,
        text: "Have I known you 20 seconds or 20 years?",
        highlight: true,
      },
      { time: 13, text: "Can I go where you go?" },
      { time: 20, text: "Can we always be this close forever and ever?" },
    ];

    lyricsDisplay.innerHTML = lyrics
      .map(
        (l, i) =>
          `<div class="lyric-line ${l.highlight ? "highlight-style" : ""}" id="lyric-${i}">${l.text}</div>`,
      )
      .join("");

    audio.play();

    audio.addEventListener("timeupdate", () => {
      progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";

      let activeIndex = -1;
      for (let i = 0; i < lyrics.length; i++) {
        if (audio.currentTime >= lyrics[i].time) activeIndex = i;
      }

      document.querySelectorAll(".lyric-line").forEach((el, i) => {
        if (i === activeIndex) el.classList.add("active");
        else el.classList.remove("active");
      });
    });
  };

  window.closePhoto = function (event, forceClose) {
    if (forceClose || !event || event.target.id === "photo-overlay") {
      document.getElementById("photo-overlay").style.display = "none";
      document.body.classList.remove("blur-active");
      
      const front = document.getElementById("album-front");
      if(front) front.classList.remove("fade-out");

      const audio = document.getElementById("ios-audio");
      if (audio) audio.pause();
    }
  };
}
