import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Group, Rect, Circle, Text, Transformer } from "react-konva";

function fallbackLayout(table, idx) {
  const col = idx % 8;
  const row = Math.floor(idx / 8);
  return { x: 40 + col * 80, y: 40 + row * 80 };
}

function tableFill({ enabled, selected }) {
  if (selected) return "#8B6F47";
  if (!enabled) return "#E8DFD0";
  return "#FAF7F2";
}

function tableStroke({ enabled, selected }) {
  if (selected) return "#5D4E37";
  if (!enabled) return "#C9B89A";
  return "#8B6F47";
}

/**
 * Reusable cinema-like table map.
 *
 * - `tables`: array of table rows from API
 * - `enabledTableIds`: Set (or array) of selectable ids (e.g. available tables)
 * - `selectedId`: currently selected table_id
 * - `onSelect(id)`: click handler
 * - `editable`: enable drag
 * - `onMove(id, {x,y})`: drag end handler
 */
export default function TableMap({
  tables = [],
  enabledTableIds,
  selectedId,
  onSelect,
  editable = false,
  onMove,
  onTransform,
  height = 420,
}) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(800);
  const shapeRefs = useRef({});
  const trRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setWidth(Math.max(320, el.clientWidth || 800));
    });
    ro.observe(el);
    setWidth(Math.max(320, el.clientWidth || 800));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!editable) return;
    const id = selectedId;
    const tr = trRef.current;
    if (!tr || !id) return;
    const node = shapeRefs.current?.[id];
    if (!node) return;
    tr.nodes([node]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, editable, tables]);

  const enabledSet = useMemo(() => {
    if (!enabledTableIds) return null;
    if (enabledTableIds instanceof Set) return enabledTableIds;
    return new Set(enabledTableIds);
  }, [enabledTableIds]);

  return (
    <div ref={wrapRef} className="w-full rounded-2xl border border-[#E8DFD0] bg-white p-3">
      <Stage
        width={width}
        height={height}
        className="w-full"
        onMouseDown={(e) => {
          if (!editable) return;
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) onSelect?.(null);
        }}
      >
        <Layer>
          {tables.map((t, idx) => {
            const x = Number.isFinite(t.position_x) ? t.position_x : fallbackLayout(t, idx).x;
            const y = Number.isFinite(t.position_y) ? t.position_y : fallbackLayout(t, idx).y;

            const shape = t.shape || "rect";
            const w = t.width ?? 64;
            const h = t.height ?? 48;
            const r = t.radius ?? 28;
            const rotation = t.rotation ?? 0;
            const enabled = enabledSet ? enabledSet.has(t.table_id) : true;
            const selected = selectedId === t.table_id;

            return (
              <Group
                key={t.table_id}
                x={x}
                y={y}
                rotation={rotation}
                draggable={editable}
                onDragEnd={(e) => {
                  const nx = Math.round(e.target.x());
                  const ny = Math.round(e.target.y());
                  onMove?.(t.table_id, { x: nx, y: ny });
                }}
                onClick={() => enabled && onSelect?.(t.table_id)}
                onTap={() => enabled && onSelect?.(t.table_id)}
                opacity={enabled ? 1 : 0.55}
              >
                {shape === "round" ? (
                  <Circle
                    ref={(node) => {
                      if (!node) return;
                      shapeRefs.current[t.table_id] = node;
                    }}
                    radius={r}
                    fill={tableFill({ enabled, selected })}
                    stroke={tableStroke({ enabled, selected })}
                    strokeWidth={2}
                  />
                ) : (
                  <Rect
                    ref={(node) => {
                      if (!node) return;
                      shapeRefs.current[t.table_id] = node;
                    }}
                    width={w}
                    height={h}
                    offsetX={w / 2}
                    offsetY={h / 2}
                    cornerRadius={12}
                    fill={tableFill({ enabled, selected })}
                    stroke={tableStroke({ enabled, selected })}
                    strokeWidth={2}
                  />
                )}
                <Text
                  text={String(t.table_number || "")}
                  fontSize={14}
                  fontStyle="600"
                  fill={selected ? "#FAF7F2" : "#3D3935"}
                  x={shape === "round" ? -r : -w / 2}
                  y={shape === "round" ? -r : -h / 2}
                  width={shape === "round" ? r * 2 : w}
                  height={shape === "round" ? r * 2 : h}
                  align="center"
                  verticalAlign="middle"
                />
              </Group>
            );
          })}

          {editable && selectedId ? (
            <Transformer
              ref={trRef}
              rotateEnabled
              keepRatio={false}
              enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
              boundBoxFunc={(oldBox, newBox) => {
                // prevent too small
                if (newBox.width < 22 || newBox.height < 22) return oldBox;
                return newBox;
              }}
              onTransformEnd={() => {
                const id = selectedId;
                const node = shapeRefs.current?.[id];
                if (!node) return;

                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                // normalize transform into explicit geometry fields
                let next = {
                  rotation: Math.round(node.getAbsoluteRotation()),
                };

                if (node.className === "Circle") {
                  const nextRadius = Math.max(12, Math.round(node.radius() * Math.max(scaleX, scaleY)));
                  next.radius = nextRadius;
                } else {
                  const nextWidth = Math.max(22, Math.round(node.width() * scaleX));
                  const nextHeight = Math.max(22, Math.round(node.height() * scaleY));
                  next.width = nextWidth;
                  next.height = nextHeight;
                }

                // reset scale so future transforms apply cleanly
                node.scaleX(1);
                node.scaleY(1);

                onTransform?.(id, next);
                node.getLayer()?.batchDraw();
              }}
            />
          ) : null}
        </Layer>
      </Stage>
    </div>
  );
}

