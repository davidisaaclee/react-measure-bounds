export const clientPositionFromMouseEvent = evt => ({
	x: evt.clientX,
	y: evt.clientY,
});

export const clientPositionFromTouch = touch => ({
	x: touch.clientX,
	y: touch.clientY,
});

export const relativePointInside = (rect, point) => ({
	x: (point.x - rect.left) / rect.width,
	y: (point.y - rect.top) / rect.height
});

export function omit(obj, key) {
	const copy = Object.assign({}, obj);
	delete copy[key];
	return copy;
}

export function isValidHandler(handler) {
	if (handler == null) {
		return false;
	} else if (!(handler instanceof Function)) {
		return false;
	} else {
		return true;
	}
}

