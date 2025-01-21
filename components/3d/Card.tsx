// Card.tsx
"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring, a } from "@react-spring/three";
import * as THREE from "three";

interface CardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  animation?: string | null;
  frontImage?: string;
  onAnimationComplete?: () => void;
}

export function Card({
  position,
  rotation = [0, 0, 0],
  animation,
  frontImage = "/front/card1.jpg",
  onAnimationComplete,
}: CardProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  // テクスチャ読み込み
  const textureLoader = new THREE.TextureLoader();
  const cardFront = textureLoader.load(frontImage);
  const cardBack = textureLoader.load("/card-back.jpg");

  [cardFront, cardBack].forEach((texture) => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
  });

  // ホバー時の拡大アニメーション
  const { scale } = useSpring({
    scale: hovered || isTouching ? 1.2 : 1,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // フリップアニメーション
  const { flipRotation } = useSpring({
    flipRotation: isAnimating && animation === "flip" ? Math.PI * 2 : 0,
    config: { mass: 1, tension: 180, friction: 30 },
    onRest: () => {
      if (animation === "flip") {
        setIsAnimating(false);
        onAnimationComplete?.();
      }
    },
  });

  // アニメーションプロパティが変わったらフラグをセット
  useEffect(() => {
    if (animation === "flip") {
      setIsAnimating(true);
      // フリップ開始時にカードを正面に戻す
      if (mesh.current) {
        mesh.current.rotation.x = 0;
        mesh.current.rotation.y = 0;
      }
    }
  }, [animation]);

  // マウス移動によるカードの傾き
  useFrame((state) => {
    if (!mesh.current) return;
    if (hovered && !isAnimating) {
      const targetRotationX = (-state.mouse.y * Math.PI) / 8;
      const targetRotationY = (state.mouse.x * Math.PI) / 8;
      mesh.current.rotation.x = THREE.MathUtils.lerp(
        mesh.current.rotation.x,
        targetRotationX,
        0.2
      );
      mesh.current.rotation.y = THREE.MathUtils.lerp(
        mesh.current.rotation.y,
        targetRotationY,
        0.2
      );
    } else if (!isAnimating) {
      mesh.current.rotation.x = THREE.MathUtils.lerp(
        mesh.current.rotation.x,
        0,
        0.2
      );
      mesh.current.rotation.y = THREE.MathUtils.lerp(
        mesh.current.rotation.y,
        0,
        0.2
      );
    }
  });

  // カードサイズを求める
  const getCardSize = () => {
    const isMobile = window.innerWidth < 768;
    const baseWidth = isMobile ? 1.5 : 2;
    const aspectRatio = 88 / 63; // ポケモンカード比
    return {
      width: baseWidth,
      height: baseWidth * aspectRatio,
    };
  };

  const [cardSize, setCardSize] = useState(getCardSize());

  useEffect(() => {
    const handleResize = () => {
      setCardSize(getCardSize());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 角丸のShapeを生成（useMemoでパフォーマンス最適化）
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    // 適宜、丸みを変えたい場合は値を調整
    const cornerRadius = 0.05 * cardSize.width;
    const w = cardSize.width;
    const h = cardSize.height;
    const x = -w / 2;
    const y = -h / 2;

    shape.moveTo(x + cornerRadius, y);
    shape.lineTo(x + w - cornerRadius, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + cornerRadius);
    shape.lineTo(x + w, y + h - cornerRadius);
    shape.quadraticCurveTo(x + w, y + h, x + w - cornerRadius, y + h);
    shape.lineTo(x + cornerRadius, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - cornerRadius);
    shape.lineTo(x, y + cornerRadius);
    shape.quadraticCurveTo(x, y, x + cornerRadius, y);

    return shape;
  }, [cardSize]);

  // 角丸ShapeからGeometryを生成し、UVを再計算
  const geometry = useMemo(() => {
    const shapeGeometry = new THREE.ShapeGeometry(shape);

    // 1) バウンディングボックスを計算
    shapeGeometry.computeBoundingBox();

    if (shapeGeometry.boundingBox) {
      const { min, max } = shapeGeometry.boundingBox;
      const size = new THREE.Vector2(max.x - min.x, max.y - min.y);

      // 2) UV を 0~1 の範囲になるように再計算
      const uvAttribute = shapeGeometry.getAttribute("uv");
      for (let i = 0; i < uvAttribute.count; i++) {
        const u = uvAttribute.getX(i);
        const v = uvAttribute.getY(i);
        // boundingBox の値を元に正規化
        uvAttribute.setXY(i, (u - min.x) / size.x, (v - min.y) / size.y);
      }
      uvAttribute.needsUpdate = true;
    }

    return shapeGeometry;
  }, [shape]);

  return (
    <a.mesh
      ref={mesh}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={() => !isAnimating && setHovered(true)}
      onPointerOut={() => !isAnimating && !isTouching && setHovered(false)}
      onPointerDown={() => setIsTouching(true)}
      onPointerUp={() => {
        setIsTouching(false);
        setHovered(false);
      }}
      onPointerLeave={() => {
        setIsTouching(false);
        setHovered(false);
      }}
    >
      {/* フリップアニメーション用のグループ */}
      <a.group rotation-y={flipRotation}>
        {/* カード表面 */}
        <mesh>
          <primitive object={geometry} />
          <a.meshStandardMaterial
            map={cardFront}
            side={THREE.FrontSide}
            transparent={true}
            metalness={0.8}
            roughness={0.5}
            envMapIntensity={0.4}
          />
        </mesh>
        {/* カード裏面 */}
        <mesh rotation-y={Math.PI}>
          <primitive object={geometry} />
          <a.meshStandardMaterial
            map={cardBack}
            side={THREE.FrontSide}
            transparent={true}
            metalness={0}
            roughness={0.2}
            envMapIntensity={0.5}
          />
        </mesh>
      </a.group>
    </a.mesh>
  );
}
