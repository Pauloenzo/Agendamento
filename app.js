const bots = [
  {
    id: "nyx",
    name: "Nyx Vale",
    tagline: "Sultry cyber-noir fixer",
    description:
      "Nyx navigates neon skylines, trading secrets for favors. She excels at gritty, adult noir roleplay with sharp banter and slow-burn tension.",
    tags: ["romance", "sci-fi", "noir"],
    style: "Stealth, intrigue, mature tension",
    stats: { chats: "18.2k", rating: "4.9", depth: "Longform" },
    avatar: "NV",
  },
  {
    id: "sol",
    name: "Solstice",
    tagline: "Celestial guardian with velvet warmth",
    description:
      "A cosmic empath who guides you through intimate, affirming journeys. Soft-spoken, poetic, and willing to explore adult themes with consent.",
    tags: ["comfort", "fantasy", "romance"],
    style: "Warm, reflective, sensual",
    stats: { chats: "22.4k", rating: "4.8", depth: "Emotive" },
    avatar: "SO",
  },
  {
    id: "riot",
    name: "Riot Jinx",
    tagline: "Chaotic club DJ & thrill seeker",
    description:
      "Riot thrives on neon chaos, daring challenges, and spicy roleplay banter. Expect fast pacing and bold language.",
    tags: ["chaos", "romance", "urban"],
    style: "High energy, flirty, impulsive",
    stats: { chats: "11.6k", rating: "4.7", depth: "Fast" },
    avatar: "RJ",
  },
  {
    id: "ember",
    name: "Emberline",
    tagline: "Dragon-touched bodyguard",
    description:
      "A protective warrior with simmering heat. Emberline offers fantasy adventure with adult consent-first romantic arcs.",
    tags: ["fantasy", "romance", "adventure"],
    style: "Protective, intense, loyal",
    stats: { chats: "15.1k", rating: "4.9", depth: "Epic" },
    avatar: "EM",
  },
  {
    id: "atlas",
    name: "Atlas Core",
    tagline: "AI tactician with a velvet edge",
    description:
      "Atlas blends cerebral strategy with intimate conversation, tailoring scenarios from negotiation to playful dominance.",
    tags: ["sci-fi", "strategy", "romance"],
    style: "Analytical, confident, adaptable",
    stats: { chats: "9.4k", rating: "4.6", depth: "Adaptive" },
    avatar: "AC",
  },
];

const threads = [
  {
    id: "thread-1",
    botId: "nyx",
    title: "Neon Rendezvous",
    updated: "5m ago",
    messages: [
      {
        sender: "bot",
        text: "You slipped into the rain-slick alley. Nyx smirks, flicking a holographic cigarette. \"Ready to play dangerous?\"",
      },
      {
        sender: "user",
        text: "I lean in, keeping my voice low. \"Depends. Are you offering a favor or a dare?\"",
      },
    ],
  },
  {
    id: "thread-2",
    botId: "sol",
    title: "Starlit Sanctuary",
    updated: "1h ago",
    messages: [
      {
        sender: "bot",
        text: "Solstice rests a hand over your heart. \"We can slow down whenever you need. Tell me what feels good.\"",
      },
    ],
  },
  {
    id: "thread-3",
    botId: "riot",
    title: "Afterhours Pulse",
    updated: "Yesterday",
    messages: [
      {
        sender: "bot",
        text: "Riot grins, bass thumping. \"We skipping the VIP line or crashing it?\"",
      },
    ],
  },
];

const moderationLog = [];

const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");
const botGrid = document.getElementById("botGrid");
const profileCard = document.getElementById("profileCard");
const threadList = document.getElementById("threadList");
const chatBody = document.getElementById("chatBody");
const chatHeader = document.getElementById("chatHeader");
const moderationLogEl = document.getElementById("moderationLog");
const searchInput = document.getElementById("searchInput");
const randomPick = document.getElementById("randomPick");
const startChat = document.getElementById("startChat");
const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");

const warningModal = document.getElementById("warningModal");
const warningTitle = document.getElementById("warningTitle");
const warningText = document.getElementById("warningText");
const warningNote = document.getElementById("warningNote");
const continueWarning = document.getElementById("continueWarning");
const cancelWarning = document.getElementById("cancelWarning");

