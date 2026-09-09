/* ==========================================================================
   Rory Grey — The Private Desktop  ·  window manager + content
   Single-page desktop environment. Everything opens in floating windows
   layered over the desktop; nothing navigates away (except the external X link).
   ========================================================================== */

const CONFIG = {
  X_PROFILE_URL: "https://x.com/roryxgrey",   // Rory's X profile (opens in new tab)
  PHONE: "754-444-0974",
  REVIEWS_URL: "https://privatedelights.ch/",
  // Screening inquiry delivery. Create a free form at https://formspree.io,
  // then paste its endpoint here (e.g. "https://formspree.io/f/abcdwxyz").
  // Until this is set, the form shows a "not connected yet" message instead of sending.
  FORM_ENDPOINT: "https://formspree.io/f/moearjqb",
  // Global Snake leaderboard (Firebase Firestore). Leave both blank to keep the
  // leaderboard as per-browser local scores. Do NOT commit a real API key here —
  // this file is public, so a key checked in can be read (and abused) by anyone.
  FIREBASE_PROJECT_ID: "",
  FIREBASE_API_KEY: "",
};

const PHOTOS = Array.from({ length: 20 }, (_, i) => `photos/rg-${String(i + 1).padStart(2, "0")}.jpg`);

/* Retro pixel icons (icons/*.png) mapped to Rory's items */
const ICON_PNG = {
  about: "workspace", gallery: "camera", rates: "spreadsheet_program",
  screening: "sticky_note", etiquette: "text_editor", faq: "news",
  passwords: "password_manager", env: "script_file", finalfinal: "image_file",
  __x: "webpage_file", snake: "snake", paint: "paint",
};
function pngFor(id) {
  if (id && id.startsWith("blog:")) return "icons/text_file.png";
  return "icons/" + (ICON_PNG[id] || "text_file") + ".png";
}
function folderIcon(cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 7 h10 l3 3 h15 v4 H2 Z" fill="#c77aa8" stroke="#7a3b63" stroke-width="1"/>
    <path d="M2 10 h28 v18 H2 Z" fill="#ffbfe0" stroke="#7a3b63" stroke-width="1"/>
    <path d="M2 10 h28 v3 H2 Z" fill="#f79ccb"/></svg>`;
}
function cardIcon(cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="7" y="4" width="15" height="21" rx="2" fill="#fff" stroke="#7a3b63" stroke-width="1.2" transform="rotate(-10 14 14)"/>
    <rect x="11" y="7" width="15" height="21" rx="2" fill="#fff" stroke="#7a3b63" stroke-width="1.2"/>
    <path d="M18.5 20.5S14 17.8 14 14.9a2.2 2.2 0 0 1 4.5-.8 2.2 2.2 0 0 1 4.5.8c0 2.9-4.5 5.6-4.5 5.6Z" fill="#ec4fa0"/></svg>`;
}
function mineIcon(cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="#3d2233" stroke-width="2"><line x1="16" y1="5" x2="16" y2="27"/><line x1="5" y1="16" x2="27" y2="16"/><line x1="8" y1="8" x2="24" y2="24"/><line x1="24" y1="8" x2="8" y2="24"/></g>
    <circle cx="16" cy="16" r="7" fill="#3d2233"/><circle cx="13.5" cy="13.5" r="2" fill="#ffbfe0"/></svg>`;
}
function snakeIcon(cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="#7a3b63"><rect x="5" y="19" width="6" height="6"/><rect x="11" y="19" width="6" height="6"/><rect x="17" y="19" width="6" height="6"/><rect x="17" y="13" width="6" height="6"/><rect x="17" y="7" width="6" height="6" fill="#5a2b49"/></g>
    <circle cx="8" cy="9" r="3" fill="#ec4fa0"/></svg>`;
}
function dolphinIcon(cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <image href="icons/dolphin.jpg" x="9" y="5" width="46" height="46" preserveAspectRatio="xMidYMid slice"/>
    <rect x="9" y="5" width="46" height="46" fill="none" stroke="#0d2255" stroke-width="1"/>
    <rect x="6" y="40" width="14" height="14" fill="#fff" stroke="#000" stroke-width="1.2"/>
    <path d="M10 50 L16 44 M16 44 h-4.5 M16 44 v4.5" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function iconMarkup(id, cls) {
  if (id === "blogfolder" || id === "gamesfolder") return folderIcon(cls);
  if (id === "solitaire") return cardIcon(cls);
  if (id === "minesweeper") return mineIcon(cls);
  if (id === "dolphin") return dolphinIcon(cls);
  return `<img class="${cls || ""}" src="${pngFor(id)}" alt="" draggable="false">`;
}

/* ----------------------------------------------------------------- helpers */
const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ============================== ICON ARTWORK ============================== */
function docIcon(variant) {
  const L = "var(--doc-line)", L2 = "var(--doc-line2)", A = "var(--doc-accent)";
  const fold = variant === "screening" ? A : "var(--doc-fold)";
  let inner = "";
  if (variant === "screening") {
    inner = `
      <rect x="15" y="26" width="20" height="6" fill="none" stroke="${L}" stroke-width="1.3"/>
      <path d="M17 29l2 2 4-4" fill="none" stroke="${A}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="15" y1="41" x2="47" y2="41" stroke="${L}" stroke-width="1.2"/>
      <line x1="15" y1="49" x2="47" y2="49" stroke="${L2}" stroke-width="1.2"/>
      <line x1="15" y1="57" x2="47" y2="57" stroke="${L}" stroke-width="1.2"/>
      <line x1="15" y1="65" x2="38" y2="65" stroke="${L2}" stroke-width="1.2"/>`;
  } else if (variant === "faq") {
    inner = `
      <text x="31" y="52" font-family="Arial Narrow, Arial" font-size="34" font-weight="700"
        fill="${A}" fill-opacity=".22" text-anchor="middle">?</text>
      <line x1="15" y1="60" x2="47" y2="60" stroke="${L2}" stroke-width="1.2"/>
      <line x1="15" y1="67" x2="40" y2="67" stroke="${L2}" stroke-width="1.2"/>`;
  } else if (variant === "etiquette") {
    for (let i = 0; i < 5; i++) {
      const y = 30 + i * 8;
      inner += `<circle cx="16" cy="${y}" r="1.4" fill="${A}"/><line x1="21" y1="${y}" x2="${i % 2 ? 43 : 47}" y2="${y}" stroke="${L}" stroke-width="1.1"/>`;
    }
  } else if (variant === "txt") {
    for (let i = 0; i < 6; i++) { const y = 28 + i * 5; inner += `<line x1="15" y1="${y}" x2="${i === 5 ? 33 : 47}" y2="${y}" stroke="${L}" stroke-width="1"/>`; }
    inner += `<g transform="translate(39,52)"><rect x="0" y="6" width="13" height="10.5" rx="1.4" fill="${A}"/><path d="M2.5 6 v-2.5 a4 4 0 0 1 8 0 V6" fill="none" stroke="${A}" stroke-width="1.5"/><circle cx="6.5" cy="11" r="1.3" fill="#fff"/></g>`;
  } else if (variant === "image") {
    inner = `<rect x="14" y="26" width="34" height="30" fill="var(--doc-tint)" stroke="${L}" stroke-width="1.2"/>
      <circle cx="24" cy="35" r="3.1" fill="${A}"/>
      <path d="M15 55 L26 43 L33 50 L39 45 L47 53 V55 Z" fill="${L2}" stroke="${L}" stroke-width="1"/>
      <text x="31" y="67" font-family="Arial Narrow, Arial" font-size="8" font-weight="700" fill="${L}" text-anchor="middle">JPG</text>`;
  } else { // generic blog / document
    inner = `<line x1="15" y1="30" x2="40" y2="30" stroke="${A}" stroke-width="1.6"/>`;
    for (let i = 0; i < 6; i++) {
      const y = 39 + i * 7;
      inner += `<line x1="15" y1="${y}" x2="${i === 5 ? 38 : 47}" y2="${y}" stroke="${i % 3 === 2 ? L2 : L}" stroke-width="1.1"/>`;
    }
  }
  return `
  <svg class="glyph" viewBox="0 0 62 76" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g>
      <path d="M8 3 h34 l12 12 v58 a1 1 0 0 1 -1 1 H9 a1 1 0 0 1 -1 -1 V4 a1 1 0 0 1 1 -1 Z"
            fill="var(--doc-paper)" stroke="${L}" stroke-width="1.4"/>
      <path d="M42 3 v12 h12 Z" fill="${fold}" stroke="${L}" stroke-width="1.4"/>
      ${inner}
      <path d="M4 8 h4 M4 8 v4" stroke="${L}" stroke-width="1"/>
      <path d="M58 71 h-4 M58 71 v-4" stroke="${L}" stroke-width="1"/>
    </g>
  </svg>`;
}

/* Dock app icons — visually echo the real apps, rendered in-brand */
const DOCK_ART = {
  notes: `<svg viewBox="0 0 54 54"><rect width="54" height="54" rx="12" fill="#fbfbf7"/>
      <path d="M0 12 a12 12 0 0 1 12-12 h30 a12 12 0 0 1 12 12 v3 H0 Z" fill="#f3c33f"/>
      <g stroke="#cfc9b8" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="24" x2="42" y2="24"/><line x1="12" y1="31" x2="42" y2="31"/>
        <line x1="12" y1="38" x2="42" y2="38"/><line x1="12" y1="45" x2="30" y2="45"/></g></svg>`,

  photos: (() => {
    const cols = ["#f6402c", "#fb9c1b", "#f7cf1d", "#4caf4e", "#2ec5c1", "#2e7de0", "#7a45d6", "#e0489e"];
    let petals = "";
    for (let i = 0; i < 8; i++) {
      const a = (i * 45) * Math.PI / 180;
      const cx = 27 + Math.cos(a) * 9.5, cy = 27 + Math.sin(a) * 9.5;
      petals += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="6.6" ry="11" transform="rotate(${i * 45} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${cols[i]}" opacity=".92"/>`;
    }
    return `<svg viewBox="0 0 54 54"><rect width="54" height="54" rx="12" fill="#ffffff"/><g>${petals}</g><circle cx="27" cy="27" r="4.4" fill="#fff"/></svg>`;
  })(),

  stocks: `<svg viewBox="0 0 54 54"><rect width="54" height="54" rx="12" fill="#111114"/>
      <g stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="8,34 16,28 22,31 30,20 38,24 46,12" stroke="#77c98a"/>
        <polyline points="8,44 16,41 22,43 30,37 38,40 46,33" stroke="#5b0c18" opacity=".9"/></g>
      <g stroke="#33343a" stroke-width="1"><line x1="8" y1="47" x2="46" y2="47"/></g></svg>`,

  mail: `<svg viewBox="0 0 54 54"><defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#37a8ff"/><stop offset="1" stop-color="#1c74e6"/></linearGradient></defs>
      <rect width="54" height="54" rx="12" fill="url(#mg)"/>
      <rect x="11" y="16" width="32" height="22" rx="3.5" fill="#fff"/>
      <path d="M11.5 18 L27 30 L42.5 18" fill="none" stroke="#1c74e6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  x: `<svg viewBox="0 0 54 54"><rect width="54" height="54" rx="12" fill="#000"/>
      <path d="M15 14 L25.5 26 L15 40 h4.2 l8.4-11 8 11 H40 L28.7 24.8 L38.6 14 h-4.2 l-7.6 9.9 L23.6 14 Z" fill="#fff"/>
      <path d="M31.6 14 L15 40" stroke="none"/>
      <path d="M18 14 L39 40" stroke="#fff" stroke-width="0"/></svg>`,
};

/* ============================== CONTENT ================================== */
const AR = '<span class="ar">→</span>';

/* --- Blog posts (verbatim from rorygrey.com/blog) --- */
const BLOG = {
  screening_last: {
    title: "Last One About Screening", date: "March 1, 2026",
    body: [
      "Our community has been hit, again, and it always lands in the same place: screening.",
      "From your side, I get it. You are trying to figure out if I'm real, if my digital security is trash, if I'm reckless with data, if I'm manipulative, if I'm law enforcement, or if I'm just sloppy and desperate. From my side, I'm trying to figure out if you're safe, sane, respectful, and capable of hearing the word “no” without turning it into a negotiation.",
      "That tension is not new. It just got sharper after the big site takedowns and the very public reminders that databases can get seized, leaked, or passed around like gossip. When clients believe their legal names could end up in the wrong hands, a lot of them start trying to buy anonymity with vagueness. I understand the instinct. I'm still going to screen you.",
      "Here's my deal, stated plainly.",
      "I do not charge for meet and greets.",
      "I do not accept money in lieu of verification.",
      "I do not “hold” dates for someone who won't provide the information I need to feel safe.",
      "Not because I'm power tripping. Because “trust me” is not a safety plan.",
      "Clients tend to want maximum privacy. Providers tend to want maximum certainty. Those two desires collide in one very specific moment: when a stranger wants access to a woman's body and her private space. You are not just booking time. You are asking someone to take you at your word, let you close distance, and assume you will behave like a decent human being when there is no audience and no consequences.",
      "Most people are decent. The ones who aren't are why screening exists.",
      "And this is the part a lot of clients never fully sit with: when a provider gets harmed, the aftermath is usually a joke. Reporting can mean inviting humiliation, skepticism, and public exposure. It can mean being forced to replay the assault while someone tries to turn her job into the problem. It's a system that protects predators by making the cost of accountability too high for the person who got hurt.",
      "So yes, I advocate for decriminalization. Not because I'm romantic about the industry, but because a world where providers can require real identification, enforce boundaries, and pursue accountability without risking their lives and reputations is objectively safer. Right now, too many “consequences” amount to a community warning about an email address and a username. That is not accountability. That is a sticky note on a fire exit.",
      "This is also why I won't take money as a substitute for screening. Paying me does not prove you are safe. Paying me does not prove you won't violate consent. Money is not a background check. And while I'm here, neither is Facetime.",
      "If screening frustrates you, I'm not here to shame you. I'm asking you to zoom out. The worst realistic outcome for many clients is embarrassment, inconvenience, maybe money lost. The worst outcome for a provider is violence and/or death.",
      "So yes: please be careful. Be skeptical. Ask questions. Protect yourself.",
      "And then allow me the same.",
      "If you can do that, we'll get along just fine. If you can't, there are plenty of providers who run different policies.",
    ],
  },
  happy_to_screen: {
    title: 'You Had Me At: "Happy To Screen"', date: "October 15, 2025",
    body: [
      "I recently received an email that started, “Hello Rory. I saw on your blog that you're interested in mycology. As a fellow amateur mushroom hunter, I thought you'd appreciate that I almost fell off a log this weekend trying to identify a chanterelle.” He went on to introduce himself properly, but that one sentence told me almost everything I needed to know. We hadn't even met, and I was already smiling.",
      "I know the word “screening” sounds horribly clinical, like something you do to ore deposits, not people. But think of it less like a job interview and more like finding the unmarked door to an incredible cocktail bar. The effort of entry is a prelude to the quality of the experience.",
      "Of course, there's the safety layer, the non-negotiable foundation that ensures everyone is who they say they are. But beyond that, it's a simple vibe check. It's my way of filtering for the men who see this as a human connection, not just a transaction.",
      "It's also a simple professional standard, much like in any other bespoke service. A top-tier law firm requires a retainer; a five-star hotel requires a credit card to hold a room. These aren't hurdles; they are the established methods of securing professional time and ensuring everyone is serious. This is our version of that.",
      "The beautiful irony is how much this benefits you. When you take a few moments to introduce yourself properly, it means our time together begins on a note of mutual respect. The trust is established. We can skip the awkward preliminaries and get straight to the good part, the actual connection.",
      "So, no, screening isn't a wall designed to keep you out. It's the velvet rope that ensures the company inside is worth keeping. It's the quiet knock on the unmarked door that leads to a much, much better room.",
      "P.S. All in all, the mushroom guy was a pretty fun-gi. Yes, I just said that. No, I will not be taking questions at this time.",
    ],
  },
  belly_laugh: {
    title: "Things That Have Made Me Genuinely Belly Laugh on a Date", date: "October 13, 2025",
    sections: [
      ["The Accidental Philosopher", "He spent twenty minutes explaining why Nietzsche would have been “absolutely insufferable on Tinder” before realizing he'd knocked over his wine glass with a particularly enthusiastic hand gesture. It was the seamless transition from existential critique to muttering “God is dead…. and so is this tablecloth” that did it for me. There's something about watching a man intellectually implode in real time while simultaneously trying to blot Cabernet from white linen that feels unnervingly symbolic of the entire dating experience."],
      ["The Trivia Night Hero", "It was trivia night in the bar we were at, and he insisted he was “useless at trivia.” Five rounds in, the final question was about obscure 90s cartoon theme songs. Without hesitation, he slammed the table and yelled, “That's from HEY ARNOLD!” Everyone stared at him like he'd just cured a disease. I've never seen such pure, unfiltered pride. He basked in that glory for the rest of the night, like he'd personally avenged every wrong answer before it. It was impossible not to cheer for him."],
      ["The Napkin Architect", "Mid-conversation about childhood dreams, he suddenly grabbed a napkin and sketched his eight-year-old self's design for a “practical submarine house.” This architectural marvel featured a “fish-viewing room” and an “emergency pizza delivery hatch.” I'm still not entirely sure if the charming part was the childlike enthusiasm or the absolute conviction with which a grown man defended the structural integrity of a dwelling designed by someone whose primary architectural influences were SpongeBob and an unopened physics textbook."],
      ["The Pronunciation Confession", "After thirty minutes of discussing Camus, I leaned in conspiratorially and whispered, “I need to tell you something... I've only ever read him, never heard his name spoken aloud. I've been mentally calling him 'Cay-muss' for years.” The look of profound relief when he admitted that he'd once pronounced “paradigm” as “para-dig-em” in a college seminar created the kind of bond typically reserved for people who've helped each other bury bodies. Nothing accelerates intimacy quite like mutual intellectual mortification."],
      ["The Menu Conspiracy Theorist", "He developed an elaborate theory about why the menu listed a “market price” for salmon (clearly a front for an underground salmon cartel) but specified exact prices for more expensive dishes. His deadpan delivery of increasingly outlandish salmon-trafficking scenarios, complete with witness protection for “fish who flip,” revealed a mind delightfully untethered from conventional humor…. but possibly also… from reality itself. The entire restaurant experience became considerably more entertaining when viewed as an elaborate seafood mafia front."],
      ["The Unplanned Swimming Lesson", "Attempting to appear outdoorsy and adventurous, he suggested we take a canoe out on the lake. His confidence lasted precisely until the midpoint of the pond, where he confessed he'd never actually been in a canoe before but “had watched a lot of nature documentaries on YouTube.” The capsize that followed, and the way he surfaced from the water to immediately offer a detailed critique of the canoe's “clearly defective design,” was a masterclass in maintaining dignity while soaking wet and clearly out of one's depth, both literally and metaphorically. There's an undeniable charm in watching someone's ego and their clothes cling desperately to their body at the same time."],
      ["The Mystery of the Vanishing Suit Jacket", "One minute, he was sitting across from me in a sharp navy-blue suit. The next, his jacket was gone. I didn't see him take it off, and neither did he. It just… vanished."],
    ],
  },
  heels_advocate: {
    title: "Heel's Advocate", date: "January 23, 2025",
    body: [
      "It started with a heel's last gasp of structural integrity, a rather dramatic way for an otherwise reliable Jimmy Choo to announce its retirement.",
      "The scene was meant to be a symphony of urban sophistication: a rooftop restaurant perched above the city's twinkling grid, vintage champagne breathing in anticipation, and me, theoretically gliding toward my waiting companion like some sort of metropolitan goddess. Instead, gravity decided to remind me of its unconditional authority with a crisp, clean snap.",
      "There's something deliciously humbling about holding a $700 shoe aloft like some sort of defeated warrior, its broken heel a battle wound from the savage warfare of city sidewalks. “Congratulations,” I announced to my date, who stood watching this impromptu performance with barely concealed amusement, “you've unlocked the barefoot bohemian expansion pack of this evening's entertainment.”",
      "He proved himself admirably adaptable, transforming instantly from polished dinner companion to amateur cobbler as we huddled over the fallen soldier. A Good Samaritan offered up a safety pin, the universal Band-Aid of wardrobe malfunctions, which lasted approximately 2.5 steps before surrendering to physics with all the dramatic flair of a tiny metallic martyr.",
      "By the time we reached our table, we'd developed the kind of conspiratorial rapport that only comes from shared public absurdity. The champagne, sensing our newfound immunity to pretense, revealed itself to be corked, because why should footwear be the only thing with questionable taste that evening?",
      "The dessert, a gravitationally ambitious creation that looked like Gaudi had fever-dreamed in chocolate, completed our evening's descent into beautiful chaos by collapsing at the mere suggestion of my spoon. “Of course,” I managed between gasps of laughter, “because nothing says 'memorable evening' quite like architectural dessert failure.”",
      "The night became a master class in elegant disaster, each mishap adding another layer to our shared understanding that perfection is just controlled chaos wearing expensive shoes, which, in my case, had already abandoned ship.",
      "The next morning, padding around in his borrowed dress shoes like a child playing dress-up in reverse, I realized something profound about the architecture of memorable evenings. They're built not on the careful foundation of plans, but on the beautiful rubble of their collapse. Every broken heel, every corked bottle, every fallen dessert becomes a brick in something far more interesting than the original blueprint ever intended.",
      "In the end, what lingered wasn't the sting of plans gone awry, but the delicious irony of finding authenticity in malfunction. Some nights are meant to be perfectly imperfect, teaching us that the best stories often start with catastrophe and end with borrowed shoes.",
      "After all, any evening that begins with a broken heel and ends with you wearing men's size 12 dress shoes isn't just a date, it's a parable about embracing the unscripted poetry of disaster.",
    ],
  },
  being_present: {
    title: "Privilege Of Being Present", date: "December 16, 2024",
    body: [
      "There's an undeniable thrill to being escorted into one of those restaurants where even the water has a backstory and the ceiling appears to have been designed specifically for Instagram's golden hour. The kind of place where the maître d' pronounces your name like it's a rare French poem.",
      "I've done the dance of luxury dating, sailed through those evenings where someone clearly consulted a team of experts to orchestrate the perfect night. Private chef's tables where each micro-green has been placed with tweezers, sunset yacht cruises that make the city skyline look like it's showing off just for us, gallery openings where the champagne flows as freely as the pretentious art criticism.",
      "But here's what they don't tell you in the handbook of high-end romance: sometimes the most electric connections happen when you're both hiding from unexpected rain under a shop awning, sharing the world's most mediocre coffee and discovering you both have the same obscure fear of the sound that balloon animals make when you twist them.",
      "I appreciate the grand gestures, it speaks to effort, to intention, to someone's desire to create something memorable. But I'm equally charmed by the person who can turn an impromptu detour into an adventure, who sees the humor in a spectacularly failed omelet, who makes waiting for our delayed flight feel like we're co-starring in our own indie film.",
      "The truth about connection isn't written in reservation books or scored by violin quartets. It lives in those unscripted moments when you both quote the same obscure movie line simultaneously, or when you discover you share the same weird habit of dancing a little when the food is fire. It's finding someone who gets why you find mycology so damn interesting or understands your passionate defense of Oxford commas.",
      "Don't mistake this for settling. I'm not suggesting we should aim lower. I'm saying aim truer. Because while I can appreciate the ballet of a perfectly executed tasting menu, I'm just as impressed by someone who can turn grocery shopping into an odyssey of discovery or make a Tuesday evening feel like New Year's Eve just by being entirely, authentically present.",
      "So yes, dazzle me with your carefully curated evening if you like. I'll appreciate the choreography, admire the production values, savor every perfectly timed moment. But know that what really captivates me isn't the price tag on the experience, it's the wealth of genuine connection, the luxury of being truly seen, the rare currency of moments that can't be planned or purchased.",
      "After all, in the complex algebra of attraction, authenticity is the variable that changes everything. But also... so is... your mom. :)",
    ],
  },
};

function renderArticle(post) {
  let body = "";
  if (post.sections) {
    body = post.sections.map((s, i) => `${i === 0 ? "" : ""}<h2>${esc(s[0])}</h2><p>${esc(s[1])}</p>`).join("");
  } else {
    body = post.body.map((p, i) => `<p class="${i === 0 && !post.sections ? "drop" : ""}">${esc(p)}</p>`).join("");
  }
  return `<article class="article">
    <button class="back" data-close>← Back to the Journal</button>
    <div class="dispatch">§ Dispatch</div>
    <h1>${esc(post.title)}</h1>
    <div class="date">${esc(post.date)}</div>
    <div class="body">${body}</div>
    <div class="end">❧</div>
  </article>`;
}

/* --- Section content --- */
function renderAbout() {
  return `<div class="doc">
    <div class="doc-head">
      <div><div class="kicker">§ Feature — Profile</div><h1>About Me</h1></div>
      <div class="head-num">01</div>
    </div>
    <p class="lede">I've never been particularly interested in being everyone's cup of tea. Frankly, that sounds exhausting.</p>
    <div class="note-meta">
      <div style="grid-column:1 / -1;border-right:0"><div class="k">Based In</div><div class="v">Las Vegas, Nevada</div></div>
    </div>
    <div class="section-label"><span class="n">02</span><span class="t">A Longer Reading</span></div>
    <p>I like a man who appreciates anticipation, can keep up with a little intellectual foreplay, and knows there are worse things than accidentally losing an afternoon together. Someone curious enough to enjoy the conversation just as much as everything that happens when we eventually stop talking.</p>
    <p>For me, the best encounters don't feel rehearsed or transactional. They unfold naturally. Maybe we have a few stolen hours together, maybe we disappear for a weekend, or maybe it's simply one of those deliciously impulsive evenings that leaves us both wondering when we can do it again. Whatever brings us together, while you're with me, you have my attention. I'm not watching the clock, checking my phone, or mentally somewhere else. For that little pocket of time, we get to create a world of our own.</p>
    <p>I'm feminine, affectionate, playful, and naturally sensual, but what tends to surprise people is how easy I am to be around. I can dress for the room, hold my own in intelligent conversation, and behave beautifully at dinner. I even know which fork to use. Probably.</p>
    <p>But I'm equally happy barefoot, laughing at something inappropriate, and stealing your side of the bed later.</p>
    <p class="pull">“For that little pocket of time, we get to create a world of <span>our own</span>.”</p>
    <p>There's a genuine girlfriend quality to the way I connect with someone. Not because I'm trying to manufacture intimacy, but because warmth, curiosity, affection, and physical chemistry are simply how I'm wired. If I like you, you'll know it. There will be lingering eye contact, absentminded touches, a mischievous smile when my mind wanders somewhere it probably shouldn't, and that unmistakable feeling that neither of us is quite ready for the evening to end.</p>
    <p>I'm just as comfortable accompanying you to an elegant dinner or black-tie event as I am escaping somewhere neither of us knows anyone. I'm curious about people and endlessly interested in how things work, so conversation with me has a tendency to wander delightfully. Tell me what you're building, what you're obsessed with lately, the strange rabbit hole you fell down at two in the morning, or the place you've always wanted to disappear to for a few days.</p>
    <p>Bonus points if you can teach me something I don't know. Fair warning, though: I will ask follow-up questions.</p>
    <p>And once the door closes behind us, we can decide together where the rest of the evening goes.</p>
    <div class="section-label"><span class="n">03</span><span class="t">By Way of Particulars</span></div>
    <div class="particulars">
      <div class="row"><div class="k">Personality</div><p>Warm, curious, and generally well-behaved in public. I like smart conversation, inappropriate jokes, and people who don't take themselves so seriously that dinner starts feeling like a board meeting.</p></div>
      <div class="row"><div class="k">Interests</div><p>Airplanes, engines, games, cybersecurity, road trips, good music, taking things apart to see how they work, and falling into rabbit holes with absolutely no respect for bedtime.</p></div>
      <div class="row"><div class="k">Contradictions</div><p>Dresses up beautifully, swears casually. Loves a plan, regularly ignores it. Very feminine, deeply nosy about machinery. Excellent manners, questionable jokes.</p></div>
      <div class="row"><div class="k">Direct Line</div><p>${CONFIG.PHONE}</p></div>
    </div>
    <p style="margin-top:22px;font-size:12px;color:rgba(11,11,10,.6)">Discretion is absolute. So is respect for one another's boundaries and privacy. Any consideration exchanged is solely for my time and companionship.</p>
    <button class="editorial-cta" data-open="screening">Make an Introduction ${AR}</button>
  </div>`;
}

function renderRates() {
  const std = [["1 Hour", "$700"], ["1½ Hours", "$1,000", "The minimum for first-time friends."],
    ["2 Hours", "$1,250"], ["3 Hours", "$1,750"], ["4 Hours", "$2,250", "Dates 4 hours and longer require some time out of the room."],
    ["6 Hours", "$3,000"], ["12 Hours", "$5,000"], ["Couples", "$1,000 / hr"], ["Additional Hours", "+$600 / hr"]];
  const ext = [["12 Hours", "$5,000", "FMTY — 12hr minimum + flight & hotel. Please inquire."],
    ["24 Hours", "$7,500"], ["36 Hours", "$9,500"], ["48 Hours", "$13,000"]];
  const virt = [["15 Mins — Texting", "$150"], ["20 Mins — FaceTime", "$250"]];
  const line = ([lab, price, note]) => `<div class="rate-line"><span class="lab">${lab}</span><span class="price"><span class="up">▲</span>${price}</span>${note ? `<span class="rate-note">${note}</span>` : ""}</div>`;
  return `<div class="rates">
    <div class="ticker"><span class="sym"><b>RG</b> · LAS VEGAS, NEVADA</span><span class="arrow">RATES · THE TERMS</span></div>
    <div class="rate-group"><h3><span class="n">01</span><span class="t">Standard</span></h3>${std.map(line).join("")}</div>
    <div class="rate-group"><h3><span class="n">02</span><span class="t">Extended / FMTY</span></h3>${ext.map(line).join("")}</div>
    <div class="rate-group"><h3><span class="n">03</span><span class="t">Virtual</span></h3>${virt.map(line).join("")}</div>
    <p class="rate-foot">I travel well. Pack lightly, too. A deposit holds the date. Travel is arranged sensibly. Everything else, we discuss like adults.<br>Consideration is solely for my time and companionship.</p>
    <button class="editorial-cta" data-open="screening">Request an Engagement ${AR}</button>
  </div>`;
}

const ETIQUETTE = [
  ["First Contact", "Tell me a little about yourself and what you have in mind for our time together. Please keep correspondence tasteful. I do not engage in explicit conversation by text, before or after screening. Messages that cross that line will be blocked without response."],
  ["When We Meet", "I'll dress appropriately for our plans, whether that means cocktails, black tie, or something considerably more casual. If you have a preference, just let me know beforehand."],
  ["The Gift", "Any consideration is for my time and companionship only. Please have my gift in an unsealed envelope on the bathroom counter when I arrive, or after you arrive. No discussion, no awkwardness, no impromptu accounting session. Once it's handled, we can forget about it entirely."],
  ["Discretion", "What happens between us stays between us. Your privacy is important to me, and I expect the same consideration in return."],
  ["Please Wash Your Hands", "Yes, this gets its own section. Steering wheels. Door handles. Phones. That sandwich you ate earlier. Now you're thinking about it too. Twenty seconds with soap and I'll be considerably more enthusiastic about where those hands go next."],
  ["Chemistry & Boundaries", "I don't work from a predetermined script or checklist. What feels right depends on the chemistry, energy, and comfort between us in the moment. Nothing is ever assumed, and nothing is guaranteed. We'll communicate, read the room, and let things unfold naturally. A “no” never needs negotiating, from either of us. Mutual comfort and respect come first."],
  ["Drinks", "I'm happy to share a drink with you. I simply ask that anything I'm drinking remain sealed until I'm there to see it opened."],
];

function renderEtiquette() {
  const items = ETIQUETTE.map(([t, b], i) => `<details ${i === 0 ? "open" : ""}>
    <summary><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="ttl">${esc(t)}</span><span class="pm"></span></summary>
    <div class="body"><p>${esc(b)}</p></div></details>`).join("");
  return `<div class="doc">
    <div class="doc-head"><div><div class="kicker">§ House Rules</div><h1>Good Manners<br>Are Sexy.</h1></div><div class="head-num">03</div></div>
    <div class="rules">${items}</div>
    <div style="border:1px solid var(--line);padding:26px 22px;margin-top:28px;text-align:center">
      <div class="micro" style="color:var(--accent)">That's Really It</div>
      <p class="disp" style="font-size:clamp(24px,3.6vw,40px);margin:12px 0">Be kind. Be clean.<br>Be discreet. Communicate.</p>
      <p style="font-size:13px;color:rgba(11,11,10,.7)">And please don't make things weird. I'll handle the rest.</p>
    </div>
  </div>`;
}

const FAQ = [
  ["Do you require screening?", [
    "Yes.",
    "It is not personal. In fact, it is specifically designed to determine that you are, in fact, a person.",
    "Screening is required for all new gentlemen. I keep the process as simple and discreet as possible, and once it is done, we never have to have this deeply thrilling administrative experience together again.",
  ]],
  ["How seriously do you take discretion?", [
    "Very. Loose lips sink ships, careers, marriages, reputations, and occasionally group chats.",
    "My professional reputation depends on being discreet, so your information stays private. Screening exists for safety, not because I am assembling a corkboard with red string in my spare bedroom.",
  ]],
  ["Do you require a deposit?", [
    "Yes. A deposit is required to reserve our time together and is applied toward your consideration.",
    "This protects my schedule and confirms that we are both serious about meeting.",
    "Capitalism remains undefeated.",
  ]],
  ["What is your minimum booking?", [
    "For new gentlemen, 90 minutes.",
    "One-hour dates are reserved for gentlemen I already know. There are benefits to tenure, apparently.",
  ]],
  ["Do you offer incall and outcall?", [
    "Yes.",
    "For outcalls, I'm happy to meet you at a reputable hotel or another appropriate location.",
    "For incalls, details are provided after confirmation because, despite everything you have read thus far, I possess at least one survival instinct.",
  ]],
  ["Do you travel?", [
    "Enthusiastically.",
    "I am remarkably easy to convince that I need to be on an airplane headed somewhere interesting.",
    "Travel arrangements require advance notice, a deposit, and travel expenses. Longer engagements are especially welcome because flying across the country for 90 minutes would suggest that neither of us understands logistics.",
  ]],
  ["Can I request what you wear?", [
    "Absolutely.",
    "Tell me the general idea, color, occasion, or aesthetic you have in mind. I enjoy dressing for the occasion and am perfectly willing to accept creative direction.",
    "I reserve the right to veto fedoras.",
  ]],
  ["Can I contact you between dates?", [
    "Of course.",
    "I genuinely enjoy hearing from gentlemen I've gotten to know. Send me something funny. Tell me about your trip. Show me the weird thing you found at an antique store.",
    "Just remember that I have a life outside of Rory and occasionally wander away from my phone.",
  ]],
  ["What if I need to cancel or reschedule?", [
    "Give me as much notice as possible and please review my cancellation policy for the boring but necessary particulars.",
  ]],
  ["Can I send you a gift?", [
    "Yes, although gifts are never expected.",
    "I am very fond of thoughtful things, particularly when they suggest you remembered some tiny detail I mentioned six months ago.",
    "Unfortunately, this means attentiveness is an extremely effective form of bribery.",
  ]],
  ["So how exactly did you end up doing this?", [
    "A radioactive spider bit me inside a dildo factory.",
  ]],
];

function renderFaq() {
  const items = FAQ.map(([q, a], i) => {
    const body = (Array.isArray(a) ? a : [a]).map((p) => `<p>${esc(p)}</p>`).join("");
    return `<details ${i === 0 ? "open" : ""}>
    <summary><span class="num">${String(i + 1).padStart(2, "0")}</span><span class="ttl">${esc(q)}</span><span class="pm"></span></summary>
    <div class="body">${body}</div></details>`;
  }).join("");
  return `<div class="doc">
    <div class="doc-head"><div><div class="kicker">§ Frequently Asked</div><h1>Questions,<br>Answered.</h1></div><div class="head-num">04</div></div>
    <div class="rules">${items}</div>
  </div>`;
}

function renderGallery() {
  const tiles = PHOTOS.map((src, i) => `<button class="tile" data-photo="${i}" aria-label="Open photograph ${i + 1}">
    <img src="${src}" alt="Rory Grey — photograph ${i + 1}" loading="lazy" />
    <span class="cap">FIG. ${String(i + 1).padStart(2, "0")}</span></button>`).join("");
  return `<div class="gallery">
    <div class="gallery-head"><div><div class="kicker">§ Portfolio</div><h1>Gallery</h1></div><div class="count">${PHOTOS.length} PLATES</div></div>
    <div class="grid">${tiles}</div>
  </div>`;
}

function renderContact() {
  return `<div class="doc">
    <div class="mail-head">
      <div class="mail-avatar"><img src="${PHOTOS[0]}" alt="Rory Grey"></div>
      <div class="mail-from"><div class="n">RORY GREY</div><div class="e">Correspondence · Las Vegas, Nevada</div></div>
    </div>
    <div class="doc-head" style="border:0;margin-bottom:6px;padding:0"><div><div class="kicker">§ Correspondence</div><h1>A Note,<br>If You Must.</h1></div></div>
    <p class="lede">For anything about an engagement, the inquiry form is where we start. The methods below are for the rest.</p>
    <div class="methods">
      <div class="m"><span class="k">Signal / Telephone</span><span class="v">${CONFIG.PHONE}</span></div>
      <div class="m"><span class="k">Email</span><span class="v small">By introduction — provided after screening</span></div>
      <div class="m"><span class="k">Correspondence Address</span><span class="v small">Provided privately, upon request</span></div>
    </div>
    <p style="font-size:13px;color:rgba(11,11,10,.7)">For anything regarding an engagement, the inquiry form is the proper place to begin.</p>
    <button class="editorial-cta" data-open="screening">Open the Inquiry Form ${AR}</button>
    <p class="micro" style="margin-top:26px;color:rgba(11,11,10,.5);letter-spacing:.14em">I reply as promptly as life allows. Discretion, both ways, is assumed.</p>
  </div>`;
}

function renderScreening() {
  return `<form class="form" id="screeningForm" novalidate>
    <input type="hidden" name="_subject" value="New screening inquiry — RoryGrey.com">
    <div class="doc-head" style="padding:0 0 14px"><div><div class="kicker">§ Screening — An Inquiry</div><h1>Begin With<br>An Introduction.</h1></div><div class="head-num">05</div></div>
    <p class="intro">Tell me a little about yourself and the time you're imagining. Screening helps me know a little about who I'm meeting before we disappear into our own world for a while. I reply personally.</p>
    <fieldset>
      <legend><span>01</span> Contact + Appointment</legend>
      <div class="field-grid">
        <label><span>Legal name *</span><input name="legalName" autocomplete="name" required></label>
        <label><span>Age *</span><input name="age" type="number" min="21" required></label>
        <label><span>Phone number *</span><input name="phone" type="tel" autocomplete="tel" required></label>
        <label><span>Email address *</span><input name="email" type="email" autocomplete="email" required></label>
        <label><span>City + state *</span><input name="cityState" required></label>
        <label><span>Occupation / industry *</span><input name="occupation" required></label>
        <label><span>Preferred date *</span><input name="date" type="date" required></label>
        <label><span>Preferred start time *</span><input name="time" type="time" required></label>
        <label><span>Length of visit *</span><select name="length" required><option value="" disabled selected>Select</option><option>90 Minutes</option><option>2 Hours</option><option>4 Hours</option><option>8 Hours</option><option>Overnight</option><option>Something Longer</option></select></label>
        <label><span>Incall or outcall? *</span><select name="locationType" id="locationType" required><option value="incall">Incall</option><option value="outcall">Outcall</option></select></label>
        <label class="full" id="hotelField" hidden><span>Hotel or location *</span><input name="hotel"></label>
      </div>
    </fieldset>
    <fieldset>
      <legend><span>02</span> Screening Method</legend>
      <label class="full"><span>Preferred screening method *</span><select name="method" id="method" required>
        <option value="provider">Provider reference</option>
        <option value="linkedin">LinkedIn / professional verification</option>
        <option value="employment">Employment verification</option>
        <option value="reviews">Reviews</option></select></label>
      <div id="methodDetail" style="margin-top:16px"></div>
    </fieldset>
    <fieldset>
      <legend><span>03</span> A Little More</legend>
      <label class="full"><span>What does an enjoyable date look like to you?</span><textarea name="idealDate" rows="4"></textarea></label>
      <label class="full"><span>If you replace every part of an axe, is it the same axe?</span><textarea name="axe" rows="3"></textarea></label>
    </fieldset>
    <button type="submit" class="submit">Send My Introduction ${AR}</button>
    <div id="screeningNotice"></div>
  </form>`;
}

function renderPasswords() {
  return `<div class="gifbox"><img src="gifs/watching.gif" alt="" draggable="false"></div>`;
}

function renderEnv() {
  return `<div class="gifbox"><img src="gifs/absolutely-not.gif" alt="" draggable="false"></div>`;
}

function renderFinalFinal() {
  return `<div class="photo-view">
    <div class="frame"><img src="photos/final-final.jpg" alt="Rory Grey"></div>
    <div class="cap"><span>Final_Final_REAL_Final_v7.jpg</span><span>© Rory Grey</span></div>
  </div>`;
}
function mountFinalFinal(node) {
  const img = node.querySelector(".photo-view img");
  img.addEventListener("error", () => {
    const frame = img.closest(".frame");
    if (frame) frame.innerHTML = '<div class="missing">Save the chosen photo as <code>photos/final-final.jpg</code> in the project folder and it will appear here.</div>';
  });
}

function renderPaint() {
  return `<img class="paint-img" src="paint/rory-paint.jpg" alt="Rory — untitled - Paint" draggable="false">`;
}

/* --- App registry --- */
const APPS = {
  paint: { tag: "", title: "untitled - Paint", num: "", w: 486, h: 648, render: renderPaint, fixed: true, cls: "paint" },
  passwords: { tag: "§ System", title: "Passwords.txt", num: "", w: 504, h: 548, render: renderPasswords, fixed: true },
  env: { tag: "§ System", title: ".env", num: "", w: 504, h: 548, render: renderEnv, fixed: true },
  finalfinal: { tag: "§ Image", title: "Final_Final_REAL_Final_v7.jpg", num: "▦", w: 460, h: 560, render: renderFinalFinal, onMount: mountFinalFinal, fixed: true },
  screening: { tag: "§ Screening", title: "Screening", num: "05", w: 720, h: 640, render: renderScreening, onMount: mountScreening },
  etiquette: { tag: "§ House Rules", title: "Etiquette", num: "03", w: 720, h: 620, render: renderEtiquette },
  faq: { tag: "§ Frequently Asked", title: "FAQ", num: "04", w: 700, h: 600, render: renderFaq },
  about: { tag: "§ Notes — Profile", title: "About", num: "01", w: 720, h: 640, render: renderAbout },
  gallery: { tag: "§ Photos", title: "Gallery", num: "▦", w: 860, h: 660, render: renderGallery, onMount: mountGallery },
  rates: { tag: "§ Stocks", title: "Rates", num: "02", w: 620, h: 640, render: renderRates },
  blogfolder: { tag: "§ The Journal", title: "Blog Posts", num: "", w: 560, h: 440, render: () => renderFolder("blogfolder"), contents: [] },
  snake: { tag: "§ Games", title: "Snake", num: "", w: 344, h: 640, render: renderSnake, onMount: mountSnake },
};
Object.keys(BLOG).forEach((k) => {
  APPS["blog:" + k] = { tag: "§ The Journal", title: BLOG[k].title, num: "", w: 680, h: 640, render: () => renderArticle(BLOG[k]) };
});
APPS.blogfolder.contents = Object.keys(BLOG).map((k) => "blog:" + k);

function renderFolder(folderId) {
  const ids = (APPS[folderId] && APPS[folderId].contents) || [];
  const items = ids.map((id) => `<button class="folder-item" data-open="${id}">
      <span class="fic">${iconMarkup(id, "")}</span>
      <span>${esc(APPS[id] ? APPS[id].title : id)}</span></button>`).join("");
  return `<div class="folder-view">${items}</div>
    <div class="folder-status"><span>${ids.length} object(s)</span><span>${esc(APPS[folderId].title)}</span></div>`;
}

/* ============================== WINDOW MANAGER =========================== */
const windowLayer = document.getElementById("windowLayer");
const openWindows = new Map();     // id -> {node, app, restore}
let zTop = 100;
let activeId = null;

function focusWindow(id) {
  const w = openWindows.get(id); if (!w) return;
  zTop += 1; w.node.style.zIndex = zTop;
  openWindows.forEach((ww, iid) => ww.node.classList.toggle("inactive", iid !== id));
  activeId = id;
  taskActive(id);
}

function openApp(id) {
  const app = APPS[id]; if (!app) return;
  if (openWindows.has(id)) { const w = openWindows.get(id); w.node.classList.remove("min-hidden"); w.node.style.display = "flex"; focusWindow(id); return; }

  const vw = window.innerWidth, vh = window.innerHeight;
  const compact = document.body.classList.contains("compact");
  const win98 = document.body.classList.contains("win98");
  const topMin = win98 ? 6 : 40;
  const bottomReserve = win98 ? (compact ? 42 : 48) : 96;
  const availH = vh - topMin - bottomReserve;
  let width = Math.min(app.w, vw - (compact ? 12 : 20));
  // On phones the Paint portrait would otherwise fill the screen — keep it a modest window.
  if (compact && app.cls === "paint") width = Math.min(width, Math.round(vw * 0.72));

  const node = el(`<section class="window" role="dialog" aria-label="${esc(app.title)}" tabindex="-1"
      style="left:-9999px;top:${topMin}px;width:${width}px">
    <header class="titlebar">
      <div class="win-controls">
        <button class="win-dot close" title="Close" aria-label="Close">×</button>
        <button class="win-dot min" title="Minimize" aria-label="Minimize">–</button>
        <button class="win-dot zoom" title="Zoom" aria-label="Zoom">↗</button>
      </div>
      <div class="win-heading">${iconMarkup(id, "win-ico")}<span class="win-tag">${esc(app.tag)}</span><span class="win-title">${esc(app.title)}</span></div>
      <span class="spacer"></span>
      <span class="win-num">${app.num || ""}</span>
    </header>
    <div class="win-body"></div>
  </section>`);

  if (app.cls) node.classList.add(app.cls);
  const body = node.querySelector(".win-body");
  body.innerHTML = app.render();
  windowLayer.appendChild(node);
  const rec = { node, app, restore: null };
  openWindows.set(id, rec);

  // controls
  node.querySelector(".close").addEventListener("click", (e) => { e.stopPropagation(); closeApp(id); });
  node.querySelector(".min").addEventListener("click", (e) => { e.stopPropagation(); node.style.display = "none"; node.classList.add("min-hidden"); taskActive(null); markDock(); });
  node.querySelector(".zoom").addEventListener("click", (e) => { e.stopPropagation(); toggleZoom(id); });
  node.addEventListener("pointerdown", () => focusWindow(id), true);
  makeDraggable(node, node.querySelector(".titlebar"), id);

  // delegated content actions
  node.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) { e.preventDefault(); openApp(opener.getAttribute("data-open")); return; }
    if (e.target.closest("[data-close]")) { e.preventDefault(); closeApp(id); }
  });

  if (app.onMount) app.onMount(node);

  // size the window to fit its content (unless the app requests a fixed frame)
  const frame = node.offsetHeight - body.offsetHeight;   // titlebar + window chrome
  let winH = app.fixed ? Math.min(app.h, availH)
                       : Math.min(Math.max(body.scrollHeight + frame, 130), availH);
  // Paint's frame is the artwork itself — keep the window in the picture's aspect ratio.
  if (app.cls === "paint") winH = Math.min(Math.round(width * 4 / 3), availH);
  node.style.height = winH + "px";

  // centre, stagger, and clamp within the workspace
  const idx = openWindows.size - 1;
  let left = compact ? 6 : Math.round((vw - width) / 2) + (idx % 5) * 24 - 48;
  let top = compact ? topMin + 4 : Math.round((vh - winH - bottomReserve + topMin) / 2) + (idx % 5) * 20 - 36;
  left = Math.max(6, Math.min(left, vw - width - 6));
  top = Math.max(topMin, Math.min(top, vh - bottomReserve - 48));
  node.style.left = left + "px"; node.style.top = top + "px";

  requestAnimationFrame(() => node.classList.add("open"));
  taskAdd(id);
  focusWindow(id);
  markDock();
}

function closeApp(id) {
  const w = openWindows.get(id); if (!w) return;
  w.node.classList.add("closing");
  setTimeout(() => { w.node.remove(); openWindows.delete(id); taskRemove(id); markDock(); }, 180);
}

function toggleZoom(id) {
  const w = openWindows.get(id); if (!w) return;
  const n = w.node;
  if (w.restore) {
    Object.assign(n.style, w.restore); w.restore = null; n.classList.remove("maximized");
  } else {
    w.restore = { left: n.style.left, top: n.style.top, width: n.style.width, height: n.style.height };
    const compact = document.body.classList.contains("compact");
    Object.assign(n.style, {
      left: compact ? "6px" : "14px", top: "38px",
      width: (window.innerWidth - (compact ? 12 : 28)) + "px",
      height: (window.innerHeight - 38 - (compact ? 90 : 100)) + "px",
    });
    n.classList.add("maximized");
  }
  focusWindow(id);
}

function makeDraggable(node, handle, id) {
  let sx, sy, ox, oy, dragging = false;
  handle.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".win-dot")) return;
    dragging = true; handle.classList.add("grabbing");
    sx = e.clientX; sy = e.clientY;
    const r = node.getBoundingClientRect(); ox = r.left; oy = r.top;
    handle.setPointerCapture(e.pointerId); focusWindow(id);
  });
  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    let nl = ox + (e.clientX - sx), nt = oy + (e.clientY - sy);
    nl = Math.min(Math.max(nl, -node.offsetWidth + 80), window.innerWidth - 80);
    nt = Math.min(Math.max(nt, 32), window.innerHeight - 46);
    node.style.left = nl + "px"; node.style.top = nt + "px";
  });
  const end = (e) => { dragging = false; handle.classList.remove("grabbing"); try { handle.releasePointerCapture(e.pointerId); } catch (_) {} };
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
}

/* ============================== MOUNTERS ================================= */
function mountScreening(node) {
  const form = node.querySelector("#screeningForm");
  const loc = node.querySelector("#locationType");
  const hotel = node.querySelector("#hotelField");
  const method = node.querySelector("#method");
  const detail = node.querySelector("#methodDetail");

  loc.addEventListener("change", () => { const out = loc.value === "outcall"; hotel.hidden = !out; hotel.querySelector("input").required = out; });

  const details = {
    provider: `<label class="full"><span>Provider reference *</span><textarea name="providerReference" rows="4" placeholder="Provider name and contact information" required></textarea></label>`,
    linkedin: `<label class="full"><span>LinkedIn or professional profile *</span><input name="profile" type="url" required></label>`,
    employment: `<label class="full"><span>Employment information *</span><textarea name="employment" rows="4" placeholder="Information needed to verify your employment" required></textarea></label>`,
    reviews: `<div class="field-grid"><label><span>Review platform *</span><select name="platform" required><option>TER</option><option>PrivateDelights</option></select></label><label><span>Profile / username *</span><input name="reviewProfile" required></label></div>`,
  };
  const setDetail = () => { detail.innerHTML = details[method.value] || ""; };
  method.addEventListener("change", setDetail); setDetail();

  const notice = node.querySelector("#screeningNotice");
  const body = node.querySelector(".win-body");
  const scrollDown = () => body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    if (!CONFIG.FORM_ENDPOINT) {
      notice.innerHTML = `<div class="form-notice">Your introduction has been prepared. Delivery isn't connected yet — add your form endpoint in <code>app.js</code> to go live.</div>`;
      scrollDown(); return;
    }

    const btn = form.querySelector(".submit");
    const original = btn.innerHTML;
    btn.disabled = true; btn.textContent = "Sending…"; notice.innerHTML = "";
    try {
      const res = await fetch(CONFIG.FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("bad status " + res.status);
      form.reset(); hotel.hidden = true; hotel.querySelector("input").required = false; setDetail();
      notice.innerHTML = `<div class="form-notice">Thank you — your introduction has been sent. I reply personally, as promptly as life allows.</div>`;
    } catch (err) {
      notice.innerHTML = `<div class="form-notice">Something interrupted the send. Please try again in a moment, or reach me by the methods on the Contact card.</div>`;
    } finally {
      btn.disabled = false; btn.innerHTML = original; scrollDown();
    }
  });
}

/* Gallery lightbox */
let lb, lbImg, lbCount, lbIndex = 0;
function ensureLightbox() {
  if (lb) return;
  lb = el(`<div class="lightbox" role="dialog" aria-label="Photograph viewer">
    <button class="lb-close" aria-label="Close">CLOSE ×</button>
    <button class="lb-btn lb-prev" aria-label="Previous">‹</button>
    <img alt="Rory Grey photograph" />
    <button class="lb-btn lb-next" aria-label="Next">›</button>
    <div class="lb-count"></div></div>`);
  document.body.appendChild(lb);
  lbImg = lb.querySelector("img"); lbCount = lb.querySelector(".lb-count");
  lb.querySelector(".lb-close").addEventListener("click", closeLB);
  lb.querySelector(".lb-prev").addEventListener("click", () => stepLB(-1));
  lb.querySelector(".lb-next").addEventListener("click", () => stepLB(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
}
function openLB(i) { ensureLightbox(); lbIndex = i; showLB(); lb.classList.add("show"); }
function showLB() { lbImg.src = PHOTOS[lbIndex]; lbCount.textContent = `${String(lbIndex + 1).padStart(2, "0")} / ${String(PHOTOS.length).padStart(2, "0")}`; }
function stepLB(d) { lbIndex = (lbIndex + d + PHOTOS.length) % PHOTOS.length; showLB(); }
function closeLB() { if (lb) lb.classList.remove("show"); }
function mountGallery(node) {
  node.querySelectorAll(".tile").forEach((t) => t.addEventListener("click", () => openLB(parseInt(t.dataset.photo, 10))));
}

/* ============================== DESKTOP ICONS =========================== */
const ICONS = [
  { id: "screening", label: "Screening", variant: "screening", x: 3, y: 4 },
  { id: "etiquette", label: "Etiquette", variant: "etiquette", x: 3, y: 30 },
  { id: "faq", label: "FAQ", variant: "faq", x: 3, y: 56 },
  { id: "blogfolder", label: "Blog Posts", variant: "folder", x: 82, y: 6 },
  { id: "snake", label: "Snake", x: 66, y: 34 },
  { id: "paint", label: "Paint", x: 20, y: 4 },
  { id: "passwords", label: "Passwords.txt", variant: "txt", x: 18, y: 78 },
  { id: "env", label: ".env", variant: "txt", x: 4, y: 80, hidden: true },
];

const iconLayer = document.getElementById("iconLayer");
const ICON_POS_KEY = "rg-icon-pos-v1";
let iconPos = (() => { try { return JSON.parse(localStorage.getItem(ICON_POS_KEY) || "{}"); } catch (_) { return {}; } })();
const saveIconPos = () => { try { localStorage.setItem(ICON_POS_KEY, JSON.stringify(iconPos)); } catch (_) {} };

// Default tidy arrangement: a vertical column that wraps into more columns
// as the desktop runs out of height. Used for any icon the user hasn't
// dragged somewhere else yet.
function defaultIconPositions() {
  const startX = 12, startY = 14, colW = 122, rowH = 132;
  const availH = (iconLayer.clientHeight || (window.innerHeight - 40)) - 8;
  const pos = {};
  let x = startX, y = startY;
  ICONS.forEach((ic) => {
    pos[ic.id] = { x, y };
    y += rowH;
    if (y + rowH > availH) { y = startY; x += colW; }
  });
  return pos;
}

function activateIcon(ic) {
  if (ic.noop) return; // decoy icon — intentionally does nothing
  if (ic.external) {
    const a = document.createElement("a");
    a.href = ic.external; a.target = "_blank"; a.rel = "noopener noreferrer";
    document.body.appendChild(a); a.click(); a.remove();
  } else {
    openApp(ic.id);
  }
}

function renderIcons() {
  iconLayer.innerHTML = "";
  const defaults = defaultIconPositions();
  ICONS.forEach((ic) => {
    const saved = iconPos[ic.id];
    const d = defaults[ic.id] || { x: 12, y: 14 };
    const px = saved ? saved.x : d.x;
    const py = saved ? saved.y : d.y;
    const node = el(`<div class="icon${ic.hidden ? " hidden" : ""}" role="button" tabindex="0" data-id="${ic.id}"
        aria-label="${esc(ic.label)}" style="left:${px}px;top:${py}px">
      ${iconMarkup(ic.id, "glyph pngglyph")}
      <div class="label">${esc(ic.label)}${ic.sub ? `<span class="sub">${ic.sub}</span>` : ""}</div>
    </div>`);
    const gimg = node.querySelector("img.pngglyph");
    if (gimg) gimg.addEventListener("error", () => gimg.replaceWith(el(docIcon(ic.variant))));

    // Drag to reposition (works with mouse and touch); a plain click opens.
    // Whatever spot you drop an icon on is remembered.
    node.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      const layerRect = iconLayer.getBoundingClientRect();
      const rect = node.getBoundingClientRect();
      const offX = e.clientX - rect.left, offY = e.clientY - rect.top;
      const sx = e.clientX, sy = e.clientY;
      let moved = false;
      try { node.setPointerCapture(e.pointerId); } catch (_) {}
      clearSel(); node.classList.add("selected");

      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5) { moved = true; node.classList.add("dragging"); node.style.zIndex = 60; }
        if (!moved) return;
        let nx = ev.clientX - layerRect.left - offX;
        let ny = ev.clientY - layerRect.top - offY;
        nx = Math.max(0, Math.min(nx, layerRect.width - node.offsetWidth));
        ny = Math.max(0, Math.min(ny, layerRect.height - node.offsetHeight - 40));
        node.style.left = nx + "px"; node.style.top = ny + "px";
      };
      const up = (ev) => {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerup", up);
        node.removeEventListener("pointercancel", up);
        try { node.releasePointerCapture(ev.pointerId); } catch (_) {}
        node.classList.remove("dragging"); node.style.zIndex = "";
        if (moved) { iconPos[ic.id] = { x: Math.round(parseFloat(node.style.left)), y: Math.round(parseFloat(node.style.top)) }; saveIconPos(); }
        else { node.classList.add("selected"); activateIcon(ic); }
      };
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerup", up);
      node.addEventListener("pointercancel", up);
    });

    node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clearSel(); node.classList.add("selected"); activateIcon(ic); } });
    iconLayer.appendChild(node);
  });
  packMobileIcons();
}
function clearSel() { iconLayer.querySelectorAll(".icon.selected").forEach((n) => n.classList.remove("selected")); }

