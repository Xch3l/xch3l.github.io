# Find 'Em

It's like that game where you have to find the Wanted character among a crowd, except that, due to international laws, it's distinct enough 😉

### How to play

Each round, you'll be given a character to find among a crowd of other characters. You have three attempts to Find 'Em, represented as 💖 on the top-right corner of the screen. There is no time limit and you can play as long as you want.

### Game settings

Setting URL parameters you can pick the difficulty level or customize the game. By default the game starts in `medium`, these are the other options:

- `difficulty=easy`
	- 5 lives
	- Crowd of 25 people
	- 5 different characters*

- `difficulty=medium` (the default)
	- 3 lives
	- Crowd of 50 people
	- 10 different characters*

- `difficulty=hard`
	- 1 life
	- Crowd of 100 people
	- 30 different characters*

Additionally, setting `difficulty` to `custom` allows fine tuning the game via extra parameters:

- `lives=<1-10>`: Sets how many lives.
- `crowd=<5-250>`: Sets how many people on screen.
- `characters=<5-30>`: Sets the variety of different characters* to choose from.

For example, adding `?difficulty=easy` to the URL will start an easy game.

\* Due to the nature of computers, saying "different" may be too generous but even so, I tried to make it varied enough. 😅
