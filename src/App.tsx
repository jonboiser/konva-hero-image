import { forwardRef, useEffect, useRef, useState } from 'react';
import { Stage, Image, Layer, Rect, Text, Line, Circle } from 'react-konva';
import './App.css';
import Konva from 'konva';
import useImage from 'use-image';
import { getFlatPoints, useLineSegment, LineSegment } from './line-segment';
import { useHotkeys } from 'react-hotkeys-hook';

const url = 'https://fastly.picsum.photos/id/9/5000/3269.jpg?hmac=cZKbaLeduq7rNB8X-bigYO8bvPIWtT-mh8GRXtU3vPc';

function App() {
	const [stageScale, setStageScale] = useState(1);
	const [stageX, setStageX] = useState(0);
	const [stageY, setStageY] = useState(0);
	const imgRef = useRef<Konva.Image>(null);
	const [rectanglesProps, setRectanglesProps] = useState<Konva.RectConfig[] | null>(null);
	const [rectanglesVisible, setRectanglesVisible] = useState(true);
	const [linesVisible, setLinesVisible] = useState(true);
	const [linesProps, setLinesProps] = useState<Konva.LineConfig[] | null>(null);
	const [image, status] = useImage(url);
	const resetParams = useRef({ x: 0, y: 0, scale: 1 });

	const scaleBy = 1.1; // Add this constant at the top of the component

	const [activeDirection, setActiveDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
	const [activeAction, setActiveAction] = useState<'zoomIn' | 'zoomOut' | 'reset' | 'toggleDrawings' | null>(null);

	// Helper function for pan actions
	const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
		setActiveDirection(direction);
		setTimeout(() => setActiveDirection(null), 150); // Remove active state after 150ms

		switch (direction) {
			case 'up':
				setStageY(stageY + 100);
				break;
			case 'down':
				setStageY(stageY - 100);
				break;
			case 'left':
				setStageX(stageX + 100);
				break;
			case 'right':
				setStageX(stageX - 100);
				break;
		}
	};

	useHotkeys('w', () => handlePan('up'));
	useHotkeys('s', () => handlePan('down'));
	useHotkeys('a', () => handlePan('left'));
	useHotkeys('d', () => handlePan('right'));
	useHotkeys('r', () => {
		setStageY(0);
		setStageX(0);
		// stageRef.current!.x(0);
		// stageRef.current!.y(0);
		// stageRef.current!.scale({ x: resetParams.current.scale, y: resetParams.current.scale });
		// setStageX(resetParams.current.x);
		// setStageY(resetParams.current.y);
		setStageScale(resetParams.current.scale);
		// console.log(stageRef);
	});
	useHotkeys('m', () => {
		handleToggleDrawings();
	});

	const handleZoom = (scaleDirection: 'in' | 'out', mousePoint?: { x: number; y: number }) => {
		setActiveAction(scaleDirection === 'in' ? 'zoomIn' : 'zoomOut');
		setTimeout(() => setActiveAction(null), 150);

		const stage = imgRef.current?.getStage();
		if (!stage) return;

		const oldScale = stageScale;
		const newScale = scaleDirection === 'in' ? oldScale * scaleBy : oldScale / scaleBy;

		// If no mouse point provided, zoom relative to center
		const pointer = mousePoint || {
			x: stage.width() / 2,
			y: stage.height() / 2,
		};

		const mousePointTo = {
			x: (pointer.x - stageX) / oldScale,
			y: (pointer.y - stageY) / oldScale,
		};

		setStageScale(newScale);
		setStageX(pointer.x - mousePointTo.x * newScale);
		setStageY(pointer.y - mousePointTo.y * newScale);
	};

	const handleReset = () => {
		setActiveAction('reset');
		setTimeout(() => setActiveAction(null), 150);

		setStageY(0);
		setStageX(0);
		setStageScale(resetParams.current.scale);
	};

	// Update wheel handler to use new zoom function
	const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const stage = e.target.getStage();
		if (!stage) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		handleZoom(e.evt.deltaY > 0 ? 'out' : 'in', pointer);
	};

	const handleToggleDrawings = () => {
		setActiveAction('toggleDrawings');
		setTimeout(() => setActiveAction(null), 150);
		setRectanglesVisible((visible) => !visible);
		setLinesVisible((visible) => !visible);
	};

	// Update hotkeys to use new zoom function
	useHotkeys('q', () => {
		const stage = imgRef.current?.getStage();
		if (!stage) return;
		const pointer = stage.getPointerPosition();
		console.log('🚀 ~ useHotkeys ~ pointer:', pointer);
		handleZoom('out', pointer || undefined);
	});

	useHotkeys('e', () => {
		const stage = imgRef.current?.getStage();
		if (!stage) return;
		const pointer = stage.getPointerPosition();
		handleZoom('in', pointer || undefined);
	});

	useHotkeys('r', handleReset);

	if (image && status === 'loaded' && rectanglesProps === null) {
		const width = image.width - 420;
		const height = image.height - 420;
		console.log('rescale', window.innerHeight / height);
		resetParams.current = { x: 0, y: 0, scale: window.innerWidth / width };
		setStageScale(window.innerWidth / width);
		console.log(resetParams);
		setRectanglesProps(
			Array.from({ length: 20 }, () => ({
				x: Math.random() * width,
				y: Math.random() * height,
				width: Math.random() * 400 + 20,
				height: Math.random() * 400 + 20,
				hitStrokeWidth: 30,
				fill: 'purple',
				opacity: 0.5,
			})),
		);
	}
	if (image && status === 'loaded' && linesProps === null) {
		const width = image.width - 420;
		const height = image.height - 420;
		const linesProps = Array.from({ length: 25 }, (_, idx) => ({
			points: [Math.random() * width, Math.random() * height, Math.random() * width, Math.random() * height],
			stroke: 'blue',
			strokeWidth: 10,
			hitStrokeWidth: 50,
			opacity: 0.5,
			id: `Line-${idx}`,
		}));
		setLinesProps(linesProps);
	}
	const stageRef = useRef<Konva.Stage>(null);

	const lineSeg = useLineSegment();
	const [isDrawingLine, setIsDrawingLine] = useState<boolean>(false);
	const [selectedShape, setSelectedShape] = useState<any>(null);
	const appRef = useRef<HTMLDivElement>(null);
	const [clickPoint, setClickPoint] = useState<{ x: number; y: number } | null>(null);
	console.log('🚀 ~ App ~ clickPoint:', clickPoint);
	const clickPointRef = useRef<Konva.Circle | null>(null);

	useEffect(() => {
		const abs = clickPointRef.current!.getClientRect();
		const { x, y } = abs;
		appRef.current!.style.setProperty('--canvas-x-offset', `${x * 1}px`);
		appRef.current!.style.setProperty('--canvas-y-offset', `${y * 1}px`);
	}, [clickPoint, clickPointRef, appRef, stageX, stageY]);

	return (
		<>
			<div className="the-app" ref={appRef}>
				<h1>Konva Prototype</h1>
				<p>
					Stage scale: {stageScale}
					Drawing Line: {String(isDrawingLine)} <pre>{JSON.stringify(lineSeg.lineSegment)}</pre>
				</p>
				<div style={{ marginBottom: '1rem' }}>
					<button
						style={{
							backgroundColor: activeDirection === 'up' ? '#4CAF50' : undefined,
							transform: activeDirection === 'up' ? 'scale(0.95)' : undefined,
							transition: 'all 0.15s ease',
						}}
						onClick={() => handlePan('up')}
					>
						⬆️ Pan Up (W)
					</button>
					<button
						style={{
							backgroundColor: activeDirection === 'down' ? '#4CAF50' : undefined,
							transform: activeDirection === 'down' ? 'scale(0.95)' : undefined,
							transition: 'all 0.15s ease',
						}}
						onClick={() => handlePan('down')}
					>
						⬇️ Pan Down (S)
					</button>
					<button
						style={{
							backgroundColor: activeDirection === 'left' ? '#4CAF50' : undefined,
							transform: activeDirection === 'left' ? 'scale(0.95)' : undefined,
							transition: 'all 0.15s ease',
						}}
						onClick={() => handlePan('left')}
					>
						⬅️ Pan Left (A)
					</button>
					<button
						style={{
							backgroundColor: activeDirection === 'right' ? '#4CAF50' : undefined,
							transform: activeDirection === 'right' ? 'scale(0.95)' : undefined,
							transition: 'all 0.15s ease',
						}}
						onClick={() => handlePan('right')}
					>
						➡️ Pan Right (D)
					</button>
					<button
						style={{
							backgroundColor: activeAction === 'zoomIn' ? '#4CAF50' : undefined,
							transform: activeAction === 'zoomIn' ? 'scale(0.95)' : undefined,
							transition: 'all 0.15s ease',
						}}
						onClick={() => handleZoom('in')}
					>
						🔍 Zoom In (E)
					</button>
					<button
						style={{
							backgroundColor: activeAction === 'zoomOut' ? '#4CAF50' : undefined,
							transform: activeAction === 'zoomOut' ? 'scale(0.95)' : undefined,
							transition: 'all 0.15s ease',
						}}
						onClick={() => handleZoom('out')}
					>
						🔍 Zoom Out (Q)
					</button>
					<button
						style={{
							backgroundColor: activeAction === 'reset' ? '#4CAF50' : undefined,
							transform: activeAction === 'reset' ? 'scale(0.95)' : undefined,
							transition: 'all 0.15s ease',
						}}
						onClick={handleReset}
					>
						🔄 Reset (R)
					</button>
					<button
						style={{
							backgroundColor: activeAction === 'toggleDrawings' ? '#4CAF50' : undefined,
							transform: activeAction === 'toggleDrawings' ? 'scale(0.95)' : undefined,
							transition: 'all 0.15s ease',
						}}
						onClick={() => {
							handleToggleDrawings();
						}}
					>
						{linesVisible && rectanglesVisible ? 'Hide' : 'Show'} All (M)
					</button>
				</div>
				<div className="hero-image">
					{(() => {
						if (!selectedShape) return null;
						const box = selectedShape.getClientRect();
						console.log('🚀 ~ App ~ box:', box);

						return (
							<div
								style={{
									position: 'relative',
									backgroundColor: 'white',
									padding: '1rem',
									border: '1px solid black',
									borderRadius: '5px',
									width: 'fit-content',
									zIndex: 100,
								}}
								className="tooltip"
							>
								Selected Shape: {selectedShape.attrs.id}
							</div>
						);
					})()}
					<Stage
						width={window.innerWidth}
						height={window.innerHeight * 0.5}
						draggable
						scaleX={stageScale}
						scaleY={stageScale}
						ref={stageRef}
						x={stageX}
						y={stageY}
						onDragMove={(e) => {
							const stage = e.target.getStage();
							if (!stage) return;
							// const abs = clickPointRef.current!.getClientRect();
							// console.log(abs);
							// const { x, y } = abs;
							// appRef.current!.style.setProperty('--canvas-x-offset', `${x * 1}px`);
							// appRef.current!.style.setProperty('--canvas-y-offset', `${y * 1}px`);
							setStageX(stage.x());
							setStageY(stage.y());
						}}
						onMouseMove={(e) => {
							const stage = e.target.getStage();
							if (!stage) return;
							const mousePos = stage.getPointerPosition() ?? { x: 0, y: 0 };
							const { x, y } = stage.getAbsolutePosition();
							// As I move the mouse around, I update these props, which result in the line being redrawn
							// If I want to send these coordinates to the server, I need to remember to scale them back to the original image's coords
							lineSeg.updatePendingPoint({
								x: (mousePos.x - x) / stageScale,
								y: (mousePos.y - y) / stageScale,
							});
						}}
						onClick={(e) => {
							const stage = e.target.getStage();
							if (!stage) return;
							const mousePos = stage.getPointerPosition() ?? { x: 0, y: 0 };
							const { x, y } = stage.getAbsolutePosition();
							if (isDrawingLine) {
								lineSeg.handleClick(
									{
										x: (mousePos.x - x) / stageScale,
										y: (mousePos.y - y) / stageScale,
									},
									(points) => {
										setLinesProps([
											...(linesProps ?? []),
											{
												points: points,
												stroke: 'black',
												strokeWidth: 10,
											},
										]);
										// setIsDrawingLine(false);
									},
								);
							}
						}}
						onWheel={handleWheel}
					>
						<Layer>
							<Image image={image} ref={imgRef} />
							<Circle
								x={clickPoint?.x ?? 0}
								y={clickPoint?.y ?? 0}
								radius={50}
								fill="red"
								ref={clickPointRef}
							/>
						</Layer>
						<Layer visible={rectanglesVisible}>
							{(rectanglesProps ?? []).map((props, i) => (
								<Rect key={i} {...props} />
							))}
						</Layer>
						<Layer
							onMouseOver={(e) => {
								if (e.target) {
									e.target.setStroke('red');
									e.target.setStrokeWidth(20);
									// const newLineProps = linesProps!.map((line) => {
									// 	if (line.id === e.target?.id()) {
									// 		return { ...line, stroke: 'red', strokeWidth: 10 };
									// 	}
									// 	return line;
									// });
									// setLinesProps(newLineProps);

									// setHoveredLine(e.target.index);
								}
							}}
							onClick={(e) => {
								const stage = e.target.getStage();
								if (!stage) return;
								const mousePos = stage.getPointerPosition() ?? {
									x: 0,
									y: 0,
								};

								const { x, y } = stage.getAbsolutePosition();
								setClickPoint({
									x: (mousePos.x - x) / stageScale,
									y: (mousePos.y - y) / stageScale,
								});

								setSelectedShape(e.target);
							}}
							onMouseOut={(e) => {
								if (e.target) {
									e.target.setStroke('blue');
									e.target.setStrokeWidth(10);
									// const newLineProps = linesProps!.map((line) => {
									// 	if (line.id === e.target?.id()) {
									// 		return { ...line, stroke: 'red', strokeWidth: 10 };
									// 	}
									// 	return line;
									// });
									// setLinesProps(newLineProps);

									// setHoveredLine(e.target.index);
								}
							}}
							visible={linesVisible}
						>
							{(linesProps ?? []).map((props, i) => (
								<Line key={i} hitStrokeWidth={20} {...props} />
							))}
						</Layer>
						<Layer>
							<LineSegment lineSegment={lineSeg.lineSegment} />
						</Layer>
					</Stage>
				</div>
				<div>
					Clicked Shape: <pre>{JSON.stringify(selectedShape)}</pre>
					<button
						onClick={() => {
							if (!selectedShape) return;

							const stage = selectedShape.getStage();
							if (!stage) return;

							const box = selectedShape.getSelfRect();
							const scale =
								Math.min(window.innerWidth / box.width, (window.innerHeight * 0.5) / box.height) * 0.8; // 0.8 to add some padding

							setStageScale(scale);
							setStageX(window.innerWidth / 2 - (box.x + box.width / 2) * scale);
							setStageY((window.innerHeight * 0.5) / 2 - (box.y + box.height / 2) * scale);
						}}
					>
						Zoom
					</button>
				</div>
			</div>
		</>
	);
}

export default App;
