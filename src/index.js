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

			isUpdatingContextFrame: false,
		}

		this.beginTrackingFromMouseDown = this.beginTrackingFromMouseDown.bind(this);
	}

	beginUpdatingContextFrameIfNecessary() {
		if (this.state.isUpdatingContextFrame) {
			return;
		}

		this.setState(
			{ isUpdatingContextFrame: true },
			() => this.updateContextFrame());
	}

	stopUpdatingContextFrame() {
		this.setState({ isUpdatingContextFrame: false });
	}

	updateContextFrame() {
		if (!this.state.isUpdatingContextFrame) {
			return;
		}

		if (this.contextElement == null) {
			this.contextFrame = null;
		}

		this.contextFrame = this.contextElement.getBoundingClientRect();

		window.requestAnimationFrame(() => this.updateContextFrame());
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
		this.beginUpdatingContextFrameIfNecessary();

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

		this.props.dragDidMove(
			pointerID,
			{
				clientPosition: position,
				relativePosition: relativePointInside(this.contextFrame, position)
			});

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

		// If there are no more active pointers,
		// stop updating context frame on animation frames.
		if (Object.keys(updatedPointerStates).length === 0) {
			this.stopUpdatingContextFrame();
		}
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
				ref={elm => this.contextElement = elm}
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