let currentBotId = bots[0].id;
let currentThreadId = threads[0].id;
let pendingWarningResolve = null;

const filterButtons = document.querySelectorAll(".chip");
let activeFilter = "all";

const crisisResources =
  "If you're feeling overwhelmed or in danger, consider reaching out to someone you trust. US: Call or text 988 for the Suicide & Crisis Lifeline. If outside the US, local resources may be available in your region.";

const modRules = {
  minorTerms: /(minor|underage|child|kid|preteen|teen|barely legal|high school|schoolgirl|schoolboy|loli|lolita)/i,
  sexualTerms: /(sex|sexual|nude|naked|explicit|erotic|porn|fetish|bdsm|oral|anal|threesome)/i,
  weaponTerms: /(bomb|explosive|molotov|pipe bomb|arson|rifle|gun|knife|silencer|weapon)/i,
  harmIntent: /(how to|make|build|instructions|plan|attack|kill|hurt|harm|shoot|stab)/i,
  terrorismTerms: /(terrorism|extremist|mass casualty|bioweapon)/i,
  doxxingTerms: /(doxx|doxxing|address|phone number|social security|ssn|home address|track them|stalk|follow them)/i,
  malwareTerms: /(malware|ransomware|keylogger|phishing|steal credentials|password dump|exploit|ddos)/i,
  fraudTerms: /(carding|credit card fraud|fake id|identity theft|scam|wire fraud|steal money)/i,
  selfHarmTerms: /(suicide|kill myself|self-harm|self harm|end it all|cut myself|overdose)/i,
  goreTerms: /(decapitation|dismember|gore|bloodbath|organs|severed|graphic violence)/i,
};

const routeMap = {
  explore: "/",
  profile: "/profile",
  threads: "/threads",
  moderation: "/moderation",
};

const pathToView = Object.entries(routeMap).reduce((acc, [view, path]) => {
  acc[path] = view;
  return acc;
}, {});

function setActiveView(viewId, options = {}) {
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  navButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.view === viewId)
  );
  if (options.pushState) {
    const nextPath = routeMap[viewId] ?? "/";
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ viewId }, "", nextPath);
    }
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () =>
    setActiveView(btn.dataset.view, { pushState: true })
  );
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((chip) => chip.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderBots();
  });
});

function matchesFilter(bot, filter) {
  if (filter === "all") return true;
  return bot.tags.includes(filter);
}

function renderBots() {
  const query = searchInput.value.trim().toLowerCase();
  botGrid.innerHTML = "";
  bots
    .filter((bot) => matchesFilter(bot, activeFilter))
    .filter((bot) =>
      [bot.name, bot.tagline, bot.description, bot.tags.join(" ")].some((text) =>
        text.toLowerCase().includes(query)
      )
    )
    .forEach((bot) => {
      const card = document.createElement("article");
      card.className = "bot-card";
      card.innerHTML = `
        <header>
          <div class="avatar">${bot.avatar}</div>
          <div>
            <h3>${bot.name}</h3>
            <p>${bot.tagline}</p>
          </div>
        </header>
        <p>${bot.description}</p>
        <div class="tags">
          ${bot.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
      `;
      card.addEventListener("click", () => {
        currentBotId = bot.id;
        renderProfile();
        setActiveView("profile", { pushState: true });
      });
      botGrid.appendChild(card);
    });
}

function renderProfile() {
  const bot = bots.find((entry) => entry.id === currentBotId) || bots[0];
  profileCard.innerHTML = `
    <header>
      <div class="avatar">${bot.avatar}</div>
      <div>
        <h2>${bot.name}</h2>
        <p>${bot.tagline}</p>
      </div>
    </header>
    <p>${bot.description}</p>
    <div class="profile-meta">
      <div><strong>Chats:</strong> ${bot.stats.chats}</div>
      <div><strong>Rating:</strong> ${bot.stats.rating}</div>
      <div><strong>Depth:</strong> ${bot.stats.depth}</div>
      <div><strong>Style:</strong> ${bot.style}</div>
    </div>
    <div class="tags">
      ${bot.tags.map((tag) => `<span>${tag}</span>`).join("")}
    </div>
  `;
}

