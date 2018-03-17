import React from 'react';
import Queue from '@davidisaaclee/react-queue';

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

		this.isPolling = false;
		this.onAnimationFrame =
			this.onAnimationFrame.bind(this);
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

		if (this.dequeue != null) {
			this.dequeue();
		}

		window.requestAnimationFrame(this.onAnimationFrame);
	}

	componentDidMount() {
		this.start();
	}

	componentWillUnmount() {
		this.stop();
	}

	render() {
		return (
			<Queue>
				{(request, dequeue) => {
					this.dequeue = dequeue;
					return this.props.children(request);
				}}
			</Queue>
		);
	}
}

export default BatchForAnimationFrame;

