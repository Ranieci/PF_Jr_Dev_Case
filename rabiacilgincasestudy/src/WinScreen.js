import { Container, Graphics, Sprite, Text, Assets } from "pixi.js";
import { GAME_WIDTH, GAME_HEIGHT } from "./index";
import { gsap } from "gsap";

export default class WinScreen extends Container {
  constructor() {
    super();

    this.overlay = null;
    this.titleTop = null;
    this.underline = null;
    this.titleBottom = null;
    this.globeContainer = null;
    this.globeTextureLayer = null;
    this.globeMask = null;
    this.globeRotationTween = null;

    this.visible = false;
    this.createStaticUI();
  }

  createStaticUI() {
    // Karartma
    this.overlay = new Graphics();
    this.overlay.beginFill(0x000000, 0.35);
    this.overlay.drawRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.overlay.endFill();
    this.addChild(this.overlay);

    // WORDS OF
    this.titleTop = new Text("WORDS OF", {
      fontFamily: "Arial",
      fontSize: 34,
      fontWeight: "bold",
      fill: 0xffffff,
      letterSpacing: 1
    });
    this.titleTop.anchor.set(0.5);
    this.titleTop.x = GAME_WIDTH / 2;
    this.titleTop.y = 150;
    this.addChild(this.titleTop);

    // LINE
    this.underline = new Graphics();
    this.underline.lineStyle(2, 0xffffff, 0.9);
    this.underline.moveTo(-85, 0);
    this.underline.lineTo(85, 0);
    this.underline.x = GAME_WIDTH / 2;
    this.underline.y = 185;
    this.addChild(this.underline);

    // WONDERS
    this.titleBottom = new Text("WONDERS", {
      fontFamily: "Georgia",
      fontSize: 54,
      fontStyle: "italic",
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: 0xe6f4ff,
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: 0xffffff,
      dropShadowBlur: 10,
      dropShadowDistance: 0
    });
    this.titleBottom.anchor.set(0.5);
    this.titleBottom.x = GAME_WIDTH / 2;
    this.titleBottom.y = 225;
    this.addChild(this.titleBottom);
  }

  async createGlobeIfNeeded() {
    if (this.globeContainer) return;

    this.globeContainer = new Container();
    this.globeContainer.x = GAME_WIDTH / 2;
    this.globeContainer.y = GAME_HEIGHT / 2 - 10;

    const globeBase = new Graphics();
    globeBase.beginFill(0x2da8ff);
    globeBase.drawCircle(0, 0, 78);
    globeBase.endFill();

    const globeHighlight = new Graphics();
    globeHighlight.beginFill(0xffffff, 0.18);
    globeHighlight.drawEllipse(-18, -18, 38, 22);
    globeHighlight.endFill();

    const globeShadow = new Graphics();
    globeShadow.beginFill(0x0f6fcb, 0.35);
    globeShadow.drawCircle(10, 10, 70);
    globeShadow.endFill();

    this.globeMask = new Graphics();
    this.globeMask.beginFill(0xffffff);
    this.globeMask.drawCircle(0, 0, 78);
    this.globeMask.endFill();

    this.globeTextureLayer = new Container();

    try {
      const globeTexture = await Assets.load("assets/core/circle.png");

      const tex1 = new Sprite(globeTexture);
      tex1.anchor.set(0.5);
      tex1.width = 140;
      tex1.height = 140;
      tex1.tint = 0x58c2ff;
      tex1.alpha = 0.55;
      tex1.x = -12;
      tex1.y = 0;

      const tex2 = new Sprite(globeTexture);
      tex2.anchor.set(0.5);
      tex2.width = 120;
      tex2.height = 120;
      tex2.tint = 0x0c84e8;
      tex2.alpha = 0.4;
      tex2.x = 26;
      tex2.y = 8;
      tex2.rotation = 0.65;

      this.globeTextureLayer.addChild(tex1);
      this.globeTextureLayer.addChild(tex2);
    } catch (e) {
      const continent1 = new Graphics();
      continent1.beginFill(0x7dd6ff, 0.5);
      continent1.drawEllipse(-18, -12, 28, 18);
      continent1.drawEllipse(12, 16, 20, 14);
      continent1.endFill();

      const continent2 = new Graphics();
      continent2.beginFill(0x0e86ea, 0.4);
      continent2.drawEllipse(22, -18, 16, 12);
      continent2.drawEllipse(-30, 20, 15, 10);
      continent2.endFill();

      this.globeTextureLayer.addChild(continent1);
      this.globeTextureLayer.addChild(continent2);
    }

    this.globeTextureLayer.mask = this.globeMask;

    this.globeContainer.addChild(globeBase);
    this.globeContainer.addChild(globeShadow);
    this.globeContainer.addChild(this.globeTextureLayer);
    this.globeContainer.addChild(globeHighlight);
    this.globeContainer.addChild(this.globeMask);

    this.addChild(this.globeContainer);
  }

  async show() {
    this.visible = true;

    await this.createGlobeIfNeeded();

    if (this.globeRotationTween) {
      this.globeRotationTween.kill();
    }

    this.globeTextureLayer.rotation = 0;
    this.globeRotationTween = gsap.to(this.globeTextureLayer, {
      rotation: Math.PI * 2,
      duration: 6,
      repeat: -1,
      ease: "none"
    });
  }

  hide() {
    this.visible = false;

    if (this.globeRotationTween) {
      this.globeRotationTween.kill();
      this.globeRotationTween = null;
    }
  }
}