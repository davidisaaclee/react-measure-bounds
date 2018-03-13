# react-drag-capture
A convenience React component for succinctly managing positions of multiple mouse
and touch pointers.

A pointer is tracked once a `touchstart` or `mousedown` event occurs within the
`DragCapture` element, and continues to be tracked until the corresponding `mouseup`
or `touchend` event occurs. **Notably, the pointer continues to be tracked if it
is dragged outside of the `DragCapture` element.**

```javascript
<DragCapture
	dragDidBegin={(pointerID, position) => console.log(`${pointerID}: Began drag at ${position}`)}
	dragDidMove={(pointerID, position) => console.log(`${pointerID}: Moved drag at ${position}`)}
	dragDidEnd={(pointerID, position) => console.log(`${pointerID}: Ended drag at ${position}`)}
/>
```

## Features
- Unified API for touch and mouse events
- Multitouch support
- Optional `RelativeDragCapture` component for providing a pointer position
relative to the `RelativeDragCapture`'s bounds
- Automatically disables default touch actions for tracked touches

## Installation
```bash
yarn add @davidisaaclee/react-drag-capture
```

### Development
```bash
# Clone repository.
git clone https://github.com/davidisaaclee/react-drag-capture
cd react-drag-capture

# Build for ES modules, CommonJS, and UMD.
yarn build

# Run Storybook on port 9001.
yarn run storybook
```

## Relation to the Pointer API
A lot of this component's functionality is more powerfully implemented in the
[Pointer API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events),
specifically when combined with
[`setPointerCapture()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture).

Unfortunately, as of March 2018, Safari does not fully support this API. There are
a handful of polyfills - most visibly, [PEP](https://github.com/jquery/PEP) from jQuery.
These might be the way to go; but I personally found that using a polyfill made
debugging performance a little confusing. (I'm probably wrong about this!)

**It's important to note that the `pointerId` of a pointer event and the pointer ID
provided by the `DragCapture` props are not guaranteed to be the same.**

