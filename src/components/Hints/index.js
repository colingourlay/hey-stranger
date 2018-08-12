const { h } = require('preact');
const Arrow = require('../Arrow');
const TapTarget = require('../TapTarget');
const styles = require('./styles.css');

module.exports = ({ initialExplore, initialChoice, revealScreen, othersExplore }) => (
  <div className={styles.root}>
    <div className={styles.initialExplore} aria-hidden={initialExplore ? 'false' : 'true'}>
      <Arrow direction="left" hasTail />
      <span>Scroll to explore</span>
      <Arrow direction="right" hasTail />
    </div>
    <div className={styles.initialChoice} aria-hidden={initialChoice ? 'false' : 'true'}>
      <span>Tap on a stranger</span>
      <TapTarget />
    </div>
    <div className={styles.revealScreen} aria-hidden={revealScreen ? 'false' : 'true'}>
      <Arrow direction="up" hasTail />
      <span>Scroll to see screen</span>
    </div>
    <div className={styles.othersExplore} aria-hidden={othersExplore ? 'false' : 'true'}>
      <Arrow direction="left" hasTail />
      <span>Swipe for others</span>
      <Arrow direction="right" hasTail />
    </div>
  </div>
);

module.exports.displayName = 'Hints';