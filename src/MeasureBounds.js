import React from 'react';

/*
 * <BatchForAnimationFrame>
 *   {request => (
 *     <div
 *       onMouseDown={evt => {
 *         request(evt => evt.target.getBoundingClientRect())
 *           .then(bounds => console.log(bounds))
 *       })}
 *     />
 *   )}
 * </BatchForAnimationFrame>
 */
class BatchForAnimationFrame extends React.Component {
	constructor(props) {
		super(props);

		this.requestQueue = [];
		this.isPolling = false;

		this.request =
			this.request.bind(this);
	}

	start() {
		this.isPolling = true;
		this.onAnimationFrame();
	}

	stop() {
		this.isPolling = false;
	}

	onAnimationFrame() {
		if (!this.isPolling) {
			return;
		}

		if (this.requestQueue.length > 0) {
			this.requestQueue
				.forEach(({ perform, resolve }) => resolve(perform()));
			this.requestQueue = [];
		}

		window.requestAnimationFrame(() => this.onAnimationFrame());
	}

	// request :: (() -> T) -> Promise<T>
	request(action) {
		return new Promise(resolve => {
			this.requestQueue.push({ perform: action, resolve });
		});
	}

	componentDidMount() {
		this.start();
	}

	componentWillUnmount() {
		this.stop();
	}

	render() {
		// children :: ((() -> T) -> Promise<T>) -> React.Component
		return this.props.children(this.request);
	}
}

/*
 * <MeasureBounds>
 *   {(getBounds) => (
 *     <div
 *       onMouseMove={evt => getBounds().then(bounds => console.log(
 *			   pointRelativeTo(
 *			     bounds,
 *			     pointFrom(evt)))))}
 *     >
 *       {renderMyContent()}
 *     </div>
 *   )}
 * </MeasureBounds>
 */
export default class MeasureBounds extends React.Component {
	constructor(props) {
		super(props);

		this.getBoundsOfMeasuredElement =
			this.getBoundsOfMeasuredElement.bind(this);
	}

	// getBoundsOfMeasuredElement :: () -> ?DOMRect
	getBoundsOfMeasuredElement() {
		if (this.measuredElement == null) {
			return null;
		}

		if (this.measuredElement.getBoundingClientRect == null) {
			return null;
		}

		return this.measuredElement.getBoundingClientRect();
	}

	render() {
		return (
			<BatchForAnimationFrame>
				{request => (
					<div
						ref={elm => this.measuredElement = elm}
						style={{display: 'inline-block'}}
					>
						{this.props.children(
							() => request(() => this.getBoundsOfMeasuredElement()))}
					</div>
				)}
			</BatchForAnimationFrame>
		);

		return this.props.children(
			this.setMeasuredElement,
			this.getBoundsOfMeasuredElement);
	}
}

