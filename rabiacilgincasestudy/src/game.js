import { Container, Sprite, Text, Graphics, Assets } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from ".";
import { gsap } from "gsap";
import Board from "./Board";
import WinScreen from "./WinScreen";

export default class Game extends Container {
  constructor() {
    super();

    // ===== LEVEL DATA =====
    this.words = [
      { word: "GOLD", boxes: [0, 1, 2, 3], found: false },
      { word: "LOG", boxes: [2, 5, 8], found: false },
      { word: "DOG", boxes: [6, 7, 8], found: false },
      { word: "GOD", boxes: [0, 4, 6], found: false }
    ];

    this.currentWordData = this.words[0];
    this.currentWord = this.currentWordData.word;
    this.currentBoxes = this.currentWordData.boxes;

    this.allLetters = ["G", "O", "D", "L"];
    this.letters = [...this.allLetters];

    // ===== STATE =====
    this.selectedLetters = [];
    this.letterTexts = [];
    this.gameCompleted = false;
    this.isDragging = false;

    // ===== SCENE OBJECTS =====
    this.board = null;
    this.winScreen = null;
    this.dragLine = new Graphics();
    this.circle = null;
    this.shuffleBtn = null;
    this.playButtonBg = null;
    this.playButton = null;
    this.hintBg = null;
    this.instructionText = null;

    // ===== TWEEN REFS =====
    this.playNowTweenText = null;
    this.playNowTweenBg = null;
    this.handTween = null;

    // ===== HINT / TUTORIAL =====
    this.hintTimeout = null;
    this.hintDelay = 2000;
    this.hand = null;

    this.init();
  }

  async init() {
    // ===== BACKGROUND =====
    try {
      const bgTexture = await Assets.load("assets/core/bg.png");
      const bg = new Sprite(bgTexture);
      bg.width = GAME_WIDTH;
      bg.height = GAME_HEIGHT;
      this.addChild(bg);
    } catch (e) {
      const bgFallback = new Graphics();
      bgFallback.beginFill(0x1c1c1c);
      bgFallback.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      bgFallback.endFill();
      this.addChild(bgFallback);
    }

    // ===== BOARD =====
    this.board = new Board(this);

    // ===== HINT =====
    const noteY = 100 + 60 + 8 + 60 + 8 + 60 + 40;

    this.hintBg = new Graphics();
    this.hintBg.beginFill(0x31c85a);
    this.hintBg.drawRoundedRect(0, 0, 240, 36, 10);
    this.hintBg.endFill();
    this.hintBg.x = (GAME_WIDTH - 240) / 2;
    this.hintBg.y = noteY - 28;
    this.addChild(this.hintBg);

    this.instructionText = new Text(`Connect the letters ${this.currentWord}`, {
      fontSize: 16,
      fill: 0xffffff,
      fontWeight: "bold"
    });
    this.instructionText.anchor.set(0.5);
    this.instructionText.x = GAME_WIDTH / 2;
    this.instructionText.y = this.hintBg.y + 18;
    this.addChild(this.instructionText);

    this.hideHint();

    // ===== LETTER CIRCLE =====
    const circleY = GAME_HEIGHT - 250;

    this.circle = new Graphics();
    this.circle.beginFill(0xffffff, 0.28);
    this.circle.drawCircle(0, 0, 105);
    this.circle.endFill();
    this.circle.lineStyle(2, 0xffffff, 0.35);
    this.circle.drawCircle(0, 0, 105);
    this.circle.x = GAME_WIDTH / 2;
    this.circle.y = circleY;
    this.addChild(this.circle);

    // ===== SHUFFLE =====
    try {
      const shuffleTexture = await Assets.load("assets/core/suffle.png");
      this.shuffleBtn = new Sprite(shuffleTexture);
      this.shuffleBtn.anchor.set(0.5);
      this.shuffleBtn.width = 42;
      this.shuffleBtn.height = 42;
      this.shuffleBtn.alpha = 0.7;
      this.shuffleBtn.tint = 0x5f5448;
      this.shuffleBtn.x = this.circle.x;
      this.shuffleBtn.y = this.circle.y;
      this.shuffleBtn.eventMode = "static";
      this.shuffleBtn.cursor = "pointer";
      this.shuffleBtn.on("pointerdown", () => this.shuffleLetters());
      this.addChild(this.shuffleBtn);
    } catch (e) {
      this.shuffleBtn = new Graphics();
      this.shuffleBtn.beginFill(0x000000, 0.001);
      this.shuffleBtn.drawCircle(0, 0, 22);
      this.shuffleBtn.endFill();
      this.shuffleBtn.x = this.circle.x;
      this.shuffleBtn.y = this.circle.y;
      this.shuffleBtn.eventMode = "static";
      this.shuffleBtn.cursor = "pointer";
      this.shuffleBtn.on("pointerdown", () => this.shuffleLetters());

      const shuffleText = new Text("⟳", {
        fontSize: 24,
        fill: 0x5f5448,
        fontWeight: "bold"
      });
      shuffleText.anchor.set(0.5);
      shuffleText.x = 0;
      shuffleText.y = 0;
      this.shuffleBtn.addChild(shuffleText);

      this.addChild(this.shuffleBtn);
    }

    // ===== DRAG LINE =====
    this.addChild(this.dragLine);

    // ===== LETTERS =====
    this.updateLettersPosition();

    // ===== HAND =====
    await this.createHand();

    // ===== PLAY NOW =====
    this.playButtonBg = new Graphics();
    this.playButtonBg.beginFill(0x4a4037, 0.95);
    this.playButtonBg.drawRoundedRect(0, 0, 180, 48, 18);
    this.playButtonBg.endFill();
    this.playButtonBg.lineStyle(2, 0xffffff, 0.25);
    this.playButtonBg.drawRoundedRect(0, 0, 180, 48, 18);
    this.playButtonBg.pivot.set(90, 24);
    this.playButtonBg.x = GAME_WIDTH / 2;
    this.playButtonBg.y = GAME_HEIGHT - 62;
    this.playButtonBg.eventMode = "none";
    this.playButtonBg.cursor = "default";
    this.addChild(this.playButtonBg);

    this.playButton = new Text("PLAY NOW!", {
      fontSize: 20,
      fill: 0xffffff,
      fontWeight: "bold"
    });
    this.playButton.anchor.set(0.5);
    this.playButton.x = GAME_WIDTH / 2;
    this.playButton.y = GAME_HEIGHT - 62;
    this.playButton.eventMode = "none";
    this.playButton.cursor = "default";
    this.addChild(this.playButton);

    this.startPlayNowPulse();

    // ===== WIN SCREEN =====
    this.winScreen = new WinScreen();
    this.addChild(this.winScreen);
    this.winScreen.hide();

    // ===== EVENTS =====
    this.eventMode = "static";
    this.on("pointermove", this.onDragMove.bind(this));
    this.on("pointerup", this.onDragEnd.bind(this));
    this.on("pointerupoutside", this.onDragEnd.bind(this));

    this.scheduleHint();
  }

