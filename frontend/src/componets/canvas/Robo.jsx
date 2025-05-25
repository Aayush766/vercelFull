import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { OrbitControls, Preload, useGLTF, Environment } from '@react-three/drei';
import CanvasLoader from '../Loader';

const Model = ({ isMobile }) => {
  const { scene } = useGLTF('./robot/EMO Bot.gltf');

  // Model rotation effect
  useEffect(() => {
    let frameId;
    const rotateModel = () => {
      scene.rotation.y += 0.015; // Adjust the speed of rotation
      frameId = requestAnimationFrame(rotateModel);
    };
    rotateModel();

    return () => cancelAnimationFrame(frameId); // Cleanup on unmount
  }, [scene]);

  return (
    <mesh>
      {/* Ambient light to brighten the whole scene */}
      <ambientLight intensity={1} />

      {/* Directional light for stronger highlights and shadows */}
      <directionalLight 
        intensity={0} 
        position={[2, 5, 3]} 
        castShadow 
        shadow-mapSize={1024} 
      />

      {/* Hemispheric light for general ambient light */}
      <hemisphereLight intensity={0} groundColor="black" />

      {/* Point light for additional brightness */}
      <pointLight intensity={0} position={[5, 5, 5]} />

      <spotLight
        position={[-10, 30, 10]}
        angle={0.2}
        penumbra={1}
        intensity={1.5}
        castShadow
        shadow-mapSize={1024}
      />

      {/* Slightly increased scale for a bigger view */}
      <primitive
        object={scene}
        scale={isMobile ? 0.02 : 0.02}  // Slightly bigger scale
        position={isMobile ? [0, -1.2, 0] : [0, -2.5, 0]}  // Keep model’s base at the bottom
        rotation={[0.0, 0, 0]}  // Model’s initial rotation
      />
    </mesh>
  );
};

const ModelCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 500px)');
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (e) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  return (
    <Canvas
      frameLoop="demand"
      shadows
      camera={{ position: [0, 1, 7], fov: 50 }}  // Camera remains the same for full view
      gl={{ preserveDrawingBuffer: true }}
    >
      <Suspense fallback={<CanvasLoader />}>
        {/* Disable zoom and ensure full model view */}
        <OrbitControls
          enableZoom={false}  // Disable zoom
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          enablePan={false}  // Disable panning to lock the view
        />
        {/* Environment for realistic lighting */}
        <Environment preset="sunset" />
        <Model isMobile={isMobile} />
      </Suspense>
      <Preload all />
    </Canvas>
  );
};

export default ModelCanvas;
