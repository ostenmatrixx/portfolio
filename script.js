const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el, index) => {
  el.style.transitionDelay = `${index * 90}ms`;
  observer.observe(el);
});

function initMatrixRain() {
  const container = document.getElementById("matrix-rain");
  if (!container) return;

  const canvas = document.createElement("canvas");
  container.innerHTML = "";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const chars = "0123456789";
  const fontSize = 14;
  let cols = 0;
  let drops = [];
  let rafId = null;

  function resize() {
    const rect = container.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
    cols = Math.max(1, Math.floor(canvas.width / fontSize));
    drops = Array.from({ length: cols }, () => Math.random() * -40);
  }

  function draw() {
    ctx.fillStyle = "rgba(12, 18, 14, 0.16)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(170, 255, 205, 0.92)";
    ctx.font = `${fontSize}px "Courier New", monospace`;

    for (let i = 0; i < cols; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = Math.random() * -20;
      }
      drops[i] += 0.72;
    }

    rafId = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);

  // Prevent duplicate loops if this gets called again.
  container.dataset.matrixActive = "1";
  container.dataset.matrixRaf = String(rafId ?? "");
}

async function loadGitHubProjects() {
  const statusEl = document.getElementById("github-status");
  const gridEl = document.getElementById("github-projects");
  if (!statusEl || !gridEl) return;

  const username = "ostenmatrixx";
  const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=30`;
  const pinnedRepos = ["linkedin-job-scraper", "port"];

  try {
    const res = await fetch(apiUrl, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error("GitHub API request failed");
    const repos = await res.json();

    const publicRepos = repos.filter((repo) => !repo.fork);
    const pinned = pinnedRepos
      .map((name) => publicRepos.find((r) => r.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean);
    const fallback = publicRepos
      .filter((repo) => !pinned.some((p) => p.id === repo.id))
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, Math.max(0, 6 - pinned.length));
    const selected = [...pinned, ...fallback].slice(0, 6);

    if (!selected.length) {
      statusEl.textContent = "No public repositories found yet.";
      return;
    }

    gridEl.innerHTML = "";
    selected.forEach((repo) => {
      const card = document.createElement("article");
      card.className = "repo-card";

      const title = document.createElement("h4");
      const link = document.createElement("a");
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = repo.name;
      title.appendChild(link);

      const desc = document.createElement("p");
      desc.textContent = repo.description || "No description provided.";

      const meta = document.createElement("div");
      meta.className = "repo-meta";
      const lang = repo.language || "N/A";
      const stars = repo.stargazers_count ?? 0;
      meta.textContent = `${lang} | ${stars} stars`;

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(meta);
      gridEl.appendChild(card);
    });

    statusEl.textContent = `Showing ${selected.length} pinned/recent repositories from GitHub.`;
  } catch (error) {
    statusEl.textContent = "Could not load GitHub projects right now. Please open the repositories link below.";
  }
}

loadGitHubProjects();
initMatrixRain();
