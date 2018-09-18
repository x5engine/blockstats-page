import { Selection } from 'victory-core';
import { throttle, isFunction, mapValues, assign } from 'lodash';

const CursorHelpers = {
  withinBounds(point, bounds) {
    const { x1, x2, y1, y2 } = mapValues(bounds, Number);
    const { x, y } = mapValues(point, Number);
    return x >= Math.min(x1, x2) &&
      x <= Math.max(x1, x2) &&
      y >= Math.min(y1, y2) &&
      y <= Math.max(y1, y2);
  },

  onMouseMove(evt, targetProps) {
    const { onCursorChange, cursorDimension, domain } = targetProps;
    const parentSVG = Selection.getParentSVG(evt);
    const cursorSVGPosition = Selection.getSVGEventCoordinates(evt, parentSVG);

    let cursorValue = Selection.getDataCoordinates(
      targetProps,
      targetProps.scale,
      cursorSVGPosition.x,
      cursorSVGPosition.y
    );
    const inBounds = this.withinBounds(cursorValue, {
      x1: domain.x[0],
      x2: domain.x[1],
      y1: domain.y[0],
      y2: domain.y[1]
    });

    if (!inBounds) {
      cursorValue = null;
    }

    if (isFunction(onCursorChange)) {
      if (inBounds) {
        cursorValue = assign(cursorValue, {clientX: evt.clientX, clientY: evt.clientY}, {svg: cursorSVGPosition})
        const value = cursorDimension ? cursorValue[cursorDimension] : cursorValue;
        onCursorChange(value, targetProps);
      } else if (cursorValue !== targetProps.cursorValue) {
        onCursorChange(targetProps.defaultCursorValue || null, targetProps);
      }
    }

    return [{
      target: "parent",
      eventKey: "parent",
      mutation: () => ({ cursorValue, parentSVG })
    }];
  }
};

export default {
  onMouseMove: throttle(
    CursorHelpers.onMouseMove.bind(CursorHelpers),
    32,
    { leading: true, trailing: false })
};