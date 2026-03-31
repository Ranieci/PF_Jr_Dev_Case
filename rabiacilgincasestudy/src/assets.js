import { Assets } from "pixi.js";

export async function initAssets() {
  console.log("Asset'ler yüklenmeye çalışılıyor...");
  const assetsToTry = [
    "assets/core/bg.png",
    "assets/core/circle.png", 
    "assets/core/rect.png",
    "assets/core/suffle.png",
    "assets/core/hand.png",
    "assets/core/logo_white.png"
  ];
  
  for (const url of assetsToTry) {
    try {
      await Assets.load(url);
      console.log("✅ Yüklendi:", url);
    } catch (e) {
      console.log("⚠️ Yüklenemedi:", url);
    }
  }
  
  return true;
}