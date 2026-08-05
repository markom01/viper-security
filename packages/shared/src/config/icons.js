/**
 * Inline SVG icon strings, replacing template_file SVGs.
 * Used with Astro's set:html or Fragment set:html.
 */

export const ICONS = {
  /** Right arrow, #001010 fill — for dark-on-light CTAs */
  rightArrow:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#001010" viewBox="0 0 256 256" aria-hidden="true"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>',

  /** Right arrow, #ffffff fill — for light-on-dark CTAs */
  rightArrowPure:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffffff" viewBox="0 0 256 256" aria-hidden="true"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>',

  /** Cancel/close, #ffffff fill */
  cancel:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ffffff" viewBox="0 0 256 256" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>',

  /** Cancel/close, #010101 (onyx) fill */
  cancelOnyx:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#010101" viewBox="0 0 256 256" aria-hidden="true"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>',

  /** Marquee separator asterisk, #010101 fill */
  marqueeIcon:
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0 9C0 8.36941 0.511807 7.86575 1.13533 7.77158C4.55362 7.25532 7.2553 4.55362 7.77156 1.13535C7.86573 0.511817 8.3694 0 9 0C9.6306 0 10.1343 0.511817 10.2284 1.13535C10.7447 4.55362 13.4464 7.25532 16.8647 7.77158C17.4882 7.86575 18 8.36941 18 9C18 9.63059 17.4882 10.1343 16.8647 10.2284C13.4464 10.7447 10.7447 13.4464 10.2284 16.8647C10.1343 17.4882 9.6306 18 9 18C8.3694 18 7.86573 17.4882 7.77156 16.8647C7.2553 13.4464 4.55362 10.7447 1.13533 10.2284C0.511808 10.1343 0 9.63059 0 9Z" fill="#010101"/></svg>',

  /** Chevron down, currentColor fill — for dropdown affordance */
  caretDown:
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>',

  /** Check mark in circle, #917148 (gold) fill */
  checkMark:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#917148" viewBox="0 0 256 256" aria-hidden="true"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></svg>',
};
