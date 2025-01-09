import { forwardRef, useRef, useState } from 'react';
import { Stage, Image, Layer, Rect, Text } from 'react-konva';
import './App.css';
import Konva from 'konva';
import useImage from 'use-image';

const ColoredRect = () => {
	const [color, setColor] = useState('green');

	const handleClick = () => {
		setColor(Konva.Util.getRandomColor());
	};

	return <Rect x={20} y={20} width={50} height={50} fill={color} shadowBlur={5} onClick={handleClick} />;
};

const UnitImage = forwardRef<Konva.Image>((props, ref) => {
	const [image] = useImage(
		'https://imgin-stage.instrumental.ai/files%2Furn%3Adfx%3Aproject%3A5%2Furn%3Adfx%3Afile%3A3768732%2FPVT-DOE-JDR61762142SLA17X-SOLAR-170220111658.jpg?q=60&s=TzAvOclWasdwiqqQ33cq%2F7SmbPBkhBfANnhu%2FmeMHuE%3D&instck=2bef41cffe1bd5c92ff573019ec5aecb',
	);
	return <Image ref={ref} image={image} />;
});

// render(<App />, document.getElementById('root'));
function App() {
	const [stageScale, setStageScale] = useState(1);
	const [stageX, setStageX] = useState(0);
	const [stageY, setStageY] = useState(0);
	const imgRef = useRef<Konva.Image>(null);
	const [rectanglesProps, setRectanglesProps] = useState<Konva.RectConfig[]>([]);

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

	if (rectanglesProps.length === 0 && imgRef.current) {
		const width = imgRef.current.getWidth() - 420;
		const height = imgRef.current.getHeight() - 420;
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

	return (
		<>
			<div>
				<h1>Konva Prototype</h1>
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
						<UnitImage ref={imgRef} />
					</Layer>
					<Layer>
						{rectanglesProps.map((props, i) => (
							<Rect key={i} {...props} />
						))}
					</Layer>
				</Stage>
			</div>
		</>
	);
}

export default App;
