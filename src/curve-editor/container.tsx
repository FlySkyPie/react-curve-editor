import React, { useMemo, } from 'react'
import useResizeObserver from "use-resize-observer";

type IProps = {
    children: React.ReactNode;
}

/**
 * Used to keep canvas square.
 */
export const Container: React.FC<IProps> = ({ children }) => {
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
                {children}
            </div>
        </div>
    );
};