// On phones, stack every icon in a single tight vertical column near the left edge.
function packMobileIcons() {
  if (!document.body.classList.contains("compact")) return;
  const startX = 8, startY = 10, gap = 4;
  let y = startY;
  ICONS.forEach((ic) => {
    const node = iconLayer.querySelector(`.icon[data-id="${ic.id}"]`);
    if (!node) return;
    node.style.left = startX + "px";
    node.style.top = y + "px";
    y += node.offsetHeight + gap;
  });
}

/* ============================== DOCK ==================================== */
const DOCK = [
  { id: "about", label: "About — Notes", art: "notes" },
  { id: "gallery", label: "Gallery — Photos", art: "photos" },
  { id: "rates", label: "Rates — Stocks", art: "stocks" },
  { id: "__x", label: "Rory on X", art: "x", external: CONFIG.X_PROFILE_URL },
];
const dock = document.getElementById("dock");
function renderDock() {
  DOCK.forEach((d) => {
    const tag = d.external ? "a" : "button";
    const attrs = d.external ? `href="${d.external}" target="_blank" rel="noopener noreferrer"` : `type="button"`;
    const item = el(`<${tag} class="dock-item" ${attrs} aria-label="${esc(d.label)}">
      <span class="dock-tip">${esc(d.label)}</span>
      <span class="dock-btn">${DOCK_ART[d.art]}</span>
      <span class="dock-dot"></span></${tag}>`);
    if (!d.external) item.addEventListener("click", () => openApp(d.id));
    item.dataset.app = d.id || "";
    dock.appendChild(item);
  });
}
function markDock() {
  dock.querySelectorAll(".dock-item").forEach((it) => {
    const id = it.dataset.app;
    const w = openWindows.get(id);
    it.classList.toggle("running", !!(w && w.node.style.display !== "none"));
  });
}

