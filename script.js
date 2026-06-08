const games = [
  {
    title: "Neon Drift",
    category: "Carreras",
    description: "Derrapa entre luces, turbo y curvas imposibles en una pista arcade nocturna.",
    image: "assets/neon-drift.jpg",
    url: "games/play.html?game=drift",
  },
  {
    title: "Crystal Quest",
    category: "Puzzle",
    description: "Resuelve rutas, activa runas y desbloquea templos flotantes en partidas rápidas.",
    image: "assets/crystal-quest.jpg",
    url: "games/play.html?game=crystal",
  },
  {
    title: "Orbit Strike",
    category: "Accion",
    description: "Esquiva asteroides y dispara en oleadas cortas pensadas para jugar en vertical.",
    image: "assets/orbit-strike.jpg",
    url: "games/play.html?game=orbit",
  },
];

const doc = document.documentElement;
const body = document.body;
const feed = document.querySelector("#gameFeed");
const playLayer = document.querySelector("#playLayer");
const gameFrame = document.querySelector("#gameFrame");
const closeGame = document.querySelector("#closeGame");

let activeIndex = 0;
let lastScrollTop = 0;

function setViewportHeight() {
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
}

function renderSlides() {
  const slides = games
    .map(
      (game, index) => `
        <article class="game-slide" style="--image: url('${game.image}')" data-index="${index}">
          <div class="slide-content">
            <div class="game-kicker">${game.category}</div>
            <h1 class="game-title">${game.title}</h1>
            <p class="game-description">${game.description}</p>
            <button class="play-button" type="button" data-play="${index}">Jugar</button>
          </div>
        </article>
      `,
    )
    .join("");

  const dots = `
    <nav class="feed-dots" aria-label="Slides">
      ${games.map((_, index) => `<span class="feed-dot" data-dot="${index}"></span>`).join("")}
    </nav>
  `;

  feed.innerHTML = slides + dots;
}

function setActiveIndex(index) {
  activeIndex = index;
  document.querySelectorAll(".feed-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

function openGame(index) {
  const game = games[index];
  lastScrollTop = feed.scrollTop;
  gameFrame.src = game.url;
  gameFrame.title = game.title;
  playLayer.classList.add("is-open");
  playLayer.setAttribute("aria-hidden", "false");
  body.classList.add("is-playing");
  closeGame.focus({ preventScroll: true });
}

function closeCurrentGame() {
  gameFrame.src = "about:blank";
  playLayer.classList.remove("is-open");
  playLayer.setAttribute("aria-hidden", "true");
  body.classList.remove("is-playing");
  feed.scrollTop = lastScrollTop;
  const button = document.querySelector(`[data-play="${activeIndex}"]`);
  button?.focus({ preventScroll: true });
}

function setupObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        setActiveIndex(Number(visible.target.dataset.index));
      }
    },
    {
      root: feed,
      threshold: [0.55, 0.75],
    },
  );

  document.querySelectorAll(".game-slide").forEach((slide) => observer.observe(slide));
}

function bindEvents() {
  feed.addEventListener("click", (event) => {
    const button = event.target.closest("[data-play]");
    if (!button) return;
    openGame(Number(button.dataset.play));
  });

  closeGame.addEventListener("click", closeCurrentGame);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && playLayer.classList.contains("is-open")) {
      closeCurrentGame();
    }
  });

  window.addEventListener("resize", setViewportHeight, { passive: true });
  window.visualViewport?.addEventListener("resize", setViewportHeight, { passive: true });
}

setViewportHeight();
renderSlides();
setActiveIndex(0);
setupObserver();
bindEvents();
