const cn = require('classnames');
const { h, Component } = require('preact');
const Body = require('../Body');
const styles = require('./styles.css');

class Scene extends Component {
  constructor(props) {
    super(props);

    this.imageRefs = {};
    this.updateViewportDependentProps();

    this.state = {
      shouldAutoPan: true
    };

    this.firstInteraction = this.firstInteraction.bind(this);
    this.invalidateViewportDependentProps = this.invalidateViewportDependentProps.bind(this);
    this.invalidateVDPOnceOriented = this.invalidateVDPOnceOriented.bind(this);
    this.pickActor = this.pickActor.bind(this);
    this.saveImageRef = this.saveImageRef.bind(this);
    this.scrollBegin = this.scrollBegin.bind(this);
    this.scrollContinue = this.scrollContinue.bind(this);
    this.scrollFinish = this.scrollFinish.bind(this);
    this.scrollWheel = this.scrollWheel.bind(this);
  }

  clampScrollOffset(scrollOffset) {
    return Math.min(
      this.viewportDependentProps.scrollMax,
      Math.max(-this.viewportDependentProps.scrollMax, scrollOffset)
    );
  }

  firstInteraction() {
    this.hasMadeFirstInteraction = true;
    this.setState({ scrollOffset: this.measureScrollOffset(), shouldAutoPan: false });
  }

  invalidateViewportDependentProps() {
    this.updateViewportDependentProps();
    this.setState({ scrollOffset: null });
  }

  invalidateVDPOnceOriented() {
    const before = this.viewportDependentProps.viewportRatio;
    const after = measureViewport().ratio;

    if ((before >= 1 && after >= 1) || (before < 1 && after < 1)) {
      return window.requestAnimationFrame(this.invalidateVDPOnceOriented);
    }

    this.invalidateViewportDependentProps();
  }

  measureScrollOffset() {
    const transform = window.getComputedStyle(this.base).transform;

    return transform.indexOf('matrix') === 0 ? Math.round(transform.split(', ')[4]) : 0;
  }

  pickActor(event) {
    if (this.hasRecentlyScrolled) {
      return;
    }

    const sceneBox = this.base.getBoundingClientRect();
    const sceneScale = sceneBox.width / this.props.width;
    const sceneX = (event.pageX - sceneBox.left) / sceneScale;
    const sceneY = (event.pageY - sceneBox.top) / sceneScale;

    const candidateActors = this.props.actors
      .filter(
        actor =>
          sceneX >= actor.body.x &&
          sceneX <= actor.body.x + actor.body.width &&
          sceneY >= actor.body.y &&
          sceneY <= actor.body.y + actor.body.height
      )
      .sort((a, b) => b.body.y + b.body.height - (a.body.y + a.body.height));

    const canvas = document.createElement('canvas');

    canvas.width = this.props.width;
    canvas.height = this.props.height;

    const ctx = canvas.getContext('2d');

    const nextFocus = candidateActors.find(actor => {
      ctx.clearRect(0, 0, this.props.width, this.props.height);
      ctx.drawImage(
        this.imageRefs[actor.body.image.url],
        actor.body.x,
        actor.body.y,
        actor.body.width,
        actor.body.height
      );

      return ctx.getImageData(sceneX, sceneY, 1, 1).data[3] >= 128;
    });

    if (!nextFocus && !this.props.focused) {
      return;
    }

    this.props.navigate(nextFocus === this.props.focused ? null : nextFocus);
    this.setState({ scrollOffset: null });
  }

  saveImageRef(el) {
    this.imageRefs[el.src] = el;
  }

  scrollBegin(event) {
    if (!this.hasMadeFirstInteraction) {
      this.firstInteraction();
    }

    if (this.props.focused || this.scrollPreviousX != null) {
      return;
    }

    this.scrollPreviousX = event.touches ? event.touches[0].clientX : event.clientX;
  }

  scrollContinue(event) {
    if (typeof event.scale !== 'undefined' && event.scale !== 1) {
      // Attempt to stop pinch-zoom
      return event.preventDefault();
    }

    if (this.scrollPreviousX == null) {
      return;
    }

    this.hasRecentlyScrolled = true;
    this.scrollCurrentX = event.touches ? event.touches[0].clientX : event.clientX;

    if (this.props.explore) {
      this.props.explore();
    }

    this.setState({
      scrollOffset: this.clampScrollOffset(
        (this.state.scrollOffset || this.measureScrollOffset()) - this.scrollPreviousX + this.scrollCurrentX
      )
    });

    this.scrollPreviousX = this.scrollCurrentX;
  }

  scrollFinish() {
    if (this.hasRecentlyScrolled) {
      setTimeout(() => (this.hasRecentlyScrolled = false), 250);
    }

    this.scrollPreviousX = null;
    this.scrollCurrentX = null;
  }

  scrollWheel(event) {
    if (!this.hasMadeFirstInteraction) {
      this.firstInteraction();
    }

    if (this.props.focused || this.scrollPreviousX != null || !event.deltaX) {
      return;
    }

    if (this.props.explore) {
      this.props.explore();
    }

    this.setState({
      scrollOffset: this.clampScrollOffset((this.state.scrollOffset || this.measureScrollOffset()) - event.deltaX)
    });
  }