  // ===== HAND =====
  async createHand() {
    try {
      const handTexture = await Assets.load("assets/core/hand.png");
      this.hand = new Sprite(handTexture);
      this.hand.anchor.set(0.25, 0.15);
      this.hand.scale.set(0.22);
      this.hand.visible = false;
      this.addChild(this.hand);
    } catch (e) {
      this.hand = new Graphics();
      this.hand.beginFill(0xffffff);
      this.hand.drawCircle(0, 0, 10);
      this.hand.endFill();
      this.hand.visible = false;
      this.addChild(this.hand);
    }
  }

  // ===== PLAY NOW =====
  startPlayNowPulse() {
    if (this.playNowTweenText) this.playNowTweenText.kill();
    if (this.playNowTweenBg) this.playNowTweenBg.kill();

    this.playButton.scale.set(1);
    this.playButtonBg.scale.set(1);

    this.playNowTweenText = gsap.to(this.playButton.scale, {
      x: 1.08,
      y: 1.08,
      duration: 0.75,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    this.playNowTweenBg = gsap.to(this.playButtonBg.scale, {
      x: 1.04,
      y: 1.04,
      duration: 0.75,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }

  // ===== HINT =====
  hideHint() {
    this.hintBg.visible = false;
    this.instructionText.visible = false;
  }

  showHint() {
    if (this.gameCompleted) return;
    this.hintBg.visible = true;
    this.instructionText.visible = true;
  }

  updateHintToNextWord() {
    const nextWord = this.words.find((w) => !w.found);

    if (nextWord) {
      this.currentWordData = nextWord;
      this.currentWord = nextWord.word;
      this.currentBoxes = nextWord.boxes;
      this.instructionText.text = `Connect the letters ${nextWord.word}`;
    } else {
      this.instructionText.text = "Great!";
    }
  }

  scheduleHint() {
    clearTimeout(this.hintTimeout);

    if (this.gameCompleted) return;

    this.hintTimeout = setTimeout(() => {
      this.updateHintToNextWord();
      this.showHint();
      this.showTutorialHand();
    }, this.hintDelay);
  }

  // ===== TUTORIAL HAND =====
  hideTutorialHand() {
    if (this.handTween) {
      this.handTween.kill();
      this.handTween = null;
    }
    if (this.hand) {
      this.hand.visible = false;
    }
  }

  getNextUnfoundWord() {
    return this.words.find((w) => !w.found) || null;
  }

  getLetterDisplayPositions() {
    const map = {};

    this.letterTexts.forEach((text) => {
      if (!map[text.letterValue]) {
        map[text.letterValue] = [];
      }
      map[text.letterValue].push({ x: text.x, y: text.y });
    });

    return map;
  }

  getTutorialPathForWord(word) {
    const positions = this.getLetterDisplayPositions();
    const path = [];
    const used = {};

    for (const char of word) {
      const list = positions[char] || [];
      if (!used[char]) used[char] = 0;
      const idx = used[char];
      if (!list[idx]) return [];
      path.push(list[idx]);
      used[char] += 1;
    }

    return path;
  }

  showTutorialHand() {
    if (this.gameCompleted || !this.hand) return;

    const nextWord = this.getNextUnfoundWord();
    if (!nextWord) return;

    const path = this.getTutorialPathForWord(nextWord.word);
    if (path.length === 0) return;

    this.hideTutorialHand();

    this.hand.visible = true;
    this.hand.x = path[0].x + 8;
    this.hand.y = path[0].y + 8;
    this.hand.alpha = 1;
    this.hand.scale.set(0.22);

    const timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.5
    });

    timeline.fromTo(
      this.hand.scale,
      { x: 0.22, y: 0.22 },
      { x: 0.25, y: 0.25, duration: 0.35, yoyo: true, repeat: 1, ease: "sine.inOut" }
    );

    for (let i = 0; i < path.length; i++) {
      timeline.to(this.hand, {
        x: path[i].x + 8,
        y: path[i].y + 8,
        duration: i === 0 ? 0.01 : 0.45,
        ease: "power1.inOut"
      });
    }

    timeline.to(this.hand, {
      alpha: 0.75,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });

    this.handTween = timeline;
  }

  // ===== LETTERS =====
  updateLettersPosition() {
    this.letterTexts.forEach((t) => this.removeChild(t));
    this.letterTexts = [];

    this.letters.forEach((letter, i) => {
      const text = new Text(letter, {
        fontSize: 38,
        fill: 0xff8c00,
        fontWeight: "900"
      });

      text.anchor.set(0.5);

      const angle = (i / this.letters.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 75;

      text.x = this.circle.x + Math.cos(angle) * radius;
      text.y = this.circle.y + Math.sin(angle) * radius;

      text.eventMode = "static";
      text.cursor = "pointer";
      text.letterValue = letter;
      text.on("pointerdown", () => this.onDragStart(text));

      this.addChild(text);
      this.letterTexts.push(text);
    });

    if (this.hand) {
      this.setChildIndex(this.hand, this.children.length - 1);
    }
  }

  // ===== DRAG =====
  onDragStart(letterText) {
    if (this.gameCompleted) return;

    clearTimeout(this.hintTimeout);
    this.hideHint();
    this.hideTutorialHand();

    this.isDragging = true;
    this.selectedLetters = [];

    this.dragLine.clear();
    this.dragLine.lineStyle(5, 0xff8c00, 0.85);

    this.addLetter(letterText);
  }

  onDragMove(e) {
    if (!this.isDragging || this.gameCompleted) return;

    const pos = e.global;

    this.dragLine.clear();
    this.dragLine.lineStyle(5, 0xff8c00, 0.85);

    if (this.selectedLetters.length > 0) {
      this.dragLine.moveTo(this.selectedLetters[0].x, this.selectedLetters[0].y);

      this.selectedLetters.forEach((l) => {
        this.dragLine.lineTo(l.x, l.y);
      });

      this.dragLine.lineTo(pos.x, pos.y);
    }

    this.letterTexts.forEach((letter) => {
      if (this.selectedLetters.includes(letter)) return;

      const dx = letter.x - pos.x;
      const dy = letter.y - pos.y;

      if (Math.sqrt(dx * dx + dy * dy) < 30) {
        this.addLetter(letter);
      }
    });
  }

  onDragEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;

    const formedWord = this.selectedLetters.map((l) => l.letterValue).join("");

    const matchedWordData = this.words.find(
      (w) => !w.found && w.word === formedWord
    );

    if (matchedWordData) {
      this.fillWord(matchedWordData);
    } else if (formedWord.length > 0) {
      this.instructionText.text = "Try again";
      this.showHint();

      setTimeout(() => {
        if (!this.gameCompleted) {
          this.hideHint();
          this.scheduleHint();
        }
      }, 500);
    } else {
      this.scheduleHint();
    }

    this.dragLine.clear();
    this.selectedLetters = [];
    this.resetLetterScales();
  }

  addLetter(letterText) {
    if (this.selectedLetters.includes(letterText)) return;
    this.selectedLetters.push(letterText);
    letterText.scale.set(1.12);
  }

  resetLetterScales() {
    this.letterTexts.forEach((letter) => {
      letter.scale.set(1);
      letter.visible = true;
      letter.alpha = 1;
    });
  }

  // ===== BOARD FILL =====
  fillWord(wordData) {
    this.board.fillWord(wordData.word, wordData.boxes);
    wordData.found = true;
    this.checkWord();
  }

  // ===== COMPLETE CHECK =====
  checkWord() {
    const allFound = this.words.every((w) => w.found);

    setTimeout(async () => {
      if (allFound) {
        this.gameCompleted = true;
        clearTimeout(this.hintTimeout);
        this.hideHint();
        this.hideTutorialHand();

        this.letterTexts.forEach((text) => {
          text.visible = false;
        });

        this.board.hide();

        if (this.circle) this.circle.visible = false;
        if (this.shuffleBtn) this.shuffleBtn.visible = false;
        this.dragLine.clear();

        await this.winScreen.show();

        this.playButton.style.fontSize = 24;
        this.playButtonBg.x = GAME_WIDTH / 2;
        this.playButtonBg.y = GAME_HEIGHT - 170;
        this.playButton.x = GAME_WIDTH / 2;
        this.playButton.y = GAME_HEIGHT - 170;

        this.setChildIndex(this.playButtonBg, this.children.length - 1);
        this.setChildIndex(this.playButton, this.children.length - 1);
        this.startPlayNowPulse();
      } else {
        this.letters = [...this.allLetters];
        this.updateLettersPosition();
        this.hideHint();
        this.hideTutorialHand();
        this.scheduleHint();
      }
    }, 500);
  }

  // ===== SHUFFLE =====
  shuffleLetters() {
    if (this.gameCompleted || this.isDragging) return;

    clearTimeout(this.hintTimeout);
    this.hideHint();
    this.hideTutorialHand();

    const values = this.letterTexts.map((t) => t.letterValue);

    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    this.letterTexts.forEach((text, i) => {
      text.letterValue = values[i];
      text.text = values[i];
    });

    this.resetLetterScales();
    this.scheduleHint();
  }

  // ===== RESET =====
  resetGame() {
    clearTimeout(this.hintTimeout);
    this.hideTutorialHand();

    this.currentWordData = this.words[0];
    this.currentWord = this.currentWordData.word;
    this.currentBoxes = this.currentWordData.boxes;
    this.letters = [...this.allLetters];
    this.selectedLetters = [];
    this.gameCompleted = false;

    this.words.forEach((word) => {
      word.found = false;
    });

    this.board.reset();

    this.dragLine.clear();

    if (this.circle) this.circle.visible = true;
    if (this.shuffleBtn) this.shuffleBtn.visible = true;

    this.letterTexts.forEach((text) => {
      text.visible = true;
    });

    this.hideHint();
    this.winScreen.hide();

    this.playButton.style.fontSize = 20;
    this.playButtonBg.x = GAME_WIDTH / 2;
    this.playButtonBg.y = GAME_HEIGHT - 62;
    this.playButton.x = GAME_WIDTH / 2;
    this.playButton.y = GAME_HEIGHT - 62;

    this.updateLettersPosition();
    this.shuffleLetters();
    this.startPlayNowPulse();
    this.scheduleHint();
  }
}