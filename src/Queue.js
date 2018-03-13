import React from 'react';
import PropTypes from 'prop-types';

// defaultDequeueStrategy :: [Queue.Job] -> [Queue.Job]
// where Queue.Job.payload ::= () -> any
function defaultDequeueStrategy(queue) {
	queue.forEach(({ payload, resolve }) => resolve(payload()));
	return [];
}

/*
 * // Call `dequeue` when you want to dequeue jobs.
 * <Queue
 *   dequeueRef={dequeue => this.dequeue = dequeue}
 * >
 *   {request => (
 *     <div
 *       onMouseDown={evt => {
 *         request(evt => evt.target.getBoundingClientRect())
 *           .then(bounds => console.log(bounds))
 *       })}
 *     />
 *   )}
 * </Queue>
 */
class Queue extends React.Component {
	// Job ::= { payload: any, resolve: () -> () }

	constructor(props) {
		super(props);

		this.queue = [];

		this.request =
			this.request.bind(this);
		this.dequeue =
			this.dequeue.bind(this);
	}

	// request :: Job -> Promise<*>
	request(job) {
		return new Promise(resolve => {
			this.queue.push({ payload: job, resolve });
		});
	}

	// dequeue :: ([Job] -> [Job]) -> ()
	dequeue(dequeueStrategy = defaultDequeueStrategy) {
		if (this.queue.length === 0) {
			return;
		}

		dequeueStrategy(this.queue);
		this.queue = [];
	}

	componentDidMount() {
		this.props.dequeueRef(this.dequeue);
	}

	render() {
		return this.props.children(this.request);
	}
}

Queue.propTypes = {
	dequeueRef: PropTypes.func.isRequired,
};

export default Queue;

