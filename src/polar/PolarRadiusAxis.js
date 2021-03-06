/**
 * @fileOverview The axis of polar coordinate system
 */
import React, { Component, PropTypes } from 'react';
import pureRender from '../util/PureRender';
import Layer from '../container/Layer';
import { PRESENTATION_ATTRIBUTES, getPresentationAttributes } from '../util/ReactUtils';
import { polarToCartesian } from '../util/PolarUtils';
import _ from 'lodash';

@pureRender
class PolarRadiusAxis extends Component {

  static displayName = 'PolarRadiusAxis';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,
    cx: PropTypes.number,
    cy: PropTypes.number,
    hide: PropTypes.bool,

    angle: PropTypes.number,
    tickCount: PropTypes.number,
    ticks: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.any,
      radius: PropTypes.value,
    })),
    orientation: PropTypes.oneOf(['left', 'right', 'middle']),
    axisLine: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    label: PropTypes.oneOfType([
      PropTypes.number, PropTypes.string, PropTypes.element, PropTypes.func,
    ]),
    tick: PropTypes.oneOfType([
      PropTypes.bool, PropTypes.object, PropTypes.element, PropTypes.func,
    ]),
    stroke: PropTypes.string,
    tickFormatter: PropTypes.func,
    domain: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.oneOf(['auto', 'dataMin', 'dataMax']),
    ])),
  };

  static defaultProps = {
    cx: 0,
    cy: 0,
    angle: 0,
    orientation: 'right',
    stroke: '#ccc',
    axisLine: true,
    tick: true,
    tickCount: 5,
    domain: [0, 'auto'],
  };

  /**
   * Calculate the coordinate of tick
   * @param  {Object} radius The data of a simple tick
   * @return {Object} (x, y)
   */
  getTickValueCoord({ radius }) {
    const { angle, cx, cy } = this.props;

    return polarToCartesian(cx, cy, radius, angle);
  }

  getTickTextAnchor() {
    const { orientation } = this.props;
    let textAnchor;

    switch (orientation) {
      case 'left':
        textAnchor = 'end';
        break;
      case 'right':
        textAnchor = 'start';
        break;
      default:
        textAnchor = 'middle';
        break;
    }

    return textAnchor;
  }

  renderAxisLine() {
    const { cx, cy, angle, ticks, axisLine } = this.props;
    const extent = ticks.reduce((result, entry) => [
      Math.min(result[0], entry.radius),
      Math.max(result[1], entry.radius),
    ], [Infinity, -Infinity]);
    const point0 = polarToCartesian(cx, cy, extent[0], angle);
    const point1 = polarToCartesian(cx, cy, extent[1], angle);

    const props = {
      ...getPresentationAttributes(this.props),
      fill: 'none',
      ...getPresentationAttributes(axisLine),
      x1: point0.x,
      y1: point0.y,
      x2: point1.x,
      y2: point1.y,
    };

    return <line className="recharts-polar-radius-axis-line" {...props} />;
  }

  renderTickItem(option, props, value) {
    let tickItem;

    if (React.isValidElement(option)) {
      tickItem = React.cloneElement(option, props);
    } else if (_.isFunction(option)) {
      tickItem = option(props);
    } else {
      tickItem = (
        <text {...props} className="recharts-polar-radius-axis-tick-value">
          {value}
        </text>
      );
    }

    return tickItem;
  }

  renderTicks() {
    const { ticks, tick, angle, tickFormatter, stroke } = this.props;
    const textAnchor = this.getTickTextAnchor();
    const axisProps = getPresentationAttributes(this.props);
    const customTickProps = getPresentationAttributes(tick);

    const items = ticks.map((entry, i) => {
      const coord = this.getTickValueCoord(entry);
      const tickProps = {
        textAnchor,
        transform: `rotate(${90 - angle}, ${coord.x}, ${coord.y})`,
        ...axisProps,
        stroke: 'none', fill: stroke,
        ...customTickProps,
        index: i,
        ...coord,
        payload: entry,
      };

      return (
        <g className="recharts-polar-radius-axis-tick" key={`tick-${i}`}>
          {this.renderTickItem(
            tick, tickProps, tickFormatter ? tickFormatter(entry.value) : entry.value
          )}
        </g>
      );
    });

    return <g className="recharts-polar-radius-axis-ticks">{items}</g>;
  }

  renderLabel() {
    const { label } = this.props;
    const { ticks, angle, stroke } = this.props;
    const maxRadiusTick = _.maxBy(ticks, entry => (entry.radius || 0));
    const radius = maxRadiusTick.radius || 0;
    const coord = this.getTickValueCoord({ radius: radius + 10 });
    const props = {
      ...this.props,
      stroke: 'none',
      fill: stroke,
      ...coord,
      textAnchor: 'middle',
      transform: `rotate(${90 - angle}, ${coord.x}, ${coord.y})`,
    };

    if (React.isValidElement(label)) {
      return React.cloneElement(label, props);
    } else if (_.isFunction(label)) {
      return label(props);
    } else if (_.isString(label) || _.isNumber(label)) {
      return (
        <g className="recharts-polar-radius-axis-label">
          <text {...props}>{label}</text>
        </g>
      );
    }

    return null;
  }

  render() {
    const { ticks, axisLine, tick } = this.props;

    if (!ticks || !ticks.length) { return null; }

    return (
      <g className="recharts-polar-radius-axis">
        {axisLine && this.renderAxisLine()}
        {tick && this.renderTicks()}
        {this.renderLabel()}
      </g>
    );
  }
}

export default PolarRadiusAxis;