/* ============================== SYSTEM =================================== */
function tickClock() {
  const d = new Date();
  const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const c = document.getElementById("clock"); if (c) c.textContent = `${date} · ${time}`.toUpperCase();
  const tray = document.getElementById("trayClock"); if (tray) tray.textContent = time;
}

function applyCompact() { document.body.classList.toggle("compact", window.innerWidth < 720); }

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { if (lb && lb.classList.contains("show")) { closeLB(); return; } if (activeId) closeApp(activeId); }
  if (lb && lb.classList.contains("show")) { if (e.key === "ArrowLeft") stepLB(-1); if (e.key === "ArrowRight") stepLB(1); }
});
// Desktop marquee (rubber-band) selection — authentic click-and-drag on empty desktop
(function initMarquee() {
  const desktop = document.getElementById("desktop");
  desktop.addEventListener("pointerdown", (e) => {
    if (e.button && e.button !== 0) return;
    if (e.target.closest(".icon") || e.target.closest(".window") || e.target.closest("#taskbar") || e.target.closest("#startMenu")) return;
    const onEmpty = e.target === desktop || e.target === iconLayer || e.target === windowLayer || e.target.closest(".wallmark");
    if (!onEmpty) return;
    clearSel();
    const sx = e.clientX, sy = e.clientY;
    const box = document.createElement("div"); box.className = "marquee";
    iconLayer.appendChild(box);
    let moved = false;
    function draw(cx, cy) {
      const lr = iconLayer.getBoundingClientRect();
      const x1 = Math.min(sx, cx), y1 = Math.min(sy, cy), x2 = Math.max(sx, cx), y2 = Math.max(sy, cy);
      box.style.left = (x1 - lr.left) + "px"; box.style.top = (y1 - lr.top) + "px";
      box.style.width = (x2 - x1) + "px"; box.style.height = (y2 - y1) + "px";
      iconLayer.querySelectorAll(".icon").forEach((ic) => {
        const r = ic.getBoundingClientRect();
        const hit = !(r.right < x1 || r.left > x2 || r.bottom < y1 || r.top > y2);
        ic.classList.toggle("selected", hit);
      });
    }
    draw(sx, sy);
    const move = (ev) => { if (Math.abs(ev.clientX - sx) > 2 || Math.abs(ev.clientY - sy) > 2) moved = true; draw(ev.clientX, ev.clientY); };
    const up = () => {
      document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up);
      box.remove();
      if (!moved) clearSel();   // a plain click on empty desktop clears the selection
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  });
})();
window.addEventListener("resize", () => { applyCompact(); packMobileIcons(); });

