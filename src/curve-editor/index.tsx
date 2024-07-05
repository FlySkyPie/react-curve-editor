import React, { useMemo, useState, } from 'react'
import { Canvas, extend } from '@react-three/fiber'
import { CameraControls, OrthographicCamera, } from '@react-three/drei'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import useResizeObserver from "use-resize-observer";

extend({ MeshLineGeometry, MeshLineMaterial })
const PADDING = 0.025;

export const CurveEditor: React.FC = () => {
    const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
    const size = useMemo(() => Math.min(width, height), [height, width]);

    const [positions, setPositions] = useState<[number, number][]>(() => [[0, 0], [1, 1,]]);
    const positionsVec3 = useMemo(() =>
        positions.map(p => [...p, 0] as const), [positions]);

    const pointView = useMemo(() => positionsVec3.map((position) =>
        <mesh position={position}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color={0x2da12d} />
        </mesh>), [positionsVec3]);

    const lineView = useMemo(() =>
        <mesh >
            <meshLineGeometry points={positionsVec3.flat()} />
            <meshLineMaterial lineWidth={0.005} color="#00ff00" />
        </mesh>
        , [positionsVec3]);

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
                <Canvas >
                    <color attach="background" args={["#16161D"]} />

                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

                    {pointView}
                    {lineView}

                    <OrthographicCamera
                        makeDefault
                        top={1 + PADDING}
                        bottom={0 - PADDING}
                        left={0 - PADDING}
                        right={1 + PADDING}
                        zoom={1}
                        near={1}
                        far={2000}
                        position={[0, 0, 200]}
                    />

                    <CameraControls makeDefault />
                </Canvas>
            </div>
        </div>
    );
}