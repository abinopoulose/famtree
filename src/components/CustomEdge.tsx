import { BaseEdge, getSmoothStepPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) {
  const offsetLevel = data?.offsetLevel || 0;
  const spacing = 20; // 20px vertical separation per family line

  // Calculate the custom middle Y coordinate to prevent overlapping horizontal lines
  const baseCenterY = sourceY + (targetY - sourceY) / 2;
  const centerY = baseCenterY + (offsetLevel * spacing);

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    centerY,
  });

  return (
    <BaseEdge 
      id={id}
      path={edgePath} 
      markerEnd={markerEnd} 
      style={{ 
        ...style, 
        strokeWidth: data?.isBlue ? 3 : 2,
        stroke: data?.isBlue ? '#3b82f6' : '#94a3b8',
        filter: data?.isBlue ? 'drop-shadow(0 0 4px rgba(59,130,246,0.5))' : 'none',
        animationDirection: data?.isReverse ? 'reverse' : 'normal',
      }}
    />
  );
}