/* ===================== MINESWEEPER ===================== */
function renderMinesweeper() {
  return `<div class="mine">
    <div class="mine-head">
      <div class="mine-lcd" data-role="mines">010</div>
      <button class="mine-face" data-role="face" aria-label="New game">🙂</button>
      <div class="mine-lcd" data-role="time">000</div>
    </div>
    <div class="mine-grid" data-role="grid"></div>
  </div>`;
}
function mountMinesweeper(node) {
  const R = 9, C = 9, M = 10;
  const gridEl = node.querySelector("[data-role=grid]");
  const faceEl = node.querySelector("[data-role=face]");
  const minesEl = node.querySelector("[data-role=mines]");
  const timeEl = node.querySelector("[data-role=time]");
  let cells, started, dead, won, timer, secs, flags, revealed;
  const pad = (n) => String(Math.max(0, Math.min(999, n))).padStart(3, "0");
  const neigh = (r, c, fn) => { for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { if (!dr && !dc) continue; const x = r + dr, y = c + dc; if (x >= 0 && x < R && y >= 0 && y < C) fn(x, y); } };

  function reset() {
    cells = []; started = false; dead = false; won = false; flags = 0; secs = 0; revealed = 0;
    clearInterval(timer); timer = null;
    minesEl.textContent = pad(M); timeEl.textContent = "000"; faceEl.textContent = "🙂";
    gridEl.style.gridTemplateColumns = `repeat(${C}, 22px)`;
    let html = "";
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) html += `<button class="mcell" data-r="${r}" data-c="${c}"></button>`;
    gridEl.innerHTML = html;
    for (let r = 0; r < R; r++) { cells[r] = []; for (let c = 0; c < C; c++) cells[r][c] = { mine: false, adj: 0, rev: false, flag: false, r, c, el: gridEl.querySelector(`[data-r="${r}"][data-c="${c}"]`) }; }
  }
  function plant(sr, sc) {
    let placed = 0;
    while (placed < M) { const r = Math.floor(Math.random() * R), c = Math.floor(Math.random() * C); if (cells[r][c].mine || (Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1)) continue; cells[r][c].mine = true; placed++; }
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { let n = 0; neigh(r, c, (x, y) => { if (cells[x][y].mine) n++; }); cells[r][c].adj = n; }
  }
  function startTimer() { if (timer) return; timer = setInterval(() => { secs++; timeEl.textContent = pad(secs); if (secs >= 999) clearInterval(timer); }, 1000); }
  function reveal(cell) {
    if (dead || won || cell.rev || cell.flag) return;
    cell.rev = true; cell.el.classList.add("open");
    if (cell.mine) { cell.el.textContent = "💣"; cell.el.classList.add("boom"); return boom(); }
    revealed++;
    if (cell.adj) { cell.el.textContent = cell.adj; cell.el.classList.add("n" + cell.adj); }
    else neigh(cell.r, cell.c, (x, y) => reveal(cells[x][y]));
    if (revealed === R * C - M) win();
  }
  function boom() {
    dead = true; faceEl.textContent = "😵"; clearInterval(timer);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const cc = cells[r][c]; if (cc.mine && !cc.rev) { cc.el.classList.add("open"); cc.el.textContent = "💣"; } if (cc.flag && !cc.mine) cc.el.textContent = "❌"; }
  }
  function win() {
    won = true; faceEl.textContent = "😎"; clearInterval(timer); minesEl.textContent = "000";
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const cc = cells[r][c]; if (cc.mine && !cc.flag) { cc.flag = true; cc.el.textContent = "🚩"; } }
  }
  function toggleFlag(cell) { if (dead || won || cell.rev) return; cell.flag = !cell.flag; cell.el.textContent = cell.flag ? "🚩" : ""; cell.el.classList.toggle("flag", cell.flag); flags += cell.flag ? 1 : -1; minesEl.textContent = pad(M - flags); }
  const cellAt = (t) => { const b = t.closest(".mcell"); return b ? cells[+b.dataset.r][+b.dataset.c] : null; };

  gridEl.addEventListener("click", (e) => { const cell = cellAt(e.target); if (!cell) return; if (!started) { started = true; plant(cell.r, cell.c); startTimer(); } reveal(cell); });
  gridEl.addEventListener("contextmenu", (e) => { e.preventDefault(); const cell = cellAt(e.target); if (!cell) return; if (!started) { started = true; plant(cell.r, cell.c); startTimer(); } toggleFlag(cell); });
  faceEl.addEventListener("click", reset);
  reset();
}

