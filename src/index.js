import React from 'react';
import PropTypes from 'prop-types';

import MeasureBounds from './MeasureBounds';

const mousePointerID = 'mouse';

const makePointerState = (clientPosition) => ({
	clientPosition,
});

const clientPositionFromMouseEvent = evt => ({
	x: evt.clientX,
	y: evt.clientY,
});

const relativePointInside = (rect, point) => ({
	x: (point.x - rect.left) / rect.width,
	y: (point.y - rect.top) / rect.height
});


class DragCapture extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			// pointerStates :: { [PointerID]: PointerState }
			// where PointerState ::= {
			//   clientPosition :: Point,
			// }
			pointerStates: {},
		}

		this.beginTrackingFromMouseDown =
			this.beginTrackingFromMouseDown.bind(this);
		this.updateTrackingFromMouseMove =
			this.updateTrackingFromMouseMove.bind(this);
		this.stopTrackingFromMouseUp =
			this.stopTrackingFromMouseUp.bind(this);

		this.isTrackingMouse = false;
	}

	beginTrackingFromMouseDown(evt) {
		this.addMouseEventListenersIfNecessary();

		this.beginTracking(
			mousePointerID,
			makePointerState(clientPositionFromMouseEvent(evt)));
	}

	updateTrackingFromMouseMove(evt) {
		this.updateTrackingPosition(
			mousePointerID,
			clientPositionFromMouseEvent(evt))
	}

	stopTrackingFromMouseUp(evt) {
		this.removeMouseEventListenersIfNecessary();

		this.stopTracking(
			mousePointerID,
			clientPositionFromMouseEvent(evt))
	}

	addMouseEventListenersIfNecessary() {
		if (this.isTrackingMouse) {
			return;
		}

		window.addEventListener('mousemove', this.updateTrackingFromMouseMove);
		window.addEventListener('mouseup', this.stopTrackingFromMouseUp);
		this.isTrackingMouse = true;
	}

	removeMouseEventListenersIfNecessary() {
		if (!this.isTrackingMouse) {
			return;
		}

		window.removeEventListener('mousemove', this.updateTrackingFromMouseMove);
		window.removeEventListener('mouseup', this.stopTrackingFromMouseUp);
		this.isTrackingMouse = false;
	}

	// Assumes that event handlers listed in `pointerState`
	// are not yet registered.
	beginTracking(pointerID, pointerState) {
		this.props.dragDidBegin(
			pointerID,
			pointerState.clientPosition);

		this.setState({
			pointerStates: Object.assign(
				{},
				this.state.pointerStates,
				{ [pointerID]: pointerState })
		});
	}

	updateTrackingPosition(pointerID, clientPosition) {
		const pointerState =
			this.state.pointerStates[pointerID];

		if (pointerState == null) {
			return;
		}

		this.props.dragDidMove(
			pointerID,
			clientPosition);

		const updatedPointerState =
			Object.assign(
				{},
				pointerState,
				{ clientPosition });

		this.setState({
			pointerStates: Object.assign(
				{},
				this.state.pointerStates,
				{ [pointerID]: updatedPointerState })
		});
	}

	stopTracking(pointerID, clientPosition) {
		const pointerState =
			this.state.pointerStates[pointerID];

		if (pointerState == null) {
			return;
		}


		const updatedPointerStates = this.state.pointerStates;
		delete updatedPointerStates[pointerID];

		this.props.dragDidEnd(pointerID, clientPosition);

		this.setState({
			pointerStates: updatedPointerStates
		});
	}

	componentWillUnmount() {
		// TODO: Unregister all event listeners.
	}

	render() {
		const {
			shouldBeginDrag,
			// dragDidBegin, dragDidMove, dragDidEnd,
			className, style, children
		} = this.props;

		return (
			<div
				className={className}
				style={style}
				onMouseDown={this.beginTrackingFromMouseDown}
			>
				{children}
			</div>
		)
	}
};

class RelativeDragCapture extends React.Component {
	render() {
		const {
			shouldBeginDrag,
			dragDidBegin, dragDidMove, dragDidEnd,
			...restProps
		} = this.props;

		return (
			<MeasureBounds>
				{(getBounds) => (
					<DragCapture
						shouldBeginDrag={() => true}
						dragDidBegin={(cursorID, position) => getBounds()
								.then(bounds => dragDidBegin(
									cursorID,
									relativePointInside(bounds, position)))}
						dragDidMove={(cursorID, position) => getBounds()
								.then(bounds => dragDidMove(
									cursorID,
									relativePointInside(bounds, position)))}
						dragDidEnd={(cursorID, position) => getBounds()
								.then(bounds => dragDidEnd(
									cursorID,
									relativePointInside(bounds, position)))}
						{...restProps}
					/>
				)}
			</MeasureBounds>
		);
	}
}

export { RelativeDragCapture };
export default DragCapture;

