import React from 'react';
import PropTypes from 'prop-types';

import MeasureBounds from './MeasureBounds';

const mousePointerID = 'mouse';

const pointerState = (clientPosition, windowEventListeners) => ({
	clientPosition,
	windowEventListeners
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
			//   windowEventListeners :: [EventHandler]
			// }
			// where EventHandler ::= {
			//   eventName :: string,
			//   listener :: function
			// }
			pointerStates: {},
		}

		this.beginTrackingFromMouseDown = this.beginTrackingFromMouseDown.bind(this);
	}

	beginTrackingFromMouseDown(evt) {
		this.beginTracking(
			mousePointerID,
			pointerState(
				clientPositionFromMouseEvent(evt),
				[
					{
						eventName: 'mousemove',
						listener: evt => this.updateTrackingPosition(
							mousePointerID,
							clientPositionFromMouseEvent(evt))
					},
					{
						eventName: 'mouseup',
						listener: evt => this.stopTracking(
							mousePointerID,
							clientPositionFromMouseEvent(evt))
					},
				]));
	}

	// Assumes that event handlers listed in `pointerState`
	// are not yet registered.
	beginTracking(pointerID, pointerState) {
		pointerState.windowEventListeners
			.forEach(({ eventName, listener }) => {
				window.addEventListener(
					eventName,
					listener)
			});

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

		pointerState.windowEventListeners
			.forEach(({ eventName, listener }) => {
				window.removeEventListener(eventName, listener);
			});

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