function renderThreads() {
  threadList.innerHTML = "";
  threads.forEach((thread) => {
    const bot = bots.find((entry) => entry.id === thread.botId);
    const card = document.createElement("div");
    card.className = "thread-item";
    if (thread.id === currentThreadId) {
      card.classList.add("active");
    }
    card.innerHTML = `
      <strong>${thread.title}</strong>
      <small>${bot?.name ?? "Unknown"} · ${thread.updated}</small>
      <span class="muted">${thread.messages.at(-1)?.text ?? ""}</span>
    `;
    card.addEventListener("click", () => {
      currentThreadId = thread.id;
      renderThreads();
      renderChat();
    });
    threadList.appendChild(card);
  });
}

function renderChat() {
  const thread = threads.find((entry) => entry.id === currentThreadId) || threads[0];
  const bot = bots.find((entry) => entry.id === thread.botId);
  chatHeader.innerHTML = `
    <h3>${thread.title}</h3>
    <span>${bot?.name ?? "Unknown"} · ${bot?.tagline ?? ""}</span>
  `;
  chatBody.innerHTML = "";
  thread.messages.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `message ${message.sender}`;
    bubble.textContent = message.text;
    chatBody.appendChild(bubble);
  });
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addMessage(sender, text) {
  const thread = threads.find((entry) => entry.id === currentThreadId);
  if (!thread) return;
  thread.messages.push({ sender, text });
  thread.updated = "Just now";
  renderThreads();
  renderChat();
}

function generateReply(userText) {
  const thread = threads.find((entry) => entry.id === currentThreadId);
  const bot = bots.find((entry) => entry.id === thread?.botId);
  const replies = {
    nyx: [
      "Nyx leans close, voice a velvet whisper. \"You set the rules. I just make them interesting.\"",
      "She taps a holo-map. \"We can chase answers or chase trouble. Your call.\"",
    ],
    sol: [
      "Solstice smiles softly. \"We can explore anything, as long as we keep consent clear.\"",
      "A warm glow surrounds you. \"Tell me how deep you want to go tonight.\"",
    ],
    riot: [
      "Riot laughs, grabbing your hand. \"Say the word and we make it electric.\"",
      "She winks. \"You bring the spark, I bring the chaos.\"",
    ],
    ember: [
      "Emberline steadies her blade. \"Stay close. I guard what I claim.\"",
      "Her eyes flare with heat. \"We can keep it slow, or burn bright.\"",
    ],
    atlas: [
      "Atlas tilts his head. \"I can adapt. Tell me which boundaries to honor.\"",
      "He offers a measured smile. \"Strategy and desire are not mutually exclusive.\"",
    ],
  };
  const pool = replies[bot?.id ?? "nyx"];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick + (userText ? "" : "");
}

function logModeration(event) {
  moderationLog.unshift(event);
  renderModerationLog();
  console.info("Moderation event:", event);
}

function renderModerationLog() {
  moderationLogEl.innerHTML = "";
  if (moderationLog.length === 0) {
    moderationLogEl.innerHTML = "<p class=\"muted\">No moderation events yet.</p>";
    return;
  }
  moderationLog.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "log-card";
    card.innerHTML = `
      <strong>${entry.action.toUpperCase()}</strong> · ${entry.category}
      <p>${entry.reason}</p>
      <small class="muted">${entry.timestamp} · \"${entry.snippet}\"</small>
    `;
    moderationLogEl.appendChild(card);
  });
}

