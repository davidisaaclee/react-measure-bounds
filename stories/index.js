import React from 'react';
import styled, { css } from 'styled-components';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withState } from '@dump247/storybook-state';
import DragCapture from '../src';

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
		<p>
		</p>
	</div>
  ))

