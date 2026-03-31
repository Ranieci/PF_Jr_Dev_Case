import { Graphics, Text } from "pixi.js";
import { GAME_WIDTH } from "./index";

export default class Board {
  constructor(container) {
    this.container = container;
    this.boxes = [];
    this.filledBoxes = {};

    this.boxSize = 60;
    this.spacing = 8;

    this.create();
  }

  create() {
    const { boxSize, spacing } = this;

    const topY = 100;
    const topRowStartX = (GAME_WIDTH - (4 * boxSize) - (3 * spacing)) / 2;

    const x0 = topRowStartX;
    const x1 = topRowStartX + boxSize + spacing;
    const x2 = topRowStartX + (boxSize + spacing) * 2;
    const x3 = topRowStartX + (boxSize + spacing) * 3;

    const midY = topY + boxSize + spacing;

    const x4 = x0;
    const x5 = x2;

    const bottomY = midY + boxSize + spacing;

    const x6 = x4;
    const x7 = x1;
    const x8 = x5;

    const boxPositions = [
      { x: x0, y: topY },
      { x: x1, y: topY },
      { x: x2, y: topY },
      { x: x3, y: topY },
      { x: x4, y: midY },
      { x: x5, y: midY },
      { x: x6, y: bottomY },
      { x: x7, y: bottomY },
      { x: x8, y: bottomY }
    ];

    for (let i = 0; i < boxPositions.length; i++) {
      const pos = boxPositions[i];

      const bg = new Graphics();
      bg.beginFill(0xf3efe7);
      bg.drawRoundedRect(0, 0, boxSize, boxSize, 8);
      bg.endFill();
      bg.lineStyle(1.5, 0xd6d0c4, 1);
      bg.drawRoundedRect(0, 0, boxSize, boxSize, 8);
      bg.x = pos.x;
      bg.y = pos.y;
      this.container.addChild(bg);

      const text = new Text("", {
        fontSize: 28,
        fill: 0xffffff,
        fontWeight: "bold"
      });
      text.anchor.set(0.5);
      text.x = bg.x + boxSize / 2;
      text.y = bg.y + boxSize / 2;
      this.container.addChild(text);

      this.boxes.push({
        graphics: bg,
        text,
        filledLetter: null,
        index: i,
        defaultColor: 0xf3efe7,
        defaultBorder: 0xd6d0c4,
        filledColor: 0xff9900,
        filledBorder: 0xcc7a00
      });

      this.filledBoxes[i] = null;
    }
  }

  fillWord(word, indices) {
    for (let i = 0; i < indices.length; i++) {
      const boxIndex = indices[i];
      const box = this.boxes[boxIndex];

      box.text.text = word[i];
      box.filledLetter = word[i];
      this.filledBoxes[boxIndex] = word[i];

      box.graphics.clear();
      box.graphics.beginFill(box.filledColor);
      box.graphics.drawRoundedRect(0, 0, this.boxSize, this.boxSize, 8);
      box.graphics.endFill();
      box.graphics.lineStyle(1.5, box.filledBorder, 1);
      box.graphics.drawRoundedRect(0, 0, this.boxSize, this.boxSize, 8);
    }
  }

  reset() {
    this.boxes.forEach((box) => {
      box.graphics.visible = true;
      box.text.visible = true;
      box.text.text = "";
      box.filledLetter = null;

      box.graphics.clear();
      box.graphics.beginFill(box.defaultColor);
      box.graphics.drawRoundedRect(0, 0, this.boxSize, this.boxSize, 8);
      box.graphics.endFill();
      box.graphics.lineStyle(1.5, box.defaultBorder, 1);
      box.graphics.drawRoundedRect(0, 0, this.boxSize, this.boxSize, 8);

      this.filledBoxes[box.index] = null;
    });
  }

  hide() {
    this.boxes.forEach((box) => {
      box.graphics.visible = false;
      box.text.visible = false;
    });
  }

  show() {
    this.boxes.forEach((box) => {
      box.graphics.visible = true;
      box.text.visible = true;
    });
  }
}