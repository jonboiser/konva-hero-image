import { Circle, Group, Line, Text } from 'react-konva';
import { LineSegment, Point2D } from './line-segment';
type LineSegment = { x1: number; y1: number; x2: number; y2: number };

export type Perpendicular =
	| {
			stage: 'base-end-pending';
			points: Point2D[];
			pendingPoint: Point2D;
	  }
	| {
			stage: 'orthogonal-pending';
			points: Point2D[];
			pendingPoint: Point2D;
	  }
	| {
			stage: 'complete';
			points: Point2D[];
	  };

export const updatePerpendicular = (point: Point2D, perp: Perpendicular | null): Perpendicular => {
	if (!perp) {
		return {
			stage: 'base-end-pending',
			points: [point],
			pendingPoint: point,
		};
	}
	if (perp.stage === 'base-end-pending') {
		return {
			stage: 'orthogonal-pending',
			points: [...perp.points, point],
			pendingPoint: point,
		};
	}
	if (perp.stage === 'orthogonal-pending') {
		return {
			stage: 'complete',
			points: [...perp.points, point],
		};
	}
	return perp;
};

export const updatePerpendicularPending = (point: Point2D, angle: Perpendicular): Perpendicular => {
	if (angle?.stage === 'complete') return angle;
	return {
		...angle,
		pendingPoint: point,
	};
};
interface PerpendicularProps {
	perpendicular: Perpendicular | null;
}

// Add this helper function before the PerpendicularDrawing component
function projectPointOntoLine(point: Point2D, lineStart: Point2D, lineEnd: Point2D): Point2D & { distance: number } {
	const dx = lineEnd.x - lineStart.x;
	// Invert dy for canvas coordinates
	const dy = -(lineEnd.y - lineStart.y);
	// Invert y-coordinates in dot product calculation
	const t = ((point.x - lineStart.x) * dx + -(point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
	const proj = {
		x: lineStart.x + t * dx,
		// Re-invert y for final result
		y: lineStart.y - t * dy,
	};
	return {
		...proj,
		distance: Math.sqrt(Math.pow(point.x - proj.x, 2) + Math.pow(point.y - proj.y, 2)),
	};
}

export function PerpendicularDrawing(props: { perpendicular: Perpendicular }) {
	const { perpendicular } = props;

	let line1: LineSegment = { x1: 0, y1: 0, x2: 0, y2: 0 };
	let line1Copy: LineSegment | null = null;
	let line2: LineSegment | null = null;
	let displayText = '';
	if (perpendicular.stage === 'base-end-pending') {
		line1 = {
			x1: perpendicular.points[0].x,
			y1: perpendicular.points[0].y,
			x2: perpendicular.pendingPoint.x,
			y2: perpendicular.pendingPoint.y,
		};
	} else if (perpendicular.stage === 'orthogonal-pending') {
		const projectedPoint = projectPointOntoLine(
			perpendicular.pendingPoint,
			perpendicular.points[0],
			perpendicular.points[1],
		);
		displayText = projectedPoint.distance.toFixed(2);
		line1 = {
			x1: perpendicular.points[0].x,
			y1: perpendicular.points[0].y,
			x2: perpendicular.points[1].x,
			y2: perpendicular.points[1].y,
		};
		line1Copy = {
			x1: perpendicular.points[0].x,
			y1: perpendicular.points[0].y,
			x2: projectedPoint.x,
			y2: projectedPoint.y,
		};
		line2 = {
			x1: perpendicular.pendingPoint.x,
			y1: perpendicular.pendingPoint.y,
			x2: projectedPoint.x,
			y2: projectedPoint.y,
		};
	} else {
		line1 = {
			x1: perpendicular.points[0].x,
			y1: perpendicular.points[0].y,
			x2: perpendicular.points[1].x,
			y2: perpendicular.points[1].y,
		};
		const projectedPoint = projectPointOntoLine(
			perpendicular.points[2],
			perpendicular.points[0],
			perpendicular.points[1],
		);
		displayText = projectedPoint.distance.toFixed(2);
		line2 = {
			x1: perpendicular.points[2].x,
			y1: perpendicular.points[2].y,
			x2: projectedPoint.x,
			y2: projectedPoint.y,
		};
	}

	return (
		<Group>
			{line1 && <Line points={[line1.x1, line1.y1, line1.x2, line1.y2]} stroke="black" strokeWidth={5} />}
			{line1Copy && <Line points={[line1Copy.x1, line1Copy.y1, line1Copy.x2, line1Copy.y2]} stroke="red" />}
			{line2 && <Line points={[line2.x1, line2.y1, line2.x2, line2.y2]} stroke="black" />}
			{perpendicular.points.map((pt, i) => (
				<Circle key={i} x={pt.x} y={pt.y} radius={10} stroke="black" strokeWidth={3} fill="white" />
			))}
			{displayText && (
				<Text
					x={perpendicular.points[0].x + 10}
					y={perpendicular.points[0].y + 10}
					text={displayText}
					fontSize={20}
					fill="black"
				/>
			)}
		</Group>
	);
}
