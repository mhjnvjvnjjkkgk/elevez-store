import { useRef, useEffect, useCallback, ReactNode } from 'react';

interface ClickSparkProps {
    sparkColor?: string;
    sparkSize?: number;
    sparkRadius?: number;
    sparkCount?: number;
    duration?: number;
    easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
    extraScale?: number;
    children?: ReactNode;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
    sparkColor = '#00ff88',  // Match brand color
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    easing = 'ease-out',
    extraScale = 1.0,
    children
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sparksRef = useRef<Array<{ x: number; y: number; angle: number; startTime: number }>>([]);
    const startTimeRef = useRef<number | null>(null);
    const loopActiveRef = useRef(false);
    const drawRef = useRef<((timestamp: number) => void) | null>(null);

    // Resize canvas to window size (since it's position:fixed)
    useEffect(() => {
        // Skip entirely on mobile/touch — no mouse cursor, no effect needed
        const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    const easeFunc = useCallback(
        (t: number): number => {
            switch (easing) {
                case 'linear':
                    return t;
                case 'ease-in':
                    return t * t;
                case 'ease-in-out':
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                default:
                    return t * (2 - t);
            }
        },
        [easing]
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const draw = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sparksRef.current = sparksRef.current.filter(spark => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= duration) {
                    return false;
                }

                const progress = elapsed / duration;
                const eased = easeFunc(progress);

                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);

                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                ctx.strokeStyle = sparkColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                return true;
            });

            if (sparksRef.current.length > 0) {
                animationId = requestAnimationFrame(draw);
            } else {
                loopActiveRef.current = false;
                startTimeRef.current = null;
            }
        };

        drawRef.current = draw;

        // In case sparks are active during prop updates, ensure loop continues
        if (sparksRef.current.length > 0 && !loopActiveRef.current) {
            loopActiveRef.current = true;
            animationId = requestAnimationFrame(draw);
        }

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            drawRef.current = null;
        };
    }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale]);

    const handleClick = (e: React.MouseEvent) => {
        // Skip on touch devices
        const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;

        // Use clientX/clientY directly since canvas is position:fixed to viewport
        const x = e.clientX;
        const y = e.clientY;

        const now = performance.now();
        const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / sparkCount,
            startTime: now
        }));

        sparksRef.current.push(...newSparks);

        // Wake up drawing loop if it is currently idle
        if (!loopActiveRef.current && drawRef.current) {
            loopActiveRef.current = true;
            requestAnimationFrame(drawRef.current);
        }
    };

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '100vh'
            }}
            onClick={handleClick}
        >
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    userSelect: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                    zIndex: 9999
                }}
            />
            {children}
        </div>
    );
};

export default ClickSpark;

