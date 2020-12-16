# @newstudios/hook

  [![NPM Version][npm-image]][npm-url]

## Installation

```bash
npm install @newstudios/hook
```
or
```bash
yarn add @newstudios/hook
```

## Starter
### hooks

* `useArrowKey` listen to arrow key state change and get the latest state
* `useInvalidator` use invalidator to invalidate the target at the next animation frame
* `useCanvasInvalidator` a special invalidator to draw canvas at the next aniation frame
* `useClickAway` listen click event outside the target
* `useDevicePixelRatio` listen to the device pixel ratio change and get the latest devicePixelRatio
* `useDrag` a simple hook to process the dragging state and callback
* `useEvent` a hook to bind listener(s) to event target
* `useHover` a hook to get the mouse hover state of the target
* `useList` a hook to manage collections
* `useUpdate` get a static callback to force update the component
* `useNextUpdate` get a static callback to update the componenent next event loop
* `useRaf` a hook to call requestAnimationFrame whose lifecycle is self managed
* `useRefObject` a hook to reference any object from the argument
* `useResize` a hook to listen to the resize event of the target
* `useResizeObserver` a hook to get the default or customed provided ResizeObserver instance
* `useSafeClick` manage the click event from the target and assure the gesture not to be dragging
* `useSetupCanvas` a hook for setup the canvas and set the canvas width and height automatically
* `useShortcutKey` listen to the shortcut key
* `useShortcutKeys` listen to the multiple shortcut keys
* `useThrottle` invoke a callback with throttle
* `useThrottleCallback` get a callback which will be invoked with throttle

## LICENSE

MIT

[npm-image]: https://img.shields.io/npm/v/@newstudios/hook.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@newstudios/hook