/* ===================== SNAKE ===================== */
const SNAKE_HS_KEY = "rg-snake-scores-v1";
function loadSnakeScores() { try { return JSON.parse(localStorage.getItem(SNAKE_HS_KEY)) || []; } catch (_) { return []; } }
function saveSnakeScores(a) { try { localStorage.setItem(SNAKE_HS_KEY, JSON.stringify(a)); } catch (_) {} }

// Global leaderboard via Firebase Firestore REST (falls back to local when not configured / offline)
function saveLocalScore(name, score) { const s = loadSnakeScores(); s.push({ name, score }); s.sort((a, b) => b.score - a.score); saveSnakeScores(s.slice(0, 10)); }
async function fetchScores() {
  const pid = CONFIG.FIREBASE_PROJECT_ID, key = CONFIG.FIREBASE_API_KEY;
  if (!pid || !key) return loadSnakeScores().sort((a, b) => b.score - a.score).slice(0, 10);
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents:runQuery?key=${key}`;
    const body = { structuredQuery: { from: [{ collectionId: "scores" }], orderBy: [{ field: { fieldPath: "score" }, direction: "DESCENDING" }], limit: 10 } };
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error("bad status");
    const data = await r.json();
    return data.filter((x) => x.document).map((x) => {
      const f = x.document.fields || {};
      return { name: (f.name && f.name.stringValue) || "SNAKE", score: parseInt((f.score && (f.score.integerValue || f.score.doubleValue)) || 0, 10) };
    });
  } catch (_) { return loadSnakeScores().sort((a, b) => b.score - a.score).slice(0, 10); }
}
async function submitScore(name, score) {
  const pid = CONFIG.FIREBASE_PROJECT_ID, key = CONFIG.FIREBASE_API_KEY;
  if (!pid || !key) { saveLocalScore(name, score); return; }
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/scores?key=${key}`;
    const body = { fields: { name: { stringValue: name }, score: { integerValue: String(score) }, ts: { integerValue: String(Date.now()) } } };
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error("bad status");
  } catch (_) { saveLocalScore(name, score); }
}

