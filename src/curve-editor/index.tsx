import React, { useCallback, useMemo, useState, } from 'react'
import { Canvas, } from '@react-three/fiber'
import { OrthographicCamera, Line, CameraControls } from '@react-three/drei'
import useResizeObserver from "use-resize-observer";

const PADDING = 0.025;

type IDraggingSession = {
    index: number;
    // boundary: [x0: number, y0: number, x1: number, y1: number];
    position: [x: number, y: number];
};

export const CurveEditor: React.FC = () => {
    const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
    const size = useMemo(() => Math.min(width, height), [height, width]);

    /**
     * Point that hovered on line.
     */
    const [hoverPoint, setHoverPoint] = useState<[number, number, number]>();

    /**
     * Index that hovered on point (sphere).
     */
    const [hoverIndex, setHoverIndex] = useState<number>();

    const [dragging, setDragging] = useState<IDraggingSession>();

    const cursor = useMemo(() => {
        if (hoverPoint) {
            return "crosshair"
        }
        if (hoverIndex !== undefined) {
            return "grab";
        }
        return undefined;
    }, [hoverPoint, hoverIndex]);

    const [positions, setPositions] = useState<[number, number][]>(() => [[0, 0], [1, 1,]]);
    const positionsVec3 = useMemo<Array<[number, number, number]>>(() =>
        positions.map(p => [...p, 0]), [positions]);

    const onAddPoint = useCallback(() => {
        if (!hoverPoint) {
            return;
        }

        setPositions(prev => {
            let targetIndex = -1;
            for (let index = 0; index < prev.length - 1; index++) {
                const current = prev[index];
                const next = prev[index + 1];
                if (current[1] <= hoverPoint[1] &&
                    next[1] >= hoverPoint[1]
                ) {
                    targetIndex = index;
                    break;
                }

            }
            if (targetIndex === -1) {
                return prev;
            }


            const nextArray: [number, number][] = [
                ...prev.slice(0, targetIndex + 1),
                [hoverPoint[0], hoverPoint[1]],
                ...prev.slice(targetIndex + 1)
            ];

            return nextArray;
        });
    }, [hoverPoint]);

    const pointView = useMemo(() => positionsVec3
        .filter((_, index) => {
            if (!dragging) {
                return true;
            }
            return index !== dragging.index;
        })
        .map((position, index) =>
            <mesh
                position={position}
                onPointerDown={() => {
                    setHoverPoint(undefined);
                    setDragging({
                        index,
                        // boundary,
                        position: [position[0], position[1]],
                    })
                }}
                onPointerMove={(event) => {
                    if (dragging) {
                        return;
                    }

                    event.stopPropagation();
                    setHoverPoint(undefined);

                    setHoverIndex(index);
                }}
                onPointerLeave={() => setHoverIndex(undefined)}
            >
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color={0x2da12d} />
            </mesh>), [dragging, positionsVec3]);

    const lineView = useMemo(() =>
        <Line
            points={positionsVec3}
            color="#00ff00"
            lineWidth={3}
            dashed={false}
        />, [positionsVec3]);


    const lineInteractiveView = useMemo(() =>
        !dragging &&
        <Line
            points={positionsVec3}
            color="#ff00ff"
            lineWidth={16}
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
            onClick={onAddPoint}
        />, [dragging, onAddPoint, positionsVec3]);

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
                }}
                    onPointerUp={() => setDragging(undefined)}>
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

                    {dragging &&
                        <mesh position={[...dragging.position, 0]}>
                            <sphereGeometry args={[0.025, 12, 12]} />
                            <meshBasicMaterial color={0x2da12d} />
                        </mesh>}

                    <mesh
                        position={[0.5, 0.5, -10]}
                        onPointerMove={({ point }) => {
                            if (!dragging) {
                                return;
                            }
                            setDragging(prev => {
                                if (!prev) {
                                    return undefined
                                }
                                return {
                                    ...prev,
                                    position: [point.x, point.y]
                                }
                            })
                        }}>
                        <planeGeometry args={[1, 1]} />
                        <meshBasicMaterial
                            color={"#ff00ff"}
                            opacity={0.5}
                            transparent
                        />
                    </mesh>

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

                    {/* <CameraControls makeDefault /> */}
                </Canvas>
            </div>
        </div>
    );
}