import { Group, Circle, Line } from 'react-konva';
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

const updatePendingPoint = (point: Point2D, angle: Angle | null): Angle => {
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
			points: [...angle.points],
			pendingPoint: point,
		};
	}
	if (angle.stage === 'endpoint-pending') {
		return {
			stage: 'complete',
			points: [...angle.points, angle.pendingPoint, point],
		};
	}
	return angle;
};

export function AngleDrawing(props: { angle: Angle }) {
	return (
		<Group>
			{props.angle.points.map((pt, i) => (
				<Circle key={i} x={pt.x} y={pt.y} radius={5} fill="black" />
			))}
			{props.angle.points.map((point, idx) => {
				if (idx === props.angle.points.length - 1) return null;
				return (
					<Line
						points={[
							props.angle.points[idx].x,
							props.angle.points[idx].y,
							props.angle.points[idx + 1].x,
							props.angle.points[idx + 1].y,
							// props.angle.pendingPoint.x,
							// props.angle.pendingPoint.y,
						]}
						stroke="black"
					/>
				);
			})}
			{'pendingPoint' in props.angle ? (
				<Line
					points={[
						props.angle.points[props.angle.points.length - 1].x,
						props.angle.points[props.angle.points.length - 1].y,
						props.angle.pendingPoint.x,
						props.angle.pendingPoint.y,
					]}
					stroke="black"
				/>
			) : null}
		</Group>
	);
}
