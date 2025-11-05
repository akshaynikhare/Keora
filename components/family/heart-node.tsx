import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { HEART_NODE_WIDTH, HEART_NODE_HEIGHT } from './tree-constants';

interface HeartNodeProps {
  data: {
    color?: string;
  };
}

function HeartNode({ data }: HeartNodeProps) {
  const color = data.color || '#ec4899';

  return (
    <div className="heart-node relative">
      {/* Left Handle - for left spouse */}
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{ background: color, opacity: 0.1, left: '-1px' }}
      />

      {/* Right Handle - for right spouse */}
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        style={{ background: color, opacity: 0.1, right: '-1px' }}
      />

      {/* Top Handle - for parent connections if needed */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={{ background: color, opacity: 0.1 }}
      />

      {/* Bottom Handle - for children */}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={{ background: color, opacity: 0.1, bottom: '-1px' }}
      />

      {/* Heart Icon */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: `${HEART_NODE_WIDTH}px`,
          height: `${HEART_NODE_HEIGHT}px`,
        }}
      >
        <span
          style={{
            fontSize: '32px',
            lineHeight: '1',
          }}
        >
          ❤️
        </span>
      </div>
    </div>
  );
}

export default memo(HeartNode);
