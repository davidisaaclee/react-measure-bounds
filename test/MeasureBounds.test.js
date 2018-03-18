import React from 'react';
import { shallow } from 'enzyme';
import MeasureBounds from '../src';

test("reports correct size of wrapped div", () => {
	let getBoundsRef;
	const innerElementStyle = { width: 500, height: 300 };
	const wrapper = shallow(
		<MeasureBounds>
			{getBounds => {
				getBoundsRef = getBounds;
				return (
					<div style={innerElementStyle} />
				);
			}}
		</MeasureBounds>
	);

	wrapper.render();
	expect(getBoundsRef())
		.resolves
		.toMatchObject({ left: 0, top: 0, width: 500, height: 300 });

	innerElementStyle.width = 600;
	wrapper.render();
	expect(getBoundsRef())
		.resolves
		.toMatchObject({
			left: 0,
			top: 0,
			width: 600,
			height: 300
		});

	innerElementStyle.transform = 'translate(20px, 30px)';
	wrapper.render();
	expect(getBoundsRef())
		.resolves
		.toMatchObject({
			left: 20,
			top: 30,
			width: 600,
			height: 300
		});
});

