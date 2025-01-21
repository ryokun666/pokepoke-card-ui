"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Card } from "./Card";
import { Suspense, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eclipse as Flip, Shuffle } from "lucide-react";

// カードの表面画像の配列
const cardFronts = [
  "/front/card01.jpg",
  "/front/card02.jpg",
  "/front/card03.jpg",
  "/front/card04.jpg",
  "/front/card05.jpg",
  "/front/card06.jpg",
  "/front/card07.jpg",
  "/front/card08.jpg",
  "/front/card09.jpg",
  "/front/card10.jpg",
  "/front/card11.jpg",
];

// ランダムなカードを取得する関数
const getRandomCard = () => {
  return cardFronts[Math.floor(Math.random() * cardFronts.length)];
};

export function Scene() {
  const [animation, setAnimation] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState(getRandomCard());
  const [isChangingCard, setIsChangingCard] = useState(false);

  // フリップアニメーション完了時の処理
  useEffect(() => {
    if (animation === null && isChangingCard) {
      const currentIndex = cardFronts.indexOf(currentCard);
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * cardFronts.length);
      } while (newIndex === currentIndex);
      setCurrentCard(cardFronts[newIndex]);
      setIsChangingCard(false);
    }
  }, [animation, currentCard, isChangingCard]);

  // カード変更処理
  const changeCard = useCallback(() => {
    setIsChangingCard(true);
    setAnimation("flip");
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Canvasは3Dシーンを描画するためのコンテナ */}
      <Canvas
        // カメラの初期位置と視野角(FOV)を設定
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="flex-1 bg-white"
        // デバイスのピクセル比に応じてレンダリング品質を調整
        dpr={[1, 2]}
      >
        {/* シーンの背景色を設定 */}
        <color attach="background" args={["#f5f5f5"]} />

        {/* 環境光：シーン全体を柔らかく照らす */}
        <ambientLight intensity={0.8} />

        {/* メインの平行光源：太陽光のような主光源 */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* 補助光源：影の部分を柔らかく照らす */}
        <directionalLight position={[-5, -2, -5]} intensity={0.3} />

        {/* フィルライト：正面からの柔らかい光 */}
        <directionalLight position={[0, 0, 8]} intensity={0.5} />

        {/* Suspenseは3Dモデルの読み込み中の表示を制御 */}
        <Suspense fallback={null}>
          {/* 3Dカードモデルを配置 */}
          <Card
            position={[0, 0, 0]}
            animation={animation}
            frontImage={currentCard}
            onAnimationComplete={() => setAnimation(null)}
          />

          {/* 環境マッピング：3Dモデルに環境反射を追加 */}
          <Environment preset="sunset" background={false} />

          {/* カメラのコントロール設定 */}
          <OrbitControls
            // ズームを無効化
            enableZoom={false}
            // パン（平行移動）を無効化
            enablePan={false}
            // カメラの垂直回転を制限（Math.PI/2 = 90度）
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* ボタングループを画面下部に固定 */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setAnimation("flip")}
          className="bg-white/80 backdrop-blur-sm"
        >
          <Flip className="mr-2 h-4 w-4" />
          フリップ
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={changeCard}
          className="bg-white/80 backdrop-blur-sm"
        >
          <Shuffle className="mr-2 h-4 w-4" />
          カード変更
        </Button>
      </div>
    </div>
  );
}
