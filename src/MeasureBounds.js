import React from 'react';
import BatchForAnimationFrame from './BatchForAnimationFrame';

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