function renderSnake() {
  return `<div class="snake">
    <canvas class="snake-canvas" width="320" height="350" tabindex="0"></canvas>
    <div class="snake-bar"><button class="snake-btn" data-role="new">New Game</button></div>
    <div class="snake-entry" hidden><span class="se-label">New high score!</span><input maxlength="12" placeholder="Your name" data-role="name"><button class="snake-btn" data-role="save">Save</button></div>
    <div class="snake-hint">Swipe or arrow keys · 3 lives</div>
    <div class="snake-scores"><div class="hs-title">★ High Scores ★</div><ol data-role="scores"></ol></div>
  </div>`;
}
function mountSnake(node) {
  const cv = node.querySelector("canvas"), ctx = cv.getContext("2d");
  const N = 20, CELL = 16, HEADER = 30, W = N * CELL, PLAY = N * CELL;
  const SCREEN = "#2b1626", INK = "#f4a6d0", DIM = "rgba(244,166,208,.26)", GRID = "rgba(244,166,208,.20)";
  const rand = (n) => Math.floor(Math.random() * n);
  const entry = node.querySelector(".snake-entry");
  const nameInput = entry.querySelector("[data-role=name]");
  let snake, dir, nextDir, food, timer, dead, score, level, lives, saved, boardCache = [];

  function renderBoard(list) {
    const el = node.querySelector("[data-role=scores]");
    const s = (list || []).slice(0, 10);
    el.innerHTML = s.length
      ? s.map((e, i) => `<li><span class="hs-rank">${i + 1}</span><span class="hs-name">${esc(e.name)}</span><span class="hs-score">${e.score}</span></li>`).join("")
      : `<li class="hs-empty">No scores yet — be the first.</li>`;
  }
  async function refreshBoard() { boardCache = await fetchScores(); renderBoard(boardCache); }

  const speed = () => Math.max(80, 150 - (level - 1) * 10);
  const restartTimer = () => { clearInterval(timer); timer = setInterval(tick, speed()); };
  const spawnSnake = () => { snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }]; dir = { x: 1, y: 0 }; nextDir = dir; };
  function reset() {
    spawnSnake(); dead = false; score = 0; level = 1; lives = 3; saved = false;
    entry.hidden = true; placeFood(); draw(); restartTimer();
  }
  function placeFood() { do { food = { x: rand(N), y: rand(N) }; } while (snake.some((s) => s.x === food.x && s.y === food.y)); }
  function qualifies() { return score > 0 && (boardCache.length < 10 || score > Math.min(...boardCache.map((e) => e.score))); }
  function endGame() { if (qualifies()) { entry.hidden = false; nameInput.value = ""; setTimeout(() => nameInput.focus(), 30); } }
  async function saveScore() {
    if (saved) return; saved = true;
    const name = (nameInput.value || "").trim().slice(0, 12) || "SNAKE";
    entry.hidden = true; await submitScore(name, score); await refreshBoard(); cv.focus();
  }
  function loseLife() {
    lives--;
    if (lives <= 0) { dead = true; clearInterval(timer); draw(); endGame(); }
    else { spawnSnake(); draw(); }
  }
  function tick() {
    if (!cv.isConnected) { clearInterval(timer); return; }
    if (dead) return;
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= N || head.y < 0 || head.y >= N || snake.some((s) => s.x === head.x && s.y === head.y)) { loseLife(); return; }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score++; const nl = Math.floor(score / 5) + 1; if (nl !== level) { level = nl; restartTimer(); } placeFood(); }
    else { snake.pop(); }
    draw();
  }
  function heart(cx, cy, s, on) {
    ctx.fillStyle = on ? INK : DIM;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * .3);
    ctx.bezierCurveTo(cx, cy, cx - s * .5, cy, cx - s * .5, cy + s * .3);
    ctx.bezierCurveTo(cx - s * .5, cy + s * .6, cx, cy + s * .85, cx, cy + s);
    ctx.bezierCurveTo(cx, cy + s * .85, cx + s * .5, cy + s * .6, cx + s * .5, cy + s * .3);
    ctx.bezierCurveTo(cx + s * .5, cy, cx, cy, cx, cy + s * .3);
    ctx.fill();
  }
  function draw() {
    ctx.fillStyle = SCREEN; ctx.fillRect(0, 0, cv.width, cv.height);
    // header
    ctx.fillStyle = INK; ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(String(score).padStart(4, "0"), 6, 20);
    ctx.textAlign = "right"; ctx.fillText("L" + level, W - 6, 20);
    for (let i = 0; i < 3; i++) heart(W / 2 - 15 + i * 12, 7, 8, i < lives);
    ctx.fillStyle = INK; ctx.fillRect(4, HEADER - 5, W - 8, 1);
    // play border + grid
    ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.strokeRect(2.5, HEADER - 1.5, W - 5, PLAY + 1);
    ctx.fillStyle = GRID;
    for (let i = 1; i < N; i++) { ctx.fillRect(i * CELL, HEADER, 1, PLAY); ctx.fillRect(0, HEADER + i * CELL, W, 1); }
    // food (plus target)
    const fx = food.x * CELL, fy = HEADER + food.y * CELL;
    ctx.fillStyle = INK;
    ctx.fillRect(fx + CELL / 2 - 1, fy + 2, 2, CELL - 4);
    ctx.fillRect(fx + 2, fy + CELL / 2 - 1, CELL - 4, 2);
    // snake (hollow LCD blocks; solid head)
    snake.forEach((s, i) => {
      const x = s.x * CELL, y = HEADER + s.y * CELL;
      ctx.fillStyle = INK; ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      if (i !== 0) { ctx.fillStyle = SCREEN; ctx.fillRect(x + 4, y + 4, CELL - 8, CELL - 8); }
    });
    if (dead) {
      ctx.fillStyle = "rgba(43,22,38,.85)"; ctx.fillRect(0, HEADER, W, PLAY);
      ctx.fillStyle = INK; ctx.textAlign = "center";
      ctx.font = 'bold 20px "Courier New", monospace'; ctx.fillText("GAME OVER", W / 2, HEADER + PLAY / 2 - 4);
      ctx.font = '12px "Courier New", monospace'; ctx.fillText("Score " + score, W / 2, HEADER + PLAY / 2 + 16);
    }
  }
  const keymap = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
  function onKey(e) {
    const k = keymap[e.key]; if (!k) return; e.preventDefault();
    const [x, y] = k; if (x === -dir.x && y === -dir.y) return; nextDir = { x, y };
  }
  cv.addEventListener("keydown", onKey);
  // touch / swipe steering (for phones with no keyboard)
  let swipeStart = null;
  cv.addEventListener("pointerdown", (e) => { cv.focus(); swipeStart = { x: e.clientX, y: e.clientY }; });
  cv.addEventListener("pointerup", (e) => {
    if (!swipeStart) return;
    const dx = e.clientX - swipeStart.x, dy = e.clientY - swipeStart.y; swipeStart = null;
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
    let nx, ny;
    if (Math.abs(dx) > Math.abs(dy)) { nx = dx > 0 ? 1 : -1; ny = 0; } else { nx = 0; ny = dy > 0 ? 1 : -1; }
    if (nx === -dir.x && ny === -dir.y) return;
    nextDir = { x: nx, y: ny };
  });
  cv.addEventListener("pointercancel", () => { swipeStart = null; });
  node.querySelector("[data-role=new]").addEventListener("click", () => { reset(); cv.focus(); });
  node.querySelector("[data-role=save]").addEventListener("click", saveScore);
  nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); saveScore(); } });
  refreshBoard(); reset(); setTimeout(() => cv.focus(), 60);
}

