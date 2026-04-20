import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Group,
  Rect,
  Circle,
  Text,
  Transformer,
  Line,
} from "react-konva";

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
  height,
  aspectRatio = 2,
  minHeight = 280,
  maxHeight = 460,
  floatingHint,
  floatingHintTitle,
  floatingHintLines,
}) {
  const SNAP_THRESHOLD = 12;
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(800);
  const shapeRefs = useRef({});
  const trRef = useRef(null);
  const [dragGuides, setDragGuides] = useState({ x: null, y: null });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(Math.max(320, el.clientWidth || 800));
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const rafId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
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
  const stageHeight = useMemo(() => {
    if (typeof height === "number") return height;
    const raw = Math.round(width / aspectRatio);
    return Math.max(minHeight, Math.min(maxHeight, raw));
  }, [width, height, aspectRatio, minHeight, maxHeight]);

  const tableById = useMemo(() => {
    const map = new Map();
    for (const t of tables) map.set(t.table_id, t);
    return map;
  }, [tables]);

  const selectedTable = useMemo(() => {
    if (!selectedId) return null;
    return tableById.get(selectedId) || null;
  }, [tableById, selectedId]);

  function tableMetrics(table) {
    const shape = table?.shape || "rect";
    if (shape === "round") {
      const r = table?.radius ?? 28;
      return { halfW: r, halfH: r };
    }
    const w = table?.width ?? 64;
    const h = table?.height ?? 48;
    return { halfW: w / 2, halfH: h / 2 };
  }

  function snapPosition(tableId, nextX, nextY) {
    const table = tableById.get(tableId);
    if (!table) return { x: nextX, y: nextY, guideX: null, guideY: null };

    const { halfW, halfH } = tableMetrics(table);
    const selfXMarkers = [
      { value: nextX, offset: 0 }, // center
      { value: nextX - halfW, offset: halfW }, // left
      { value: nextX + halfW, offset: -halfW }, // right
    ];
    const selfYMarkers = [
      { value: nextY, offset: 0 }, // center
      { value: nextY - halfH, offset: halfH }, // top
      { value: nextY + halfH, offset: -halfH }, // bottom
    ];

    const targetX = [];
    const targetY = [];
    for (const t of tables) {
      if (t.table_id === tableId) continue;
      const x = Number.isFinite(t.position_x) ? t.position_x : 0;
      const y = Number.isFinite(t.position_y) ? t.position_y : 0;
      const m = tableMetrics(t);
      targetX.push(x, x - m.halfW, x + m.halfW);
      targetY.push(y, y - m.halfH, y + m.halfH);
    }

    let snappedX = nextX;
    let snappedY = nextY;
    let guideX = null;
    let guideY = null;
    let bestDx = SNAP_THRESHOLD + 1;
    let bestDy = SNAP_THRESHOLD + 1;

    for (const marker of selfXMarkers) {
      for (const tx of targetX) {
        const diff = Math.abs(marker.value - tx);
        if (diff < bestDx && diff <= SNAP_THRESHOLD) {
          bestDx = diff;
          snappedX = tx + marker.offset;
          guideX = tx;
        }
      }
    }
    for (const marker of selfYMarkers) {
      for (const ty of targetY) {
        const diff = Math.abs(marker.value - ty);
        if (diff < bestDy && diff <= SNAP_THRESHOLD) {
          bestDy = diff;
          snappedY = ty + marker.offset;
          guideY = ty;
        }
      }
    }

    return { x: snappedX, y: snappedY, guideX, guideY };
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  return (
    <div
      ref={wrapRef}
      className="w-full rounded-2xl border border-[#E8DFD0] bg-white p-3"
    >
      <Stage
        width={width}
        height={stageHeight}
        className="w-full"
        onMouseDown={(e) => {
          if (!editable) return;
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) onSelect?.(null);
        }}
      >
        <Layer>
          {tables.map((t, idx) => {
            const x = Number.isFinite(t.position_x)
              ? t.position_x
              : fallbackLayout(t, idx).x;
            const y = Number.isFinite(t.position_y)
              ? t.position_y
              : fallbackLayout(t, idx).y;

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
                onDragStart={() => {
                  if (!editable) return;
                  setDragGuides({ x: null, y: null });
                }}
                onDragMove={(e) => {
                  if (!editable) return;
                  const currentX = e.target.x();
                  const currentY = e.target.y();
                  const snapped = snapPosition(t.table_id, currentX, currentY);
                  e.target.x(Math.round(snapped.x));
                  e.target.y(Math.round(snapped.y));
                  setDragGuides({ x: snapped.guideX, y: snapped.guideY });
                }}
                onDragEnd={(e) => {
                  const nx = Math.round(e.target.x());
                  const ny = Math.round(e.target.y());
                  setDragGuides({ x: null, y: null });
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

          {!editable && floatingHint && selectedTable ? (
            (() => {
              const x = Number.isFinite(selectedTable.position_x)
                ? selectedTable.position_x
                : 0;
              const y = Number.isFinite(selectedTable.position_y)
                ? selectedTable.position_y
                : 0;
              const { halfH } = tableMetrics(selectedTable);
              const title = typeof floatingHintTitle === "string" ? floatingHintTitle : "";
              const lines = Array.isArray(floatingHintLines)
                ? floatingHintLines
                : [];

              const paddingX = 10;
              const paddingY = 8;
              const lineH = 16;
              const maxLineLen = Math.max(
                title.length,
                ...lines.map((l) => String(l || "").length),
              );
              // rough width estimate (monospace-ish) to avoid measuring on canvas
              const boxW = clamp(12 + maxLineLen * 7, 160, 320);
              const boxH = paddingY * 2 + (title ? lineH : 0) + lines.length * lineH;

              const anchorX = x;
              const anchorY = y - halfH - 10;
              const boxX = clamp(anchorX + 14, 8, width - boxW - 8);
              const boxY = clamp(anchorY - boxH, 8, stageHeight - boxH - 8);

              return (
                <Group x={0} y={0} listening={false}>
                  <Line
                    points={[anchorX, y - halfH, boxX, boxY + boxH / 2]}
                    stroke="#8B6F47"
                    strokeWidth={1}
                    dash={[4, 4]}
                    opacity={0.7}
                  />
                  <Rect
                    x={boxX}
                    y={boxY}
                    width={boxW}
                    height={boxH}
                    cornerRadius={12}
                    fill="#FAF7F2"
                    stroke="#E8DFD0"
                    strokeWidth={1}
                    shadowColor="rgba(61,57,53,0.18)"
                    shadowBlur={10}
                    shadowOffset={{ x: 0, y: 6 }}
                    shadowOpacity={0.5}
                  />
                  {title ? (
                    <Text
                      x={boxX + paddingX}
                      y={boxY + paddingY}
                      width={boxW - paddingX * 2}
                      text={title}
                      fontSize={13}
                      fontStyle="600"
                      fill="#5D4E37"
                    />
                  ) : null}
                  {lines.map((l, i) => (
                    <Text
                      key={i}
                      x={boxX + paddingX}
                      y={boxY + paddingY + (title ? lineH : 0) + i * lineH}
                      width={boxW - paddingX * 2}
                      text={String(l ?? "")}
                      fontSize={12}
                      fill="#7D6E5C"
                    />
                  ))}
                </Group>
              );
            })()
          ) : null}

          {editable && dragGuides.x != null ? (
            <Line
              points={[dragGuides.x, 0, dragGuides.x, stageHeight]}
              stroke="#8B6F47"
              strokeWidth={1}
              dash={[6, 4]}
              listening={false}
            />
          ) : null}
          {editable && dragGuides.y != null ? (
            <Line
              points={[0, dragGuides.y, width, dragGuides.y]}
              stroke="#8B6F47"
              strokeWidth={1}
              dash={[6, 4]}
              listening={false}
            />
          ) : null}

          {editable && selectedId ? (
            <Transformer
              ref={trRef}
              rotateEnabled
              keepRatio={false}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
              ]}
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
                  const nextRadius = Math.max(
                    12,
                    Math.round(node.radius() * Math.max(scaleX, scaleY)),
                  );
                  next.radius = nextRadius;
                } else {
                  const nextWidth = Math.max(
                    22,
                    Math.round(node.width() * scaleX),
                  );
                  const nextHeight = Math.max(
                    22,
                    Math.round(node.height() * scaleY),
                  );
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
