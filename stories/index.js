import React from 'react';
import styled, { css } from 'styled-components';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withState } from '@dump247/storybook-state';
import DragCapture, { RelativeDragCapture } from '../src';
import MeasureBounds from '../src/MeasureBounds';

const Cursor = styled.span`
	width: 10px;
	height: 10px;

	background-color: black;

	position: absolute;
	${({position}) => css`
		left: ${position.x * 100}%;
		top: ${position.y * 100}%;
		transform: translate(-50%, -50%);
	`}
`;

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
  .add('relative position', withState({}, (store) => (
		<RelativeDragCapture
			dragDidBegin={(cursorID, position) => store.set({ [cursorID]: position })}
			dragDidMove={(cursorID, position) => store.set({ [cursorID]: position })}
			dragDidEnd={(cursorID, position) => store.set({ [cursorID]: undefined })}
		>
			<div style={{
				position: 'relative',
				width: 300,
				height: 300,
				backgroundColor: '#eee',
			}}>
			{
				Object.keys(store.state)
				.map(cursorID => ({ cursorID, position: store.state[cursorID] }))
				.filter(({ position }) => position != null)
				.map(({ cursorID, position }) => (
					<Cursor key={cursorID} position={position} />
				))
			}
		</div>
		</RelativeDragCapture>
  )))


