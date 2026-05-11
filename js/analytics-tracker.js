/**
 * ZOO Analytics Event Tracker
 * Privacy-first tracking via Plausible Analytics
 * 
 * Tracks: page views, CTA clicks, form submissions, checkout initiations, lead captures
 * No cookies, GDPR compliant, no PII stored
 */

(function() {
  'use strict';

  window.ZOO = window.ZOO || {};
  window.ZOO.analytics = {

    // Core event tracker — sends to Plausible goals
    trackEvent: function(eventName, props) {
      if (window.plausible) {
        plausible(eventName, { props: props || {} });
      }
      // Dev logging
      console.log('[ZOO Analytics] ' + eventName, props || '');
    },

    // CTA button clicks
    trackCTA: function(ctaName, location, destination) {
      this.trackEvent('cta_click', {
        cta_name: ctaName,
        page_location: location || window.location.pathname,
        destination: destination || ''
      });
    },

    // Form submissions
    trackFormSubmit: function(formName, formLocation) {
      this.trackEvent('form_submit', {
        form_name: formName,
        page_location: formLocation || window.location.pathname
      });
    },

    // Checkout initiation
    trackCheckoutStart: function(productName, price, currency) {
      this.trackEvent('checkout_initiated', {
        product_name: productName,
        price: price || '',
        currency: currency || 'USD'
      });
    },

    // Product page views
    trackProductView: function(productName, price) {
      this.trackEvent('product_view', {
        product_name: productName,
        price: price || ''
      });
    },

    // Lead capture (email submitted) — no PII stored
    trackLeadCapture: function(source) {
      this.trackEvent('lead_captured', {
        source: source || window.location.pathname
      });
    },

    // Outbound link clicks
    trackOutbound: function(url, linkText) {
      this.trackEvent('outbound_click', {
        url: url,
        link_text: linkText || ''
      });
    },

    // Chatbot interaction
    trackChatbot: function(action, detail) {
      this.trackEvent('chatbot_' + action, {
        detail: detail || ''
      });
    }
  };

  // ── AUTO-TRACKING ──
  document.addEventListener('DOMContentLoaded', function() {
    var zoo = window.ZOO.analytics;
    var loc = window.location.pathname;

    // Auto-track CTA buttons
    document.querySelectorAll('.btn-primary, .nav-cta, .pay-btn, .zoo-result-cta, a[href*="checkout"]').forEach(function(cta) {
      cta.addEventListener('click', function() {
        zoo.trackCTA(
          (this.textContent || '').trim().substring(0, 60),
          loc,
          this.getAttribute('href') || ''
        );
      });
    });

    // Auto-track checkout buttons
    document.querySelectorAll('a[href*="checkout.html"]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var href = this.getAttribute('href') || '';
        var productMatch = href.match(/[?&]product=([^&]+)/);
        var priceMatch = href.match(/[?&]price=([^&]+)/);
        zoo.trackCheckoutStart(
          productMatch ? decodeURIComponent(productMatch[1]) : 'unknown',
          priceMatch ? priceMatch[1] : '',
          'USD'
        );
      });
    });

    // Auto-track form submissions
    document.querySelectorAll('form').forEach(function(form) {
      form.addEventListener('submit', function() {
        zoo.trackFormSubmit(
          this.getAttribute('name') || this.id || 'unnamed-form',
          loc
        );
      });
    });

    // Auto-track email inputs (lead capture)
    document.querySelectorAll('input[type="email"]').forEach(function(input) {
      input.addEventListener('change', function() {
        if (this.value && this.value.includes('@')) {
          zoo.trackLeadCapture(loc);
        }
      });
    });

    // Auto-track outbound links
    document.querySelectorAll('a[href^="http"]').forEach(function(link) {
      var href = link.getAttribute('href') || '';
      if (href.indexOf('zootechnologies.com') === -1 && href.indexOf('localhost') === -1) {
        link.addEventListener('click', function() {
          zoo.trackOutbound(href, (link.textContent || '').trim().substring(0, 60));
        });
      }
    });

    // Auto-track product page views
    var productMatch = loc.match(/^\/products\/([^\/]+)/);
    if (productMatch) {
      var productNameEl = document.querySelector('.product-name, h1');
      var priceEl = document.querySelector('.price-amount, .product-price .amount');
      zoo.trackProductView(
        productNameEl ? productNameEl.textContent.trim() : productMatch[1],
        priceEl ? priceEl.textContent.trim() : ''
      );
    }

    // Auto-track checkout page
    if (loc.indexOf('checkout.html') !== -1) {
      var params = new URLSearchParams(window.location.search);
      zoo.trackCheckoutStart(
        decodeURIComponent(params.get('product') || 'unknown'),
        params.get('price') || '',
        'USD'
      );
    }
  });

})();
