import { Group, Circle, Line, Arc } from 'react-konva';
import { Point2D } from './line-segment';

export type Angle =
	| {
			stage: 'vertex-pending';
			points: Point2D[];
			pendingPoint: Point2D;
	  }
	| {
			stage: 'endpoint-pending';
			points: Point2D[];
			pendingPoint: Point2D;
	  }
	| {
			stage: 'complete';
			points: Point2D[];
	  };

export const updateAngle = (point: Point2D, angle: Angle | null): Angle => {
	if (!angle) {
		return {
			stage: 'vertex-pending',
			points: [point],
			pendingPoint: point,
		};
	}
	if (angle.stage === 'vertex-pending') {
		return {
			stage: 'endpoint-pending',
			points: [...angle.points, point],
			pendingPoint: point,
		};
	}
	if (angle.stage === 'endpoint-pending') {
		return {
			stage: 'complete',
			points: [...angle.points, point],
		};
	}
	return angle;
};

export const updateAnglePending = (point: Point2D, angle: Angle): Angle => {
	if (angle?.stage === 'complete') return angle;
	return {
		...angle,
		pendingPoint: point,
	};
};

export interface AngleProps {
	angle: Angle | null;
}

export function AngleDrawing(props: { angle: Angle | null }) {
	const angle = props.angle;
	if (!angle) return null;

	const getArcParams = () => {
		if (angle.stage !== 'endpoint-pending' && angle.stage !== 'complete') return null;
		const [p1, p2, p3] =
			angle.stage === 'complete' ? angle.points : [angle.points[0], angle.points[1], angle.pendingPoint];

		// Calculate vectors
		const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
		const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

		// Calculate magnitudes
		const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
		const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

		// Calculate dot product
		const dotProduct = v1.x * v2.x + v1.y * v2.y;

		// Calculate angle using dot product formula
		let angleRad = Math.acos(dotProduct / (mag1 * mag2));

		// Always use the acute angle (less than 180 degrees)
		if (angleRad > Math.PI) {
			angleRad = 2 * Math.PI - angleRad;
		}

		// Calculate rotation based on the first vector
		const rotation = Math.atan2(v1.y, v1.x);

		return {
			x: p2.x,
			y: p2.y,
			radius: 30,
			angle: (angleRad * 180) / Math.PI,
			rotation: (rotation * 180) / Math.PI,
		};
	};

	const arcParams = getArcParams();

	return (
		<Group>
			{angle.points.map((pt, i) => (
				<Circle key={i} x={pt.x} y={pt.y} radius={5} fill="black" />
			))}
			{angle.points.map((point, idx) => {
				if (idx === angle.points.length - 1) return null;
				return (
					<Line
						points={[
							angle.points[idx].x,
							angle.points[idx].y,
							angle.points[idx + 1].x,
							angle.points[idx + 1].y,
						]}
						stroke="black"
					/>
				);
			})}
			{'pendingPoint' in angle ? (
				<>
					<Line
						points={[
							angle.points[angle.points.length - 1].x,
							angle.points[angle.points.length - 1].y,
							angle.pendingPoint.x,
							angle.pendingPoint.y,
						]}
						stroke="red"
						strokeWidth={10}
					/>
					{arcParams && (
						<Arc
							x={arcParams.x}
							y={arcParams.y}
							angle={arcParams.angle}
							rotation={arcParams.rotation}
							innerRadius={arcParams.radius}
							outerRadius={arcParams.radius}
							stroke="blue"
							strokeWidth={2}
						/>
					)}
				</>
			) : (
				arcParams && (
					<Arc
						x={arcParams.x}
						y={arcParams.y}
						angle={arcParams.angle}
						rotation={arcParams.rotation}
						innerRadius={arcParams.radius}
						outerRadius={arcParams.radius}
						stroke="blue"
						strokeWidth={2}
					/>
				)
			)}
		</Group>
	);
}
