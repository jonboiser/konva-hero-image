import { useCallback, useState } from 'react';

export type Point2D = { x: number; y: number };

export type LineSegment =
	| {
			stage: 'pending';
			points: Point2D[];
			pendingPoint: Point2D;
	  }
	| {
			stage: 'complete';
			points: Point2D[];
	  };

export const initializeLineSegment = (startPoint: Point2D): LineSegment => {
	return {
		stage: 'pending',
		points: [startPoint],
		pendingPoint: startPoint,
	};
};
export const getFlatPoints = (lineSegment: LineSegment) => {
	if (!lineSegment) return [];
	if (lineSegment.stage === 'pending') {
		return [
			...lineSegment.points.flatMap((pt) => [pt.x, pt.y]),
			lineSegment.pendingPoint.x,
			lineSegment.pendingPoint.y,
		];
	}
	return lineSegment.points.flatMap((pt) => [pt.x, pt.y]);
};
export const useLineSegment = () => {
	const [lineSegment, setLineSegment] = useState<LineSegment | null>(null);
	const initialize = useCallback((startPoint: Point2D) => {
		setLineSegment(initializeLineSegment(startPoint));
	}, []);

	const updatePendingPoint = useCallback(
		(point: Point2D) => {
			if (!lineSegment) return;
			setLineSegment({
				stage: 'pending',
				points: [...lineSegment.points],
				pendingPoint: point,
			});
		},
		[lineSegment, setLineSegment],
	);

	const handleClick = (point: Point2D, onFinish: (points: number[]) => void) => {
		if (!lineSegment) {
			initialize(point);
		} else if (lineSegment.stage === 'pending') {
			const finalPoints = getFlatPoints({
				stage: 'complete',
				points: [...lineSegment.points, lineSegment.pendingPoint, point],
			});
			setLineSegment(null);
			onFinish(finalPoints);
		}
	};

	return {
		handleClick,
		lineSegment,
		setLineSegment,
		initialize,
		updatePendingPoint,
		getFlatPoints,
	};
};
