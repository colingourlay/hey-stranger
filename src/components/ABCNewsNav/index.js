const cn = require('classnames');
const { h } = require('preact');
const styles = require('./styles.css');

module.exports = ({ isUnavailable }) => (
  <nav
    className={cn(styles.root, {
      [styles.isUnavailable]: isUnavailable
    })}
    aria-hidden={isUnavailable ? '' : null}
  >
    <a href="/news/" aria-label="ABC News homepage">
      <svg xmlns="http://www.w3.org/2000/svg" width="93" height="21" viewBox="0 0 93 21">
        <path d="M1.574 19.357c.697.463 1.57.712 2.437.658.429-.026.857-.125 1.262-.312 1.084-.522 2-1.609 2.301-2.913l-2-5.65-1.543 4.339-.064.18V4.968l4.215 11.734c.692 1.695 1.738 2.39 2.13 2.654.69.407 1.546.635 2.417.666h.066a5.314 5.314 0 0 0 1.731-.233c1.171-.433 2.17-.913 3.217-2.784l-2.126-5.562-1.265 3.347c-.217.632-.717.924-1.223.9-.504-.023-1.013-.36-1.251-.988l-4-10.647s-.697-1.692-1.042-2.041C6.009 1.058 4.837.668 3.88.712c-.565 0-.784.042-1.302.217C1.491 1.407.275 2.449.143 4.364v11.599c.04 1.652.35 2.61 1.43 3.394" />
        <path d="M11.748 5.924c.25-.66.787-.946 1.317-.891.48.05.953.381 1.202.98l3.999 10.602s.692 1.698 1.043 2.043c.782 1 2 1.347 2.955 1.347.561 0 .782-.043 1.257-.215 1.089-.48 2.349-1.524 2.476-3.477V4.753c-.04-1.695-.343-2.607-1.432-3.432-.769-.462-1.687-.704-2.59-.608-.374.04-.746.137-1.103.302-1.084.522-2.043 1.609-2.302 2.87l1.996 5.65 1.461-4.232.101-.29v10.734l-4.17-11.776c-.694-1.695-1.734-2.349-2.126-2.606-.797-.502-1.813-.717-2.817-.672a5.538 5.538 0 0 0-1.4.236c-1.173.436-2.171.867-3.213 2.74l2.127 5.605 1.219-3.35M31.268 1.857v17.08h3.05V6.908l6.71 12.03h3.733V1.857h-3.05v12.419l-6.856-12.42h-3.587zm15.648 0v17.08H57.36v-2.61h-7.417v-4.905H56.7v-2.61h-6.758V4.394h7.002l.366-2.538H46.916zm10.72 0l4.367 17.08h3.635l3.1-11.907 3.122 11.907h3.612l4.343-17.08H76.57L73.568 15.4h-.097L70.177 1.857h-2.928L64.077 15.4h-.098L60.856 1.857h-3.22zM92.51 3.395s-2.83-1.66-6.05-1.66c-3.417 0-5.832 1.513-5.832 4.636 0 5.588 9.076 4.368 9.076 7.76 0 1.463-1.244 2.366-3.318 2.366-2.782 0-4.904-1.805-4.904-1.805l-1.513 2.293s2.415 2.099 6.563 2.099c3.563 0 6.247-1.782 6.271-5.295 0-5.783-9.125-4.294-9.125-7.564 0-1.39 1.122-1.903 2.83-1.903 2.22 0 4.855 1.415 4.855 1.415l1.147-2.342z" />
      </svg>
    </a>
  </nav>
);

module.exports.displayName = 'ABCNewsNav';
