import { forwardRef, useEffect, useRef, useState } from 'react';
import { Stage, Image, Layer, Rect, Text, Line } from 'react-konva';
import './App.css';
import Konva from 'konva';
import useImage from 'use-image';
import { getFlatPoints, useLineSegment, LineSegment } from './line-segment';

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

	const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const scaleBy = 1.1;
		const stage = e.target.getStage();
		if (!stage) return;

		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

		setStageScale(newScale);
		setStageX(pointer.x - mousePointTo.x * newScale);
		setStageY(pointer.y - mousePointTo.y * newScale);
	};

	if (image && status === 'loaded' && rectanglesProps === null) {
		const width = image.width - 420;
		const height = image.height - 420;
		setStageScale(window.innerWidth / width);
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

	const lineSeg = useLineSegment();
	const [isDrawingLine, setIsDrawingLine] = useState<boolean>(false);
	const [selectedShape, setSelectedShape] = useState<any>(null);
	const appRef = useRef<HTMLDivElement>(null);

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
						onClick={() => {
							setIsDrawingLine((idl) => !idl);
						}}
					>
						Draw Line
					</button>
					<button onClick={() => setStageY(stageY + 100)}>⬆️ Pan Up</button>
					<button onClick={() => setStageY(stageY - 100)}>⬇️ Pan Down</button>
					<button onClick={() => setStageX(stageX + 100)}>⬅️ Pan Left</button>
					<button onClick={() => setStageX(stageX - 100)}>➡️ Pan Right</button>
					<button onClick={() => setRectanglesVisible((visible) => !visible)}>
						{rectanglesVisible ? 'Hide' : 'Show'} Rectangles
					</button>
					<button onClick={() => setLinesVisible((visible) => !visible)}>
						{linesVisible ? 'Hide' : 'Show'} Lines
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
						x={stageX}
						y={stageY}
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
						</Layer>
						<Layer visible={rectanglesVisible}>
							{(rectanglesProps ?? []).map((props, i) => (
								<Rect key={i} {...props} />
							))}
						</Layer>
						<Layer
							onMouseOver={(e) => {
								console.log(e.target);
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
								const pos = e.target.getStage()?.getPointerPosition();
								console.log('🚀 ~ App ~ pos:', pos);
								if (appRef.current) {
									appRef.current.style.setProperty('--tooltip-top', `${pos?.y}px`);
									appRef.current.style.setProperty('--tooltip-left', `${pos?.x}px`);
								}
								setSelectedShape(e.target);
							}}
							onMouseOut={(e) => {
								console.log(e);
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
