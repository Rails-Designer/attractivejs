/**
 * A light-weight library for declarative DOM actions using data attributes
 */

const Attractive = {
  /**
   * Initialize the Attractive.js library
   */
  initialize() {
    // Listen for common events
    document.addEventListener('click', this.handleEvent.bind(this));
    document.addEventListener('change', this.handleEvent.bind(this));

    // For Turbo compatibility
    if (typeof document !== 'undefined') {
      document.addEventListener('turbo:load', () => {
        // No initialization needed since we use event delegation
      });
    }

    console.log('Attractive.js initialized');
    return this;
  },

  /**
   * Handle DOM events and dispatch to appropriate handlers
   * @param {Event} event - The DOM event
   */
  handleEvent(event) {
    // Find the closest element with data-action
    const element = event.target.closest('[data-action]');
    if (!element) return;

    // Get the action string
    const actionValue = element.getAttribute('data-action');

    // Get the target (if specified)
    const targetSelector = element.getAttribute('data-target');

    // Parse the action
    if (actionValue.startsWith('toggleClass#')) {
      const className = actionValue.split('#')[1];
      this.toggleClass(element, className, targetSelector);
    }
  },

  /**
   * Toggle a class on target element(s)
   * @param {Element} element - The element with the action
   * @param {string} className - The class to toggle
   * @param {string} targetSelector - The CSS selector for target elements
   */
  toggleClass(element, className, targetSelector) {
    const targets = targetSelector
      ? document.querySelectorAll(targetSelector)
      : [element.parentElement];

    Array.from(targets).forEach(target => {
      target.classList.toggle(className);
    });
  }
};

// Initialize when the DOM is loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Attractive.initialize());
  } else {
    Attractive.initialize();
  }
}

// Make it available globally
if (typeof window !== 'undefined') {
  window.Attractive = Attractive;
}

export default Attractive;
