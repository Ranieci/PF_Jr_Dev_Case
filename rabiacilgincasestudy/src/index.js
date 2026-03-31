import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
import { initAssets } from "./assets";
import { gsap } from "gsap";
import { CustomEase, PixiPlugin } from "gsap/all";
import Game from "./game";

export const GAME_WIDTH = 380;
export const GAME_HEIGHT = 800;

export const app = new Application({
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: 0x000000,
  antialias: true
});

app.ticker.stop();
gsap.ticker.add(() => app.ticker.update());

async function init() {
  try {
    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";
    document.body.style.display = "flex";
    document.body.style.flexDirection = "column";
    document.body.style.alignItems = "center";
    document.body.style.justifyContent = "flex-start";
    document.body.style.background =
      "linear-gradient(90deg, #232323 0%, #2c2c2c 50%, #232323 100%)";
    document.body.style.fontFamily = "Arial, sans-serif";
    document.body.style.overflow = "hidden";

    document.body.appendChild(app.view);

    app.view.style.width = "250px";
    app.view.style.height = "500px";
    app.view.style.display = "block";
    app.view.style.margin = "24px auto 0";
    app.view.style.borderRadius = "34px";
    app.view.style.border = "6px solid #a89d8c";
    app.view.style.boxShadow = "0 18px 50px rgba(0,0,0,0.45)";
    app.view.style.background = "#000";

    try {
      await initAssets();
      console.log("Asset'ler yüklendi");
    } catch (e) {
      console.log("Asset yükleme hatası:", e.message);
    }

    gsap.registerPlugin(PixiPlugin, CustomEase);
    PixiPlugin.registerPIXI(PIXI);

    const game = new Game();
    app.stage.addChild(game);

    window.__GAME__ = game;

    const refreshBtn = document.createElement("button");
    refreshBtn.innerHTML = "&#8635; Refresh";
    refreshBtn.style.display = "block";
    refreshBtn.style.margin = "12px auto 0";
    refreshBtn.style.padding = "10px 28px";
    refreshBtn.style.borderRadius = "14px";
    refreshBtn.style.border = "none";
    refreshBtn.style.background = "rgba(74, 64, 55, 0.95)";
    refreshBtn.style.color = "#fff";
    refreshBtn.style.fontSize = "16px";
    refreshBtn.style.fontWeight = "700";
    refreshBtn.style.cursor = "pointer";
    refreshBtn.style.boxShadow = "0 8px 22px rgba(0,0,0,0.30)";
    document.body.appendChild(refreshBtn);

    refreshBtn.onclick = () => {
      if (window.__GAME__) {
        window.__GAME__.resetGame();
      }
    };

    document.body.appendChild(refreshBtn);

    console.log("✅ Uygulama hazır!");
  } catch (error) {
    console.error("❌ Başlatma hatası:", error);
  }
}

init();