const emoji = [
	"😈", "😺", "😀", "😎", "💩", "👽", "🎃", "🐶", "🐭", "🐹",
	"🐰", "🐺", "🐮", "🐷", "🐸", "🐼", "🐨", "🐵", "🐯", "🐻",
	"🤠", "🤓", "🤡", "🤖", "💀", "🦍", "🦊", "🦝", "🦁", "🦌",
	"🦛", "🦡", "🐲", "🦒", "🐗", "🐔", "🐴", "🌝", "🌚", "⛄",
	"👻", "👹", "🧸", "🗿", "🎅", "👃", "🍄", "🪐"
];

function createElement(tag, attrs, parent) {
	tag = document.createElement(tag);

	if(attrs) {
		if("style" in attrs) {
			Object.assign(tag.style, attrs.style);
			delete attrs.style;
		}

		if("dataset" in attrs) {
			Object.assign(tag.dataset, attrs.style);
			delete attrs.dataset;
		}

		Object.assign(tag, attrs);
	}

	if(parent)
		parent.appendChild(tag);

	return tag;
}

const gameState = {cards:[], tries:4, lastFrame:0};

function createTimeout(fn, delay) {
	clearTimeout(gameState.timeout);
	gameState.timeout = setTimeout(fn, delay);
}

// Creates a row of hearts representing remaining lives
function fillLives() {
	if(gameState.tries >= 10) {
		divLives.textContent = `💖x${gameState.tries}`;
		return;
	}

	const s = [];

	for(var i = 0; i < gameState.lives; i++)
		s[i] = (i < gameState.tries ? "💖" : "💔");

	divLives.textContent = s.join("");
}

// The thing that runs when we find our target
function goodCard() {
	cancelAnimationFrame(gameState.animationFrame); // freeze everyone

	// Fade everyone but our target away
	gameState.cards.forEach(c => {
		if(!c.goodCard)
			c.card.style.opacity = 0;
	});

	// Set message visibilities
	divStartText.style.display = "none";
	divLoseText.style.display = "none";
	divWinText.style.display = "";
	divMessage.style.display = "";

	// Set time text
	spanTimeTaken.textContent = ((Date.now() - gameState.gameStart) / 1000).toFixed(2);

	// Give time for everyone to disappear and show our target alone
	createTimeout(x => divMessage.classList.remove("hide"), 2000);
}

// The thing that runs when we misclick or otherwise don't hit our target
function badCard() {
	gameState.tries--;
	fillLives();

	if(gameState.tries <= 0) {
		divStartText.style.display = "none";
		divWinText.style.display = "none";
		divLoseText.style.display = "";
		divMessage.style.display = "";
		createTimeout(x => divMessage.classList.remove("hide"), 10);
		return;
	}

	this.ontransitionend = x => this.style.display = "none";
	this.style.opacity = 0;
}

// Creates a new character to roam around
function createCard(textContent, callback) {
	const dir = Math.random() * Math.PI * 2; // random direction
	const dx = Math.cos(dir) * 50 * devicePixelRatio; // horizontal speed
	const dy = Math.sin(dir) * 50 * devicePixelRatio; // vertical speed
	const x = Math.random() * innerWidth; // randomize location
	const y = Math.random() * innerHeight; // ...vertically too

	const card = createElement("span", {
		className:"card", textContent,
		style:{left:`${Math.round(x)}px`, top:`${Math.round(y)}px`}
	}, divPlayfield);

	card.onclick = callback.bind(card); // assign callback

	return {x, y, dx, dy, card};
}

