import React, { useMemo, useState, } from 'react'
import { Canvas, } from '@react-three/fiber'
import { CameraControls, OrthographicCamera, Line } from '@react-three/drei'
import useResizeObserver from "use-resize-observer";

const PADDING = 0.025;

export const CurveEditor: React.FC = () => {
    const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
    const size = useMemo(() => Math.min(width, height), [height, width]);

    const [hoverPoint, setHoverPoint] = useState<[number, number, number]>();
    const cursor = useMemo(() => {
        if (hoverPoint) {
            return "crosshair"
        }
        return undefined;
    }, [hoverPoint]);

    const [positions, setPositions] = useState<[number, number][]>(() => [[0, 0], [1, 1,]]);
    const positionsVec3 = useMemo(() =>
        positions.map(p => [...p, 0] as const), [positions]);

    const pointView = useMemo(() => positionsVec3.map((position) =>
        <mesh position={position}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshBasicMaterial color={0x2da12d} />
        </mesh>), [positionsVec3]);

    const lineView = useMemo(() =>
        <Line
            points={positionsVec3 as any}
            color="#00ff00"
            lineWidth={3}
            segments
            dashed={false}
        />, [positionsVec3]);


    const lineInteractiveView = useMemo(() =>
        <Line
            points={positionsVec3 as any}
            color="#ff00ff"
            lineWidth={16}
            segments
            transparent
            opacity={0}
            dashed={false}
            onPointerMove={({ pointOnLine }) => {
                if (!pointOnLine) {
                    return pointOnLine;
                }
                const { x, y, z } = pointOnLine;
                setHoverPoint([x, y, z])
            }}
            onPointerLeave={() => setHoverPoint(undefined)}
        />, [positionsVec3]);

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
                <Canvas style={{
                    cursor,
                }}>
                    <color attach="background" args={["#16161D"]} />

                    <ambientLight intensity={Math.PI / 2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

                    {pointView}
                    {lineView}
                    {lineInteractiveView}
                    {hoverPoint &&
                        <mesh position={hoverPoint}>
                            <sphereGeometry args={[0.025, 12, 12]} />
                            <meshBasicMaterial color={0x2da12d} />
                        </mesh>}

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