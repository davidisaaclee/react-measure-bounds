import React from 'react';
import PropTypes from 'prop-types';

const mousePointerID = 'mouse';

const pointerState = (clientPosition, windowEventListeners) => ({
	clientPosition,
	windowEventListeners
});

const clientPositionFromMouseEvent = evt => ({
	x: evt.clientX,
	y: evt.clientY,
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
			pointerStates: {}
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

		this.props.dragDidBegin(pointerID, pointerState.position);

		this.setState({
			pointerStates: Object.assign(
				{},
				this.state.pointerStates,
				{ [pointerID]: pointerState })
		});
	}

	updateTrackingPosition(pointerID, position) {
		const pointerState =
			this.state.pointerStates[pointerID];

		if (pointerState == null) {
			return;
		}

		this.props.dragDidMove(pointerID, position);

		const updatedPointerState =
			Object.assign(
				{},
				pointerState,
				{ position });

		this.setState({
			pointerStates: Object.assign(
				{},
				this.state.pointerStates,
				{ [pointerID]: updatedPointerState })
		});
	}

	stopTracking(pointerID, position) {
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

		this.props.dragDidEnd(pointerID, position);

		this.setState({
			pointerStates: updatedPointerStates
		});
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

export default DragCapture;

