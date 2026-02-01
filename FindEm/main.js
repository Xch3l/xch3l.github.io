const emoji = [
	"😈", "😺", "😀", "😎", "💩",
	"👽", "🎃", "🐶", "🐭", "🐹",
	"🐰", "🐺", "🐮", "🐷", "🐸",
	"🐼", "🐨", "🐵", "🐯", "🐻",
	"🤠", "🤓", "🤡", "🤖", "💀",
	"🦍", "🦊", "🦝", "🦁", "🦌",
	"🦛", "🦡"
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

	// Give time for everyone to disappear and show our target alone
	setTimeout(x => divMessage.classList.remove("hide"), 2000);
}

// The thing that runs when we misclick or otherwise don't hit our target
function badCard() {
	gameState.tries--;
	fillLives();

	if(gameState.tries == 0) {
		divStartText.style.display = "none";
		divWinText.style.display = "none";
		divLoseText.style.display = "";
		divMessage.style.display = "";
		divMessage.classList.remove("hide");
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
		style:{left:`${x}px`, top:`${y}px`}
	}, divPlayfield);

	card.onclick = callback.bind(card); // assign callback

	return {dir, x, y, dx, dy, card};
}

// Starts a new game
function newGame() {
	// Ensure limits
	gameState.maxTargets = Math.max(3, Math.min(32, gameState.maxTargets)); // specially this one, with a roster so small we can lock up the page!
	gameState.lives = Math.max(1, Math.min(99, gameState.lives)); // allow a bit more lives for the savvy ones
	gameState.crowd = Math.max(2, Math.min(500, gameState.crowd)); // ensure we have at least some "variety"

	const playSet = new Array(gameState.maxTargets);
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

	// Rare chance! Find the void!
	if(Math.random() < 0.001)
		playSet[0] = "🐈‍⬛";

	// Create our target character
	const g = createCard(playSet[0], goodCard);
	g.goodCard = true;
	newCards.push(g);

	// Create the crowd
	for(var i = 0; i < gameState.crowd; i++) {
		var n = (i % playSet.length);
		while(n == 0) n++;
		newCards.push(createCard(playSet[n], badCard));
	}

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
	setTimeout(x => divMessage.classList.add("hide"), 1000);
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

		card.card.style.left = `${card.x}px`;
		card.card.style.top = `${card.y}px`;
	});

	gameState.animationFrame = requestAnimationFrame(updateGame);
}

divMessage.ontransitionend = () => {
	divMessage.style.display = divMessage.classList.contains("hide") ? "none" : "";
};

const difficultyLevel = location.search.match(/difficulty=(?<value>easy|medium|hard|custom)/i)?.groups.value;

switch(difficultyLevel) {
	case "easy":
		gameState.maxTargets = 5;
		gameState.crowd = 25;
		gameState.lives = 5;
		break;

	default:
	case "medium":
		gameState.maxTargets = 10;
		gameState.crowd = 50;
		gameState.lives = 3;
		break;

	case "hard":
		gameState.maxTargets = 30;
		gameState.crowd = 100;
		gameState.lives = 1;
		break;

	case "custom":
		const targets = parseInt(location.search.match(/characters=(?<value>\d+)/i)?.groups.value);
		const crowd = parseInt(location.search.match(/crowd=(?<value>\d+)/i)?.groups.value);
		const lives = parseInt(location.search.match(/lives=(?<value>\d+)/i)?.groups.value);

		gameState.maxTargets = Math.min(30, Math.max(5, targets || 0));
		gameState.crowd = Math.min(250, Math.max(5, crowd || 0));
		gameState.lives = Math.min(10, Math.max(1, lives || 0));
		break;
}

(divWinText.onclick = divLoseText.onclick = newGame)();
