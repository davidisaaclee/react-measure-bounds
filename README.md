# react-measure-bounds
A React component which provides a way to measure its own bounding client rect.

```jsx
<MeasureBounds>
  {(getBoundingClientRect) => (
    <button
      onClick={_ =>
				// getBoundingClientRect :: () -> Promise<DOMRect>
				getBoundingClientRect()
					.then(bounds => console.log(`Bounds: ${bounds}`))}
    />
  )}
</MeasureBounds>
```

- Batches measurements to `requestAnimationFrame` to minimize layout thrashing
- Adds a wrapper DOM component to the hierarchy

## Install

```sh
yarn add @davidisaaclee/react-measure-bounds
```

### Development

```sh
# Clone repository.
git clone https://github.com/davidisaaclee/react-measure-bounds
cd react-measure-bounds

# Build for ES modules and CommonJS.
yarn build

# Run tests.
yarn test
```

## See also
- [fastdom](https://github.com/wilsonpage/fastdom): Batch DOM measurements / mutations to `requestAnimationFrame` calls. This library uses a sub-component `BatchForAnimationFrame`, which behaves similarly to fastdom.
- [ResizeObserver](https://github.com/WICG/ResizeObserver/blob/master/explainer.md)
- [CSS-Element-Queries](http://marcj.github.io/css-element-queries/)

