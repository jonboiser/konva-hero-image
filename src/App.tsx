import { forwardRef, useRef, useState } from 'react';
import { Stage, Image, Layer, Rect, Text, Line } from 'react-konva';
import './App.css';
import Konva from 'konva';
import useImage from 'use-image';

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
		setRectanglesProps(
			Array.from({ length: 20 }, () => ({
				x: Math.random() * width,
				y: Math.random() * height,
				width: Math.random() * 400 + 20,
				height: Math.random() * 400 + 20,
				fill: Konva.Util.getRandomColor(),
				opacity: 0.5,
			})),
		);
	}
	if (image && status === 'loaded' && linesProps === null) {
		const width = image.width - 420;
		const height = image.height - 420;
		const linesProps = Array.from({ length: 25 }, () => ({
			points: [Math.random() * width, Math.random() * height, Math.random() * width, Math.random() * height],
			stroke: Konva.Util.getRandomColor(),
			strokeWidth: Math.random() * 5 + 1,
			opacity: 0.5,
		}));
		setLinesProps(linesProps);
	}
	return (
		<>
			<div>
				<h1>Konva Prototype</h1>
				<div style={{ marginBottom: '1rem' }}>
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
				<Stage
					width={window.innerWidth}
					height={window.innerHeight}
					draggable
					scaleX={stageScale}
					scaleY={stageScale}
					x={stageX}
					y={stageY}
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
					<Layer visible={linesVisible}>
						{(linesProps ?? []).map((props, i) => (
							<Line key={i} {...props} />
						))}
					</Layer>
				</Stage>
			</div>
		</>
	);
}

export default App;
