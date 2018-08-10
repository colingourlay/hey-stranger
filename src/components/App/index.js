const { h, Component } = require('preact');
const ABCNewsNav = require('../ABCNewsNav');
const AspectRatioRegulator = require('../AspectRatioRegulator');
const Button = require('../Button');
const Credits = require('../Credits');
const CreditsNav = require('../CreditsNav');
const Curtain = require('../Curtain');
const Dropdown = require('../Dropdown');
const HUDFilter = require('../HUDFilter');
const Hints = require('../Hints');
const Loader = require('../Loader');
const RingNav = require('../RingNav');
const Meta = require('../Meta');
const Reader = require('../Reader');
const Scene = require('../Scene');
const Stage = require('../Stage');
const styles = require('./styles.css');

class App extends Component {
  constructor(props) {
    super(props);

    this.navigate = this.navigate.bind(this);
    this.onInitialExplore = this.onInitialExplore.bind(this);
    this.onInitialReveal = this.onInitialReveal.bind(this);
    this.swipeBegin = this.swipeBegin.bind(this);
    this.swipeContinue = this.swipeContinue.bind(this);
    this.swipeFinish = this.swipeFinish.bind(this);
    this.start = this.start.bind(this);

    this.updateRing(props.scene);

    this.navigationCount = 0;

    this.state = {
      current: null,
      prev: null,
      next: null,
      hasStarted: false,
      isInteractive: false
    };
  }

  navigate(target) {
    const current = target;
    const ringLength = this.ring.length;
    const ringIndex = this.ring.indexOf(current);
    let prev = null;
    let next = null;

    if (ringIndex !== -1) {
      prev = this.ring[(ringLength + ringIndex - 1) % ringLength];
      next = this.ring[(ringLength + ringIndex + 1) % ringLength];
    }

    this.hasExplored = true;

    if (!this.hasMadeChoice) {
      this.hasMadeChoice = this.props.scene && this.props.scene.actors.indexOf(current) !== -1;
    }

    this.setState({ current, prev, next });
  }

  onInitialExplore() {
    this.hasExplored = true;
    this.forceUpdate();
  }

  onInitialReveal() {
    this.hasRevealed = true;
    this.forceUpdate();
  }

  swipeBegin(event) {
    if (this.swipe != null) {
      return;
    }

    const { clientX, clientY } = event.touches ? event.touches[0] : event;

    this.swipe = { x: clientX, y: clientY };
  }

  swipeContinue(event) {
    if (typeof event.scale !== 'undefined' && event.scale !== 1) {
      // Attempt to stop pinch-zoom
      return event.preventDefault();
    }

    if (this.swipe == null) {
      return;
    }

    const { clientX, clientY } = event.touches ? event.touches[0] : event;

    this.swipe.dX = clientX - this.swipe.x;
    this.swipe.dY = clientY - this.swipe.y;

    if (Math.abs(this.swipe.dX) > 40 || Math.abs(this.swipe.dY) > 20) {
      this.swipeFinish();
    }
  }

  swipeFinish() {
    if (this.swipe == null) {
      return;
    }

    const { dX } = this.swipe;

    this.swipe = null;

    if (dX == null || Math.abs(dX) <= 40) {
      return;
    }

    this.hasExploredOthers = true;

    if (this.state.current === this.props.scene.creditsHTML) {
      this.navigate(null);
    } else if (this.state.next && dX < 0) {
      this.navigate(this.state.next);
    } else if (this.state.prev) {
      this.navigate(this.state.prev);
    }
  }

  start() {
    this.setState({ hasStarted: true });

    setTimeout(() => {
      this.setState({ isInteractive: true });
    }, 1500);
  }

  updateRing({ actors } = {}) {
    this.ring = actors ? [...actors] : [];
  }

  componentDidUpdate() {
    this.updateRing(this.props.scene);
  }

  render({ meta, scene }, { current, prev, next, hasStarted, isInteractive }) {
    const currentActor = scene && scene.actors.indexOf(current) !== -1 ? current : null;
    const currentCreditsHTML = scene && scene.creditsHTML === current ? current : null;

    return (
      <main
        role="main"
        className={styles.root}
        onMouseDown={current ? this.swipeBegin : null}
        onTouchStart={current ? this.swipeBegin : null}
        onMouseMove={current ? this.swipeContinue : null}
        onTouchMove={current ? this.swipeContinue : null}
        onMouseUp={current ? this.swipeFinish : null}
        onTouchEnd={current ? this.swipeFinish : null}
        onMouseLeave={current ? this.swipeFinish : null}
        onTouchCancel={current ? this.swipeFinish : null}
      >
        <Loader />
        {meta &&
          scene && (
            <AspectRatioRegulator min="4/9" max="3/2">
              <Curtain isUnavailable={hasStarted}>
                <Meta isUnavailable={hasStarted} {...meta} />
                <Button primary tabindex={hasStarted ? -1 : 0} onClick={this.start}>
                  Start
                </Button>
              </Curtain>
              <Reader
                focused={currentActor}
                navigate={this.navigate}
                onReveal={this.hasRevealed ? null : this.onInitialReveal}
              />
              <Stage hasFocus={!!currentActor} isUnavailable={!hasStarted}>
                <Scene
                  isUnavailable={!isInteractive}
                  focused={currentActor}
                  navigate={this.navigate}
                  onExplore={this.hasExplored ? null : this.onInitialExplore}
                  {...scene}
                />
              </Stage>
              <Credits
                html={scene.creditsHTML.replace(/(<a )/g, !currentCreditsHTML ? '$1tabindex="-1" ' : '$1')}
                isUnavailable={!currentCreditsHTML}
                navigate={this.navigate}
              />
              <HUDFilter />
              <Dropdown
                actors={scene.actors}
                current={currentActor}
                isUnavailable={!hasStarted}
                navigate={this.navigate}
              />
              <RingNav prev={prev} next={next} isUnavailable={!currentActor} navigate={this.navigate} />
              <CreditsNav
                creditsHTML={scene.creditsHTML}
                isUnavailable={!hasStarted || currentCreditsHTML}
                navigate={this.navigate}
              />
              <ABCNewsNav isUnavailable={current} />
              <Hints
                initialExplore={isInteractive && !this.hasExplored}
                initialChoice={isInteractive && !current && !this.hasMadeChoice}
                revealScreen={isInteractive && currentActor && !this.hasRevealed}
                othersExplore={isInteractive && currentActor && this.hasRevealed && !this.hasExploredOthers}
              />
            </AspectRatioRegulator>
          )}
      </main>
    );
  }
}

module.exports = App;
