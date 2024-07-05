import React, { useMemo, } from 'react'
import { Canvas, } from '@react-three/fiber'
import useResizeObserver from "use-resize-observer";

export const CurveEditor: React.FC = () => {
    const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
    const size = useMemo(() => Math.min(width, height), [height, width]);

    return (
        <div
            ref={ref}
            style={{
                width: "100%",
                height: "100%",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <div
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                }}>
                <Canvas>
                    <color attach="background" args={["#16161D"]} />

                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color={'orange'} />
                    </mesh>
                </Canvas>
            </div>
        </div>
    );
}