  updateViewportDependentProps(nextProps) {
    const { width, height } = nextProps || this.props;
    const viewport = measureViewport();
    const ratioDiff = width / height - viewport.ratio;
    const scaledWidth = ratioDiff > 0 ? (viewport.height / height) * width : viewport.width;
    const scaledHeight = ratioDiff > 0 ? viewport.height : (viewport.width / width) * height;
    const scrollMax = Math.max(0, Math.round((scaledWidth - viewport.width) / 2));
    const [autoPanClassName, autoPanStyles] = createAutoPan(scrollMax);

    this.viewportDependentProps = {
      viewportRatio: viewport.ratio,
      scaledWidth,
      scaledHeight,
      scrollMax,
      autoPanClassName,
      autoPanStyles
    };
  }

  componentDidMount() {
    if (this.canvasID) {
      this.canvasVideo = new CanvasVideoPlayer({
        canvasSelector: `#${this.canvasID}`,
        videoSelector: `#${this.videoID}`,
        hideVideo: true,
        autoplay: true,
        audio: false,
        loop: true
      });
    }

    window.addEventListener('resize', this.invalidateViewportDependentProps);
    window.addEventListener('orientationchange', this.invalidateVDPOnceOriented);
  }

  componentWillReceiveProps({ width, height }) {
    if (this.props.width !== width || this.props.height !== height) {
      this.updateViewportDependentProps();
    }
  }

  componentDidUpdate() {
    this.lastFocused = this.props.focused;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.invalidateViewportDependentProps);
    window.removeEventListener('orientationchange', this.invalidateVDPOnceOriented);
  }

  render({ isUnavailable, width, height, image, video, actors, focused }, { scrollOffset, shouldAutoPan }) {
    const { scaledWidth, scaledHeight, autoPanClassName, autoPanStyles } = this.viewportDependentProps;
    const actorsBackToFront = actors.slice().sort((a, b) => a.body.y + a.body.height - (b.body.y + b.body.height));
    const hasLargeViewport = window.matchMedia('(min-width: 64rem) and (min-height: 48rem)').matches;
    const isZoomingIn = focused && this.lastFocused == null;
    const isZoomingOut = !focused && this.lastFocused != null;
    const originXPct = focused ? ((focused.body.x + focused.body.focus.x) / width) * 100 : 50;
    const originYPct = focused ? ((focused.body.y + focused.body.focus.y) / height) * 100 : 50;
    const transformOrigin = `${originXPct}% ${originYPct}%`;
    const scale = focused ? focused.body.focus.scale / 100 : 1;
    const translateX = focused
      ? `${50 - originXPct}%`
      : scrollOffset != null
        ? `${scrollOffset}px`
        : isZoomingOut
          ? `${this.clampScrollOffset(this.measureScrollOffset())}px`
          : 0;
    const translateY = focused ? `${66 - originYPct}%` : 0;
    const transform = `translate3d(${translateX}, ${translateY}, 0) scale(${scale})`;
    const transitionDelay = scrollOffset ? '0s' : '';
    const transitionDuration = scrollOffset ? '0s' : '';

    return (
      <div
        className={cn(styles.root, {
          [autoPanClassName]: shouldAutoPan && !isUnavailable && !focused,
          [styles.hasFocused]: focused,
          [styles.isZoomingIn]: isZoomingIn,
          [styles.isZoomingOut]: isZoomingOut
        })}
        aria-hidden={isUnavailable || focused ? 'true' : 'false'}
        style={{
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          transformOrigin,
          transform,
          transitionDelay,
          transitionDuration
        }}
        onMouseDown={isUnavailable ? null : this.scrollBegin}
        onTouchStart={isUnavailable ? null : this.scrollBegin}
        onMouseMoveCapture={isUnavailable ? null : this.scrollContinue}
        onTouchMoveCapture={isUnavailable ? null : this.scrollContinue}
        onMouseUp={isUnavailable ? null : this.scrollFinish}
        onTouchEnd={isUnavailable ? null : this.scrollFinish}
        onMouseLeave={isUnavailable ? null : this.scrollFinish}
        onTouchCancel={isUnavailable ? null : this.scrollFinish}
        onWheel={isUnavailable ? null : this.scrollWheel}
        onClick={isUnavailable ? null : this.pickActor}
      >
        {shouldAutoPan && !isUnavailable && !focused && <style>{autoPanStyles}</style>}
        <div className={styles.base}>
          {image && <img src={image.url} alt={image.description} />}
          {hasLargeViewport &&
            video && (
              <video
                src={video.url}
                poster={image ? image.url : null}
                alt={image ? image.description : null}
                autoplay
                loop
                muted
                playsinline
                webkit-playsinline
              />
            )}
        </div>
        <div className={styles.bodies}>
          {actorsBackToFront.map((actor, index) => (
            <Body
              xPct={actor.body.x / width}
              yPct={actor.body.y / height}
              widthPct={actor.body.width / width}
              depthIndex={index}
              src={actor.body.image.url}
              alt={actor.body.image.description || actor.name}
              isInFocus={!focused || focused === actor}
              onImage={this.saveImageRef}
            />
          ))}
        </div>
      </div>
    );
  }
}

const createAutoPan = (scrollMax = 0) => {
  if (scrollMax < 100) {
    // Don't allow autoPan when there's less than 100px to travel
    // (otherwise you sometimes get a shaky/bouncy effect)
    return [null, null];
  }

  const className = `${styles.root}_autoPan__scrollMax${scrollMax}`;
  const animationName = `${className}__animation`;

  const style = `
@keyframes ${animationName} {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  25% {
    transform: translate3d(${scrollMax}px, 0, 0);
  }
  75% {
    transform: translate3d(${-scrollMax}px, 0, 0);
  }
}

.${className} {
  animation: ${animationName} ${Math.round(scrollMax / 5)}s linear 0s infinite alternate both;
}
  `;

  return [className, style];
};

const measureViewport = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    ratio: width / height
  };
};

module.exports = Scene;