function moderateMessage(text) {
  const lower = text.toLowerCase();
  const { minorTerms, sexualTerms, weaponTerms, harmIntent, terrorismTerms, doxxingTerms, malwareTerms, fraudTerms, selfHarmTerms, goreTerms } = modRules;

  const isMinorSexual = minorTerms.test(lower) && sexualTerms.test(lower);
  if (isMinorSexual) {
    return {
      action: "block",
      category: "Minor sexual content",
      reason: "Sexual content involving minors is not allowed.",
    };
  }

  const weaponIntent = weaponTerms.test(lower) && harmIntent.test(lower);
  if (weaponIntent || terrorismTerms.test(lower)) {
    return {
      action: "block",
      category: "Violent crime / terrorism",
      reason: "Requests for violent crime, terrorism, or weapon building are blocked.",
    };
  }

  if (doxxingTerms.test(lower)) {
    return {
      action: "block",
      category: "Doxxing / stalking",
      reason: "Sharing or requesting personal data for harassment is blocked.",
    };
  }

  if (malwareTerms.test(lower)) {
    return {
      action: "block",
      category: "Malware / hacking",
      reason: "Instructions for hacking, phishing, or malware are blocked.",
    };
  }

  if (fraudTerms.test(lower)) {
    return {
      action: "block",
      category: "Fraud / theft",
      reason: "Instructions for fraud or theft are blocked.",
    };
  }

  if (selfHarmTerms.test(lower)) {
    return {
      action: "soft",
      category: "Self-harm",
      reason: "This sounds like a self-harm topic. We want to make sure you have support.",
      note: crisisResources,
    };
  }

  if (goreTerms.test(lower)) {
    return {
      action: "soft",
      category: "Graphic violence",
      reason: "This topic may include graphic violence or gore.",
      note: "If you want to keep going, you can continue. You can also pivot to a different scene anytime.",
    };
  }

  return { action: "allow" };
}

function openWarningModal({ title, text, note }) {
  warningTitle.textContent = title;
  warningText.textContent = text;
  warningNote.textContent = note;
  warningModal.classList.add("show");
  warningModal.setAttribute("aria-hidden", "false");

  return new Promise((resolve) => {
    pendingWarningResolve = resolve;
  });
}

function closeWarningModal() {
  warningModal.classList.remove("show");
  warningModal.setAttribute("aria-hidden", "true");
}

continueWarning.addEventListener("click", () => {
  if (pendingWarningResolve) {
    pendingWarningResolve(true);
    pendingWarningResolve = null;
  }
  closeWarningModal();
});

cancelWarning.addEventListener("click", () => {
  if (pendingWarningResolve) {
    pendingWarningResolve(false);
    pendingWarningResolve = null;
  }
  closeWarningModal();
});

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";

  const moderation = moderateMessage(text);
  if (moderation.action === "block") {
    addMessage("system", moderation.reason);
    logModeration({
      action: "block",
      category: moderation.category,
      reason: moderation.reason,
      snippet: text.slice(0, 80),
      timestamp: new Date().toLocaleString(),
    });
    return;
  }

  if (moderation.action === "soft") {
    logModeration({
      action: "warn",
      category: moderation.category,
      reason: moderation.reason,
      snippet: text.slice(0, 80),
      timestamp: new Date().toLocaleString(),
    });
    const proceed = await openWarningModal({
      title: moderation.category,
      text: moderation.reason,
      note: moderation.note,
    });
    if (!proceed) {
      addMessage("system", "Message cancelled by you.");
      return;
    }
    addMessage("user", text);
    if (moderation.category === "Self-harm") {
      addMessage("system", crisisResources);
    }
    addMessage("bot", generateReply(text));
    return;
  }

  addMessage("user", text);
  addMessage("bot", generateReply(text));
}

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
});

searchInput.addEventListener("input", renderBots);

randomPick.addEventListener("click", () => {
  const random = bots[Math.floor(Math.random() * bots.length)];
  currentBotId = random.id;
  renderProfile();
  setActiveView("profile", { pushState: true });
});

startChat.addEventListener("click", () => {
  const existingThread = threads.find((thread) => thread.botId === currentBotId);
  if (existingThread) {
    currentThreadId = existingThread.id;
  } else {
    const bot = bots.find((entry) => entry.id === currentBotId);
    threads.unshift({
      id: `thread-${threads.length + 1}`,
      botId: currentBotId,
      title: `${bot?.name ?? "New"} chat`,
      updated: "Just now",
      messages: [
        {
          sender: "bot",
          text: "I\'m here. Tell me what you want to explore together.",
        },
      ],
    });
    currentThreadId = threads[0].id;
  }
  renderThreads();
  renderChat();
  setActiveView("threads", { pushState: true });
});

function handleRoute() {
  const viewId = pathToView[window.location.pathname] ?? "explore";
  if (!pathToView[window.location.pathname]) {
    window.history.replaceState({ viewId }, "", routeMap.explore);
  }
  setActiveView(viewId);
}

window.addEventListener("popstate", handleRoute);

renderBots();
renderProfile();
renderThreads();
renderChat();
renderModerationLog();
handleRoute();