/* ===================== SOLITAIRE (Klondike) ===================== */
function renderSolitaire() {
  return `<div class="sol">
    <div class="sol-bar"><button class="sol-btn" data-role="new">Deal</button><span class="sol-status" data-role="status">Klondike</span></div>
    <div class="sol-felt">
      <div class="sol-top">
        <div class="sol-slot" data-stock></div>
        <div class="sol-slot" data-waste></div>
        <div class="sol-spacer"></div>
        <div class="sol-slot" data-found="0"></div>
        <div class="sol-slot" data-found="1"></div>
        <div class="sol-slot" data-found="2"></div>
        <div class="sol-slot" data-found="3"></div>
      </div>
      <div class="sol-cols">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<div class="sol-col" data-col="${i}"></div>`).join("")}</div>
    </div>
  </div>`;
}
function mountSolitaire(node) {
  const SUITS = ["♠", "♥", "♦", "♣"], RED = new Set(["♥", "♦"]);
  const rl = (r) => ({ 1: "A", 11: "J", 12: "Q", 13: "K" }[r] || String(r));
  const isRed = (c) => RED.has(c.s);
  let stock, waste, found, tab, sel;
  const $ = (s) => node.querySelector(s);
  const stockEl = $("[data-stock]"), wasteEl = $("[data-waste]"), statusEl = $("[data-role=status]");
  const foundEls = [0, 1, 2, 3].map((i) => $(`[data-found="${i}"]`));
  const colEls = [0, 1, 2, 3, 4, 5, 6].map((i) => $(`[data-col="${i}"]`));

  function deal() {
    const d = []; for (const s of SUITS) for (let r = 1; r <= 13; r++) d.push({ r, s, up: false });
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    tab = [[], [], [], [], [], [], []];
    for (let i = 0; i < 7; i++) for (let j = 0; j <= i; j++) { const c = d.pop(); c.up = (j === i); tab[i].push(c); }
    stock = d; stock.forEach((c) => c.up = false); waste = []; found = [[], [], [], []]; sel = null;
    statusEl.textContent = "Klondike"; render();
  }
  const faceHTML = (c) => `<span class="cr">${rl(c.r)}</span><span class="cs">${c.s}</span>`;
  const faceCard = (c, seld) => `<div class="card up ${isRed(c) ? "red" : "blk"} ${seld ? "sel" : ""}">${faceHTML(c)}</div>`;

  function render() {
    stockEl.innerHTML = stock.length ? `<div class="card down"></div>` : `<div class="slot-empty">↻</div>`;
    const wtop = waste[waste.length - 1];
    wasteEl.innerHTML = wtop ? faceCard(wtop, sel && sel.from === "waste") : `<div class="slot-empty"></div>`;
    found.forEach((f, i) => { const t = f[f.length - 1]; foundEls[i].innerHTML = t ? faceCard(t, sel && sel.from === "found" && sel.i === i) : `<div class="slot-empty ${RED.has(SUITS[i]) ? "red" : "blk"}">${SUITS[i]}</div>`; });
    colEls.forEach((elc, ci) => {
      const col = tab[ci]; let off = 0, html = "";
      col.forEach((c, idx) => {
        const seld = sel && sel.from === "col" && sel.i === ci && idx >= sel.idx;
        html += `<div class="card ${c.up ? "up" : "down"} ${c.up && isRed(c) ? "red" : "blk"} ${seld ? "sel" : ""}" data-col="${ci}" data-idx="${idx}" style="top:${off}px">${c.up ? faceHTML(c) : ""}</div>`;
        off += c.up ? 24 : 9;
      });
      elc.innerHTML = html; elc.style.height = (off + 78) + "px";
    });
  }

  const canFound = (i, c) => { const f = found[i]; return f.length ? (f[f.length - 1].s === c.s && c.r === f[f.length - 1].r + 1) : c.r === 1; };
  const canTab = (i, c) => { const t = tab[i]; if (!t.length) return c.r === 13; const top = t[t.length - 1]; return top.up && isRed(top) !== isRed(c) && c.r === top.r - 1; };
  function removeSel(s) {
    if (s.from === "waste") return [waste.pop()];
    if (s.from === "found") return [found[s.i].pop()];
    const run = tab[s.i].splice(s.idx); if (tab[s.i].length && !tab[s.i][tab[s.i].length - 1].up) tab[s.i][tab[s.i].length - 1].up = true; return run;
  }
  function selectAt(loc) {
    if (loc.type === "waste") { const c = waste[waste.length - 1]; return c ? { from: "waste", cards: [c] } : null; }
    if (loc.type === "found") { const f = found[loc.i]; const c = f[f.length - 1]; return c ? { from: "found", i: loc.i, cards: [c] } : null; }
    const col = tab[loc.i]; if (!col.length) return null; let idx = loc.idx; if (idx == null || idx < 0 || idx >= col.length) idx = col.length - 1; if (!col[idx].up) return null; return { from: "col", i: loc.i, idx, cards: col.slice(idx) };
  }
  function tryMove(s, loc) {
    const lead = s.cards[0];
    if (loc.type === "found") { if (s.cards.length !== 1 || !canFound(loc.i, lead)) return false; removeSel(s); found[loc.i].push(lead); return true; }
    if (loc.type === "col") { if (s.from === "col" && s.i === loc.i) return false; if (!canTab(loc.i, lead)) return false; removeSel(s).forEach((c) => tab[loc.i].push(c)); return true; }
    return false;
  }
  function win() { if (found.every((f) => f.length === 13)) statusEl.textContent = "♥ You win! ♥"; }
  function doStock() { sel = null; if (stock.length) { const c = stock.pop(); c.up = true; waste.push(c); } else { while (waste.length) { const c = waste.pop(); c.up = false; stock.push(c); } } render(); }

  node.addEventListener("click", (e) => {
    if (e.target.closest(".sol-btn")) { deal(); return; }
    if (e.target.closest("[data-stock]")) { doStock(); return; }
  });

  // Drag a card (or a run) onto a tableau column or foundation
  function markGhost(src, on) {
    let els = [];
    if (src.from === "waste") els = [wasteEl.querySelector(".card")];
    else if (src.from === "found") els = [foundEls[src.i].querySelector(".card")];
    else els = [...colEls[src.i].querySelectorAll(".card")].filter((c) => +c.dataset.idx >= src.idx);
    els.forEach((c) => c && c.classList.toggle("ghosting", on));
  }
  node.addEventListener("pointerdown", (e) => {
    if (e.button) return;
    const cardEl = e.target.closest(".card.up");
    if (!cardEl) return;
    const colEl = e.target.closest("[data-col]"), ws = e.target.closest("[data-waste]"), fs = e.target.closest("[data-found]");
    let src = null;
    if (ws) { if (waste.length) src = { from: "waste", cards: [waste[waste.length - 1]] }; }
    else if (fs) { const i = +fs.dataset.found; if (found[i].length) src = { from: "found", i, cards: [found[i][found[i].length - 1]] }; }
    else if (colEl) { const i = +colEl.dataset.col, idx = +cardEl.dataset.idx; if (tab[i][idx] && tab[i][idx].up) src = { from: "col", i, idx, cards: tab[i].slice(idx) }; }
    if (!src) return;
    e.preventDefault();
    const ghost = document.createElement("div"); ghost.className = "drag-ghost";
    let t = 0; src.cards.forEach((c) => { ghost.insertAdjacentHTML("beforeend", `<div class="card up ${isRed(c) ? "red" : "blk"}" style="top:${t}px">${faceHTML(c)}</div>`); t += 24; });
    ghost.style.height = (t + 54) + "px";
    document.body.appendChild(ghost);
    markGhost(src, true);
    const rect = cardEl.getBoundingClientRect();
    const ox = e.clientX - rect.left, oy = e.clientY - rect.top;
    const move = (ev) => { ghost.style.left = (ev.clientX - ox) + "px"; ghost.style.top = (ev.clientY - oy) + "px"; };
    move(e);
    const up = (ev) => {
      document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up);
      ghost.style.display = "none";
      const under = document.elementFromPoint(ev.clientX, ev.clientY);
      ghost.remove(); markGhost(src, false);
      let loc = null;
      if (under) { const f = under.closest("[data-found]"), c = under.closest("[data-col]"); if (f) loc = { type: "found", i: +f.dataset.found }; else if (c) loc = { type: "col", i: +c.dataset.col }; }
      if (loc && tryMove(src, loc)) { render(); win(); } else { render(); }
    };
    document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
  });
  node.addEventListener("dblclick", (e) => {
    const colEl = e.target.closest("[data-col]"), ws = e.target.closest("[data-waste]");
    let card = null, src = null;
    if (ws && waste.length) { card = waste[waste.length - 1]; src = { from: "waste", cards: [card] }; }
    else if (colEl) { const col = tab[+colEl.dataset.col]; if (col.length && col[col.length - 1].up) { card = col[col.length - 1]; src = { from: "col", i: +colEl.dataset.col, idx: col.length - 1, cards: [card] }; } }
    if (!src) return;
    for (let i = 0; i < 4; i++) if (canFound(i, card)) { removeSel(src); found[i].push(card); sel = null; render(); win(); return; }
  });
  deal();
}

/* ===================== WINDOWS 98 SHELL (pink) ===================== */
function heartIcon(fill) {
  return `<svg class="heart" viewBox="0 0 20 18" aria-hidden="true"><path d="M10 17S1 11 1 5.7A4.5 4.5 0 0 1 10 4a4.5 4.5 0 0 1 9 1.7C19 11 10 17 10 17Z" fill="${fill || "#ec4fa0"}" stroke="#7a3b63" stroke-width="1"/></svg>`;
}
function miniFile() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2h9l5 5v15H5z" fill="var(--doc-paper)" stroke="var(--doc-line)" stroke-width="1.2"/><path d="M14 2v5h5" fill="var(--doc-fold)" stroke="var(--doc-line)" stroke-width="1.2"/><line x1="8" y1="12" x2="16" y2="12" stroke="var(--doc-line)"/><line x1="8" y1="15" x2="16" y2="15" stroke="var(--doc-line)"/><line x1="8" y1="18" x2="13" y2="18" stroke="var(--doc-accent)"/></svg>`;
}
function powerIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7" fill="none" stroke="#ec4fa0" stroke-width="2"/><line x1="12" y1="4" x2="12" y2="12" stroke="#ec4fa0" stroke-width="2" stroke-linecap="round"/></svg>`;
}
function taskIcon(id) { return iconMarkup(id, ""); }

