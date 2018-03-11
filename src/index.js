import React from 'react';
import PropTypes from 'prop-types';

import MeasureBounds from './MeasureBounds';

const mousePointerID = 'mouse';

const pointerIDFromTouch = touch => touch.identifier;

const makePointerState = (clientPosition) => ({
	clientPosition,
});

const clientPositionFromMouseEvent = evt => ({
	x: evt.clientX,
	y: evt.clientY,
});

const clientPositionFromTouch = touch => ({
	x: touch.clientX,
	y: touch.clientY,
});

const relativePointInside = (rect, point) => ({
	x: (point.x - rect.left) / rect.width,
	y: (point.y - rect.top) / rect.height
});

function omit(obj, key) {
	const copy = Object.assign({}, obj);
	delete copy[key];
	return copy;
}

function isValidHandler(handler) {
	if (handler == null) {
		return false;
	} else if (!(handler instanceof Function)) {
		return false;
	} else {
		return true;
	}
}

class DragCapture extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			// pointerStates :: { [PointerID]: PointerState }
			// where PointerState ::= {
			//   clientPosition :: Point,
			// }
			pointerStates: {}
		};

		this.beginTrackingFromMouseDown =
			this.beginTrackingFromMouseDown.bind(this);
		this.updateTrackingFromMouseMove =
			this.updateTrackingFromMouseMove.bind(this);
		this.stopTrackingFromMouseUp =
			this.stopTrackingFromMouseUp.bind(this);

		this.beginTrackingFromTouch =
			this.beginTrackingFromTouch.bind(this);
		this.updateTrackingFromTouch =
			this.updateTrackingFromTouch.bind(this);
		this.stopTrackingFromTouch =
			this.stopTrackingFromTouch.bind(this);

		this.isTrackingMouse = false;
		this.numberOfTouchesTracked = 0;
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

		window.addEventListener(
			'mousemove',
			this.updateTrackingFromMouseMove);
		window.addEventListener(
			'mouseup', 
			this.stopTrackingFromMouseUp);
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

	beginTrackingFromTouch(evt) {
		const wasAlreadyTrackingTouches = this.numberOfTouchesTracked > 0;

		for (let i = 0; i < evt.changedTouches.length; i++) {
			const touch = evt.changedTouches.item(i);
			this.numberOfTouchesTracked++;
			this.beginTracking(
				pointerIDFromTouch(touch),
				makePointerState(clientPositionFromTouch(touch)));
		}

		if (!wasAlreadyTrackingTouches && this.numberOfTouchesTracked > 0) {
			this.addTouchEventListeners();
		}

		evt.preventDefault();
	}

	updateTrackingFromTouch(evt) {
		for (let i = 0; i < evt.changedTouches.length; i++) {
			const touch = evt.changedTouches.item(i);
			this.updateTrackingPosition(
				pointerIDFromTouch(touch),
				clientPositionFromTouch(touch));
		}

		evt.preventDefault();
	}

	stopTrackingFromTouch(evt) {
		for (let i = 0; i < evt.changedTouches.length; i++) {
			const touch = evt.changedTouches.item(i);
			this.numberOfTouchesTracked--;
			this.stopTracking(
				pointerIDFromTouch(touch),
				clientPositionFromTouch(touch));
		}

		this.removeTouchEventListenersIfNecessary();

		evt.preventDefault();
	}

	addTouchEventListeners() {
		window.addEventListener('touchmove', this.updateTrackingFromTouch);
		window.addEventListener('touchend', this.stopTrackingFromTouch);
	}

	removeTouchEventListenersIfNecessary() {
		if (this.numberOfTouchesTracked > 0) {
			return;
		}

		window.removeEventListener('touchmove', this.updateTrackingFromTouch);
		window.removeEventListener('touchend', this.stopTrackingFromTouch);
	}

	// Assumes that event handlers listed in `pointerState`
	// are not yet registered.
	beginTracking(pointerID, pointerState) {
		if (isValidHandler(this.props.dragDidBegin)) {
			this.props.dragDidBegin(pointerID, clientPosition);
		}

		this.setState(prevState => ({
			pointerStates: {
				...prevState.pointerStates,
				[pointerID]: pointerState
			}
		}));
	}

	updateTrackingPosition(pointerID, clientPosition) {
		const pointerState =
			this.state.pointerStates[pointerID];

		if (pointerState == null) {
			return;
		}

		if (isValidHandler(this.props.dragDidMove)) {
			this.props.dragDidMove(pointerID, clientPosition);
		}

		this.setState(prevState => ({
			...prevState,
			pointerStates: {
				...prevState.pointerStates,
				[pointerID]: {
					...prevState.pointerStates[pointerID],
					clientPosition
				}
			},
		}));
	}

	stopTracking(pointerID, clientPosition) {
		const pointerState =
			this.state.pointerStates[pointerID];

		if (pointerState == null) {
			return;
		}

		if (isValidHandler(this.props.dragDidEnd)) {
			this.props.dragDidEnd(pointerID, clientPosition);
		}

		this.setState(prevState => ({
			...prevState,
			pointerStates: omit(prevState.pointerStates, pointerID)
		}));
	}

	componentWillUnmount() {
		this.removeTouchEventListenersIfNecessary();
		this.removeMouseEventListenersIfNecessary();
	}

	render() {
		const {
			className, style, children
		} = this.props;

		return (
			<div
				className={className}
				style={style}
				onMouseDown={this.beginTrackingFromMouseDown}
				onTouchStart={this.beginTrackingFromTouch}
			>
				{children}
			</div>
		)
	}
};

DragCapture.propTypes = {
	dragDidBegin: PropTypes.func,
	dragDidMove: PropTypes.func,
	dragDidEnd: PropTypes.func,
};

class RelativeDragCapture extends React.Component {
	render() {
		const {
			dragDidBegin, dragDidMove, dragDidEnd,
			...restProps
		} = this.props;

		return (
			<MeasureBounds>
				{(getBounds) => (
					<DragCapture
						dragDidBegin={(cursorID, position) => getBounds()
								.then(bounds => isValidHandler(dragDidBegin) && dragDidBegin(
									cursorID,
									relativePointInside(bounds, position)))}
						dragDidMove={(cursorID, position) => getBounds()
								.then(bounds => isValidHandler(dragDidMove) && dragDidMove(
									cursorID,
									relativePointInside(bounds, position)))}
						dragDidEnd={(cursorID, position) => getBounds()
								.then(bounds => isValidHandler(dragDidEnd) && dragDidEnd(
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

