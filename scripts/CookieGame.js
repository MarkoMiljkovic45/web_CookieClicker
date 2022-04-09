class Utils {
    static setDummyHighscores() {
        if (!localStorage.getItem("highscores")) {
            let dummyHighscores = [{highscore: 50, username: "Mate"}, {highscore: 30, username: "Ivo"}, {highscore: 20, username:"Iva"}];
            localStorage.setItem("highscores", JSON.stringify(dummyHighscores));
        }
    }

    static formatTwoDigits(number) {
        return number < 10 ? "0" + number : number;
    }

    static formatTime(time) {
        const minutes = Utils.formatTwoDigits(parseInt(time / 60, 10));
        const seconds = Utils.formatTwoDigits(parseInt(time % 60, 10));
        return minutes + ":" + seconds;
    }
}

class HighScoreManager {
    static getHighScores() {
        const highscores = localStorage.getItem("highscores");
        if (!highscores) {
            throw new Error("Highscores not set!");
        }

        return JSON.parse(highscores);
    }

    static updateHighScore(user, score) {
        const highscores = HighScoreManager.getHighScores();
        let foundEntry = highscores.findIndex(oldEntry => oldEntry.username == user);
        if (foundEntry != -1) {
            highscores.splice(foundEntry, 1);
        }
        highscores.push({ highscore: score, username: user});
        highscores.sort(function(a,b) {return b.highscore - a.highscore});
        localStorage.setItem("highscores", JSON.stringify(highscores));
    }
}

class CookieGame {
    cookieCount = 0;
    gameIntervalTimer = null;
    updateTimerUI = null;
    resetGameUI = null;
    updateHighScoreListUI = null;

    constructor(updateTimerUI, resetGameUI, updateHighScoreListUI) {
        this.updateTimerUI = updateTimerUI;
        this.resetGameUI = resetGameUI;
        this.updateHighScoreListUI = updateHighScoreListUI;
    }

    startGame(duration) {
        let countdown = duration;
        this.updateTimerUI(duration);
        this.gameIntervalTimer = setInterval(() => {
            countdown--;
            if (countdown < 0) {
                const username = prompt(`Your score was ${this.cookieCount}. Please enter your username:`);
                
                HighScoreManager.updateHighScore(username, this.cookieCount);
                this.updateHighScoreListUI();
                console.log(username, this.cookieCount);
                this.resetGame(duration);
            } else {
                this.updateTimerUI(Utils.formatTime(countdown));
            }
            
        }, 1000)
    }

    resetGame(duration) {
        if(!gameStarted) {
            return;
        }
        let timer = duration;
        this.updateTimerUI(Utils.formatTime(duration));
        clearInterval(this.gameIntervalTimer);
        this.cookieCount = 0;
        this.resetGameUI();
    }
}

function resetGameUI() {
    gameStarted = false;
    cookieCountDisplay.textContent = 0;
    btnStart.textContent = "START";
}

function updateHighScoreListUI() {
    let highscoreList = document.querySelector(".highscore--list");
    if (!highscoreList) {
        throw new Error("Cannot find highscore list!");
    }

    while(highscoreList.firstChild) {
        highscoreList.firstChild.remove();
    }

    const highscores = HighScoreManager.getHighScores();
    highscores.forEach(score => {
        let listItem = document.createElement("li");
        listItem.textContent = `${score.username}: ${score.highscore}`;
        highscoreList.appendChild(listItem);
    })
}

let cookie = document.getElementById("img--cookie");
let cookieCountDisplay = document.querySelector("#click-count");
let btnStart = document.querySelector(".btn--start");
let timer = document.getElementById("timer");

let gameStarted = false;

if (!cookie || !cookieCountDisplay || !btnStart || !timer) {
    alert("UI not loaded");
} else {
    Utils.setDummyHighscores();

    const cookieGame = new CookieGame(
        (timeString) => timer.textContent = timeString,
        resetGameUI,
        updateHighScoreListUI
    );

    cookie.onclick = () => {
        cookieCountDisplay.textContent = ++cookieGame.cookieCount;
    }

    btnStart.onclick = () => {
        const tenSeconds = 10;
        if(!gameStarted) {
            cookieGame.startGame(tenSeconds);
            btnStart.textContent = "RESET";
            gameStarted = true;
            cookieCountDisplay.textContent = 0;
        } else {
            cookieGame.resetGame(tenSeconds);
        }
    }
}