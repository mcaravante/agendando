(function() {
  'use strict';

  // Configuration
  const AGENDANDO_BASE_URL = window.AGENDANDO_BASE_URL || 'http://localhost:5173';

  // Styles for the widget
  const styles = `
    .agendando-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }
    .agendando-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .agendando-popup {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 1000px;
      height: 90%;
      max-height: 700px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      transform: scale(0.9);
      transition: transform 0.3s;
    }
    .agendando-overlay.active .agendando-popup {
      transform: scale(1);
    }
    .agendando-popup iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .agendando-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      background: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 1000000;
      transition: transform 0.2s;
    }
    .agendando-close:hover {
      transform: scale(1.1);
    }
    .agendando-close svg {
      width: 20px;
      height: 20px;
      color: #374151;
    }
    .agendando-inline {
      width: 100%;
      min-height: 600px;
      border: none;
      border-radius: 12px;
    }
    .agendando-badge {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .agendando-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }
    .agendando-badge svg {
      width: 18px;
      height: 18px;
    }
  `;

  // Icons
  const calendarIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
  const closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';

  // Inject styles
  function injectStyles() {
    if (document.getElementById('agendando-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'agendando-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Create popup overlay
  function createPopup(url) {
    injectStyles();

    // Remove existing popup
    const existing = document.getElementById('agendando-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'agendando-overlay';
    overlay.className = 'agendando-overlay';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'agendando-close';
    closeBtn.innerHTML = closeIcon;
    closeBtn.onclick = closePopup;

    const popup = document.createElement('div');
    popup.className = 'agendando-popup';

    const iframe = document.createElement('iframe');
    iframe.src = url + '?embed=popup';
    iframe.allow = 'payment';

    popup.appendChild(iframe);
    overlay.appendChild(closeBtn);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    // Close on overlay click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closePopup();
      }
    });

    // Close on escape
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        closePopup();
        document.removeEventListener('keydown', escHandler);
      }
    });
  }

  function closePopup() {
    const overlay = document.getElementById('agendando-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => overlay.remove(), 300);
    }
  }

  // Create inline embed
  function createInline(container, url) {
    injectStyles();

    const iframe = document.createElement('iframe');
    iframe.className = 'agendando-inline';
    iframe.src = url + '?embed=inline';
    iframe.allow = 'payment';

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      container.innerHTML = '';
      container.appendChild(iframe);
    }
  }

  // Create floating badge/button
  function createBadge(url, options = {}) {
    injectStyles();

    const text = options.text || 'Agendar reunión';
    const color = options.color || '#3b82f6';

    const badge = document.createElement('button');
    badge.className = 'agendando-badge';
    badge.style.background = color;
    badge.innerHTML = calendarIcon + '<span>' + text + '</span>';
    badge.onclick = function() {
      createPopup(url);
    };

    document.body.appendChild(badge);
  }

  // Initialize from data attributes
  function initFromDataAttributes() {
    // Inline embeds
    document.querySelectorAll('[data-agendando-inline]').forEach(function(el) {
      const url = el.getAttribute('data-agendando-inline');
      if (url) createInline(el, url);
    });

    // Popup triggers
    document.querySelectorAll('[data-agendando-popup]').forEach(function(el) {
      const url = el.getAttribute('data-agendando-popup');
      if (url) {
        el.style.cursor = 'pointer';
        el.onclick = function(e) {
          e.preventDefault();
          createPopup(url);
        };
      }
    });

    // Badge widgets
    document.querySelectorAll('[data-agendando-badge]').forEach(function(el) {
      const url = el.getAttribute('data-agendando-badge');
      const text = el.getAttribute('data-agendando-text');
      const color = el.getAttribute('data-agendando-color');
      if (url) createBadge(url, { text, color });
      el.remove();
    });
  }

  // Public API
  window.Agendando = {
    popup: createPopup,
    inline: createInline,
    badge: createBadge,
    close: closePopup,
    baseUrl: AGENDANDO_BASE_URL
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFromDataAttributes);
  } else {
    initFromDataAttributes();
  }

  // Listen for messages from iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'agendando-close') {
      closePopup();
    }
    if (event.data && event.data.type === 'agendando-booked') {
      // Booking completed - could trigger custom event
      const customEvent = new CustomEvent('agendando:booked', { detail: event.data.booking });
      document.dispatchEvent(customEvent);
    }
  });
})();
