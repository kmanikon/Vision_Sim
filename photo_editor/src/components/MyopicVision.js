import React, { useRef, useEffect } from 'react';

function MyopicVision({ x, y, radius, iterations }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    function graduallyBlurFromPoint() {
      for (let i = 0; i < iterations; i++) {
        // Set the alpha value for the shadow
        context.globalAlpha = (iterations - i) / iterations;
        // Set the blur value for the shadow
        context.shadowBlur = i + 1;
        // Set the shadow color
        context.shadowColor = 'black';
        // Draw a circle at the specified point
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
      }
    }

    graduallyBlurFromPoint();
  }, [x, y, radius, iterations]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
    />
  );
}

export default MyopicVision