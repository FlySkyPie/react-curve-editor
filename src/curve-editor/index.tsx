import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react'
import { Canvas, } from '@react-three/fiber'
import { OrthographicCamera, Line, } from '@react-three/drei'

import { createBoundary, type TupleVec2, type TupleVec3 } from './utils';
import { Container } from './container';

const PADDING = 0.025;

type IDraggingSession = {
    index: number;
    boundary: [x0: number, y0: number, x1: number, y1: number];
    position: [x: number, y: number];
};

type IProps = {
    onUpdated?: (value: TupleVec2[]) => void;
};

export const CurveEditor: React.FC<IProps> = ({ onUpdated }) => {
    /**
     * Point that hovered on line.
     */
    const [hoverPoint, setHoverPoint] = useState<TupleVec3>();

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

    const [positions, setPositions] = useState<TupleVec2[]>(() => [[0, 0], [1, 1,]]);

    const onUpdatedRef = useRef(onUpdated);
    onUpdatedRef.current = onUpdated;
    useEffect(() => {
        onUpdatedRef.current && onUpdatedRef.current(positions);
    }, [positions]);

    const editingPositions = useMemo(() => {
        if (!dragging) {
            return;
        }

        return positions.map((position, index) => {
            if (dragging.index !== index) {
                return position;
            }

            return dragging.position;
        });
    }, [dragging, positions]);
    const positionsVec3 = useMemo<Array<TupleVec3>>(() =>
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


            const nextArray: TupleVec2[] = [
                ...prev.slice(0, targetIndex + 1),
                [hoverPoint[0], hoverPoint[1]],
                ...prev.slice(targetIndex + 1)
            ];

            return nextArray;
        });
    }, [hoverPoint]);

    const pointView = useMemo(() => positions
        .filter((_, index) => {
            if (!dragging) {
                return true;
            }
            return index !== dragging.index;
        })
        .map((position, index) =>
            <mesh
                key={index}
                position={[...position, 0]}
                onPointerDown={() => {
                    setHoverPoint(undefined);
                    setDragging({
                        index,
                        boundary: createBoundary(index, positions),
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
            </mesh>), [dragging, positions]);

    const lineView = useMemo(() =>
        <Line
            points={editingPositions || positionsVec3}
            color="#00ff00"
            lineWidth={3}
            dashed={false}
        />, [editingPositions, positionsVec3]);

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
        <Container>
            <Canvas style={{
                cursor,
            }}
                onPointerUp={() => {
                    setDragging(undefined);

                    if (editingPositions) {
                        setPositions(editingPositions);
                    }
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

                {dragging &&
                    <mesh position={[...dragging.position, 0]}>
                        <sphereGeometry args={[0.025, 12, 12]} />
                        <meshBasicMaterial color={0x2da12d} />
                    </mesh>}

                <mesh
                    position={[0.5, 0.5, -10]}
                    onPointerMove={({ point: { x, y } }) => {
                        if (!dragging) {
                            return;
                        }
                        setDragging(prev => {
                            if (!prev) {
                                return undefined
                            }
                            const { boundary } = prev;
                            return {
                                ...prev,
                                position: [
                                    Math.min(Math.max(boundary[0], x), boundary[2]),
                                    Math.min(Math.max(boundary[1], y), boundary[3]),
                                ]
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
        </Container>
    );
}