// Starts a new game
function newGame() {
	// Ensure limits
	gameState.lives = Math.max(1, Math.min(99, gameState.lives)); // allow a bit more lives for the savvy ones

	const playSet = new Array(Math.max(3, Math.min(emoji.length, gameState.maxTargets)));
	const newCards = [];

	cancelAnimationFrame(gameState.animationFrame); // stand still!
	gameState.cards.forEach(c => c.card.remove()); // clean the board

	// Pick our people
	for(var i = 0; i < playSet.length; i++) {
		var e;

		do { // Ensure no repeats
			e = emoji[(Math.random() * emoji.length) >>> 0];
		} while(playSet.indexOf(e) != -1);

		playSet[i] = e;
	}

	// Create our target character
	const g = createCard(playSet[0], goodCard);
	g.goodCard = true;
	newCards.push(g);

	// Create the crowd
	while(newCards.length < Math.max(2, Math.min(500, gameState.crowd)))
		newCards.push(createCard(playSet[(newCards.length % playSet.length) || 1], badCard));

	// Init the game
	gameState.cards = newCards;
	gameState.tries = gameState.lives;
	spanTarget.textContent = playSet[0];
	spanTarget2.textContent = playSet[0];
	divWinText.style.display = "none";
	divLoseText.style.display = "none";
	divStartText.style.display = "";
	divMessage.style.display = "";

	fillLives();
	createTimeout(x => divMessage.classList.add("hide"), 1500);
	setTimeout(x => divMessage.style.display = "none", 2000); // fallback for fast clickers
	gameState.animationFrame = requestAnimationFrame(updateGame);
}

function updateGame(t) {
	const dt = (t - gameState.lastFrame) / 1000;
	gameState.lastFrame = t;
	cancelAnimationFrame(gameState.animationFrame);

	// Move everyone
	gameState.cards.forEach(card => {
		const rect = card.card.getBoundingClientRect();

		card.x += card.dx * dt;
		if(card.x < -rect.width) card.x = innerWidth;
		if(card.x > innerWidth) card.x = -rect.width;

		card.y += card.dy * dt;
		if(card.y < -rect.height) card.y = innerHeight;
		if(card.y > innerHeight) card.y = -rect.height;

		card.card.style.left = `${Math.round(card.x)}px`;
		card.card.style.top = `${Math.round(card.y)}px`;
	});

	gameState.animationFrame = requestAnimationFrame(updateGame);
}

const iconHistory = new Array(5); // keep track of the last some to avoid repeats
function setIcon() {
	var newIcon;

	do {
		newIcon = emoji[(Math.random() * emoji.length) >>> 0];
	} while(iconHistory.indexOf(newIcon) > -1);

	// Shift them over
	for(var i = iconHistory.length - 1; i > 0; i--)
		iconHistory[i] = iconHistory[i - 1];

	iconHistory[0] = newIcon;
	divIcon.textContent = newIcon;
}

// Assign events
divMessage.ontransitionend = () => {
	divMessage.style.display = divMessage.classList.contains("hide") ? "none" : "";
	gameState.gameStart = Date.now();
};

divWinText.onclick = divLoseText.onclick = newGame;

divSetup.ontransitionend = () => {
	if(divSetup.classList.contains("hide"))
		divSetup.style.display = "none";
};

btnEasy.onclick = () => {
	Object.assign(gameState, {maxTargets:5, crowd:25, lives:5});
	divSetup.classList.add("hide");
	newGame();
};

btnMedium.onclick = () => {
	Object.assign(gameState, {maxTargets:10, crowd:50, lives:3});
	divSetup.classList.add("hide");
	newGame();
};

btnHard.onclick = () => {
	Object.assign(gameState, {maxTargets:30, crowd:100, lives:1});
	divSetup.classList.add("hide");
	newGame();
};

divSetup.oncontextmenu = divMessage.oncontextmenu = ev => {
	ev.preventDefault();

	if(document.fullscreenElement)
		document.exitFullscreen();
	else
		document.documentElement.requestFullscreen();
};

// Parse params
const q = {};

location.search.substring(1).toLowerCase().split("&").forEach(x => {
	x = x.split("=");
	q[decodeURIComponent(x[0])] = decodeURIComponent(x[1]);
});

if("difficulty" in q) {
	divSetup.style.display = "none";

	switch(q.difficulty) {
		case "easy":
			btnEasy.click();
			break;

		default:
		case "medium":
			btnMedium.click();
			break;

		case "hard":
			btnHard.click();
			break;

		case "custom":
			gameState.maxTargets = Math.min(emoji.length, Math.max(5, parseInt(q.characters) || 0));
			gameState.crowd = Math.min(250, Math.max(5, parseInt(q.crowd) || 0));
			gameState.lives = Math.min(10, Math.max(1, parseInt(q.lives) || 0));
			newGame();
			break;
	}
} else {
	gameState.timeout = setInterval(setIcon, 500);
	setIcon();
}
