import { useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import './App.css';
import Konva from 'konva';

const ColoredRect = () => {
	const [color, setColor] = useState('green');

	const handleClick = () => {
		setColor(Konva.Util.getRandomColor());
	};

	return <Rect x={20} y={20} width={50} height={50} fill={color} shadowBlur={5} onClick={handleClick} />;
};

// render(<App />, document.getElementById('root'));
function App() {
	return (
		<>
			<div>
				<h1>Konva Prototype</h1>
				<Stage width={window.innerWidth} height={window.innerHeight}>
					<Layer>
						<Text text="Try click on rect" />
						<ColoredRect />
					</Layer>
				</Stage>
			</div>
		</>
	);
}

export default App;