const tbTasksEl = () => document.getElementById("tbTasks");
function taskAdd(id) {
  const t = tbTasksEl(); if (!t || t.querySelector(`[data-task="${id}"]`)) return;
  const app = APPS[id]; if (!app) return;
  const btn = el(`<button class="tb-task" data-task="${id}"><span class="ic">${taskIcon(id)}</span><span>${esc(app.title)}</span></button>`);
  btn.addEventListener("click", () => {
    const w = openWindows.get(id); if (!w) { openApp(id); return; }
    if (w.node.style.display === "none") { w.node.style.display = "flex"; w.node.classList.remove("min-hidden"); focusWindow(id); }
    else if (activeId === id) { w.node.style.display = "none"; w.node.classList.add("min-hidden"); taskActive(null); }
    else focusWindow(id);
  });
  t.appendChild(btn);
}
function taskRemove(id) { const t = tbTasksEl(); if (!t) return; const b = t.querySelector(`[data-task="${id}"]`); if (b) b.remove(); }
function taskActive(id) { const t = tbTasksEl(); if (!t) return; t.querySelectorAll(".tb-task").forEach((b) => b.classList.toggle("active", b.dataset.task === id)); }

function shutDown() {
  const ov = el(`<div id="shutdown">It's now safe to close this tab.<small>◆ Rory Grey · Las Vegas, Nevada</small></div>`);
  ov.addEventListener("click", () => ov.remove());
  document.body.appendChild(ov);
}

function initWin98() {
  if (!document.body.classList.contains("win98")) return;

  const bar = el(`<div id="taskbar">
    <button id="startBtn">${heartIcon("#ec4fa0")}<span>Start</span></button>
    <div class="tb-div"></div>
    <div class="tb-tasks" id="tbTasks"></div>
    <div class="tb-tray">${heartIcon("#ec4fa0")}<span id="trayClock">—</span></div>
  </div>`);
  document.body.appendChild(bar);

  const menuItems = [
    ["about", "About"], ["gallery", "Gallery"], ["rates", "Rates"],
    ["sep"],
    ["screening", "Screening"], ["etiquette", "Etiquette"], ["faq", "FAQ"], ["blogfolder", "Blog Posts"],
    ["sep"],
    ["snake", "Snake"],
    ["sep"],
    ["__x", "Rory on X", "ext"], ["__shutdown", "Shut Down…", "shutdown"],
  ];
  const menu = el(`<div id="startMenu"><div class="sidebar">Rory Grey <span>Las Vegas, Nevada</span></div><div class="items"></div></div>`);
  const items = menu.querySelector(".items");
  menuItems.forEach((it) => {
    if (it[0] === "sep") { items.appendChild(el(`<div class="sep"></div>`)); return; }
    const ic = it[0] === "__shutdown" ? powerIcon() : iconMarkup(it[0], "");
    const mi = el(`<button class="mi"><span class="ic">${ic}</span><span>${esc(it[1])}</span></button>`);
    mi.addEventListener("click", () => {
      closeStart();
      if (it[2] === "ext") { const a = document.createElement("a"); a.href = CONFIG.X_PROFILE_URL; a.target = "_blank"; a.rel = "noopener noreferrer"; document.body.appendChild(a); a.click(); a.remove(); return; }
      if (it[2] === "shutdown") { shutDown(); return; }
      openApp(it[0]);
    });
    items.appendChild(mi);
  });
  document.body.appendChild(menu);

  const startBtn = bar.querySelector("#startBtn");
  function closeStart() { menu.classList.remove("open"); startBtn.classList.remove("open"); }
  startBtn.addEventListener("click", (e) => { e.stopPropagation(); const open = menu.classList.toggle("open"); startBtn.classList.toggle("open", open); });
  document.addEventListener("click", (e) => { if (menu.classList.contains("open") && !menu.contains(e.target) && !startBtn.contains(e.target)) closeStart(); });
}

function showRoryDialog() {
  if (document.querySelector(".dialog98")) return;
  const dlg = el(`<div class="dialog98" role="dialog" aria-label="RORY.EXE">
    <div class="dlg-title"><span class="dlg-name">RORY.EXE</span><button class="dlg-x" aria-label="Close">✕</button></div>
    <div class="dlg-body"><p class="dlg-text">Well, you're here now.</p>
      <div class="dlg-btns"><button class="dlg-btn" data-role="ok">Continue</button><button class="dlg-btn" data-role="close">Close</button></div></div>
  </div>`);
  windowLayer.appendChild(dlg);
  const r = dlg.getBoundingClientRect();
  dlg.style.left = Math.max(8, Math.round((window.innerWidth - r.width) / 2)) + "px";
  dlg.style.top = Math.round(window.innerHeight * 0.4) + "px";
  const close = () => dlg.remove();
  dlg.querySelector(".dlg-x").addEventListener("click", close);
  dlg.querySelector("[data-role=close]").addEventListener("click", close);
  dlg.querySelector("[data-role=ok]").addEventListener("click", close);
  const title = dlg.querySelector(".dlg-title");
  title.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".dlg-x")) return;
    const ox = e.clientX - dlg.offsetLeft, oy = e.clientY - dlg.offsetTop;
    const mv = (ev) => { dlg.style.left = (ev.clientX - ox) + "px"; dlg.style.top = (ev.clientY - oy) + "px"; };
    const up = () => { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); };
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  });
}

/* boot */
applyCompact();
renderIcons();
renderDock();
initWin98();
tickClock(); setInterval(tickClock, 1000);
openApp("paint");
(function offsetPaint() {
  const pw = openWindows.get("paint"); if (!pw) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = pw.node.offsetWidth, h = pw.node.offsetHeight;
  // Tuck the portrait into the lower-right corner, clear of the icons, on all sizes.
  const win98 = document.body.classList.contains("win98");
  const compact = document.body.classList.contains("compact");
  const bottomReserve = win98 ? (compact ? 42 : 48) : 96;
  const margin = compact ? 8 : 12;
  pw.node.style.left = Math.max(8, vw - w - margin) + "px";
  pw.node.style.top = Math.max(8, vh - bottomReserve - h - margin) + "px";
})();

// Deter right-click / drag-save on photography
document.addEventListener("contextmenu", (e) => { if (e.target.closest("img")) e.preventDefault(); });
document.addEventListener("dragstart", (e) => { if (e.target.closest("img")) e.preventDefault(); });
