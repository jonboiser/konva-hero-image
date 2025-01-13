import { Group, Circle, Line, Arc, Text, Rect } from 'react-konva';
import { Point2D } from './line-segment';

export type Rectangle =
	| {
			stage: 'endpoint-pending';
			points: Point2D[];
			pendingPoint: Point2D;
	  }
	| {
			stage: 'complete';
			points: Point2D[];
	  };

export const updateRectangle = (point: Point2D, rect: Rectangle | null): Rectangle => {
	if (!rect) {
		return {
			stage: 'endpoint-pending',
			points: [point],
			pendingPoint: point,
		};
	}
	if (rect.stage === 'endpoint-pending') {
		return {
			stage: 'complete',
			points: [...rect.points, point],
		};
	}
	return rect;
};

export const updateRectanglePending = (point: Point2D, angle: Rectangle): Rectangle => {
	if (angle?.stage === 'complete') return angle;
	return {
		...angle,
		pendingPoint: point,
	};
};

export interface AngleProps {
	angle: Rectangle | null;
}

export function Rectangle(props: { angle: Rectangle | null }) {
	const angle = props.angle;
	if (!angle) return null;
	const endpoint = angle.stage === 'complete' ? angle.points[1] : angle.pendingPoint;

	return (
		<Group>
			<Rect
				id="search-rect"
				x={angle.points[0].x}
				y={angle.points[0].y}
				width={endpoint.x - angle.points[0].x}
				height={endpoint.y - angle.points[0].y}
				fill={'rgba(0, 0, 0, 0.1)'}
			/>
		</Group>
	);
}
