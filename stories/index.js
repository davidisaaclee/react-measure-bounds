import React from 'react';
import styled, { css } from 'styled-components';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withState } from '@dump247/storybook-state';
import DragCapture from '../src';
import MeasureBounds from '../src/MeasureBounds';

storiesOf('DragCapture', module)
  .add('basic', () => (
		<div>
			<DragCapture
				shouldBeginDrag={() => true}
				dragDidBegin={action("began drag")}
				dragDidMove={action("moved drag")}
				dragDidEnd={action("ended drag")}
			>
				<div style={{
					width: 300,
					height: 300,
					backgroundColor: '#eee',
				}} />
		</DragCapture>
	</div>
  ))
  .add('relative position', () => (
		<div>
			<MeasureBounds>
				{(getBounds) => (
					<DragCapture
						shouldBeginDrag={() => true}
						dragDidBegin={() => null}
						dragDidMove={(pointerID, clientPosition) => {
							getBounds()
								.then(({ left, top, width, height }) => {
									console.log({
										x: (clientPosition.x - left) / width,
										y: (clientPosition.y - top) / height
									});
								});
						}}
						dragDidEnd={() => null}
					>
						<div style={{
							width: 300,
							height: 300,
							backgroundColor: '#eee',
						}} />
				</DragCapture>
				)}
			</MeasureBounds>
	</div>
  ))


