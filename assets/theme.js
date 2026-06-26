/* ==========================================================================
   DROP — theme.js  (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* --- Money formatting (classic Shopify helper) ------------------------- */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    format = format || window.moneyFormat || '${{amount}}';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;

    function defaultTo(value, def) { return (value == null || value !== value) ? def : value; }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultTo(precision, 2);
      thousands = defaultTo(thousands, ',');
      decimal   = defaultTo(decimal, '.');
      if (isNaN(number) || number == null) return 0;
      number = (number / 100.0).toFixed(precision);
      const parts = number.split('.');
      const dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      const centsPart = parts[1] ? decimal + parts[1] : '';
      return dollars + centsPart;
    }

    let value = '';
    const match = format.match(placeholderRegex);
    const type = match ? match[1] : 'amount';
    switch (type) {
      case 'amount':                value = formatWithDelimiters(cents, 2); break;
      case 'amount_no_decimals':    value = formatWithDelimiters(cents, 0); break;
      case 'amount_with_comma_separator': value = formatWithDelimiters(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = formatWithDelimiters(cents, 0, '.', ','); break;
      case 'amount_with_space_separator': value = formatWithDelimiters(cents, 2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': value = formatWithDelimiters(cents, 0, ' '); break;
      default: value = formatWithDelimiters(cents, 2);
    }
    return format.replace(placeholderRegex, value);
  }
  window.formatMoney = formatMoney;

  /* --- Overlay / drawers ------------------------------------------------- */
  const overlay = $('[data-overlay]');
  let openEl = null;

  function lockScroll(lock) { document.body.style.overflow = lock ? 'hidden' : ''; }

  function openDrawer(el) {
    if (!el) return;
    openEl = el;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    if (overlay) { overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add('is-active')); }
    lockScroll(true);
  }
  function closeDrawer() {
    if (openEl) { openEl.classList.remove('is-open'); openEl.setAttribute('aria-hidden', 'true'); openEl = null; }
    if (overlay) { overlay.classList.remove('is-active'); setTimeout(() => { overlay.hidden = true; }, 300); }
    lockScroll(false);
  }
  window.dropDrawer = { open: openDrawer, close: closeDrawer };

  if (overlay) overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-drawer-open]');
    if (opener) { e.preventDefault(); openDrawer($('#' + opener.getAttribute('data-drawer-open'))); }
    if (e.target.closest('[data-drawer-close]')) { e.preventDefault(); closeDrawer(); }
  });

  /* --- Cart -------------------------------------------------------------- */
  const drawerBody  = () => $('#CartDrawer .drawer__body');
  const drawerFoot  = () => $('#CartDrawer .drawer__foot');

  function updateCartCount(count) {
    $$('.cart-count').forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function renderShipBar(cart) {
    const wrap = $('[data-ship-bar]');
    if (!wrap) return;
    const threshold = parseInt(wrap.getAttribute('data-threshold'), 10) || 0;
    if (threshold <= 0) { wrap.hidden = true; return; }
    wrap.hidden = false;
    const remaining = threshold - cart.total_price;
    const fill = wrap.querySelector('.ship-bar__fill');
    const text = wrap.querySelector('.ship-bar__text');
    const pct = Math.min(100, (cart.total_price / threshold) * 100);
    if (fill) fill.style.width = pct + '%';
    if (text) {
      text.textContent = remaining > 0
        ? `You're ${formatMoney(remaining)} away from free shipping`
        : "You've unlocked free shipping!";
    }
  }

  function renderCart(cart) {
    updateCartCount(cart.item_count);
    const body = drawerBody();
    const foot = drawerFoot();
    if (!body) return;

    if (cart.item_count === 0) {
      body.innerHTML = '<div class="drawer__empty"><p>Your cart is empty</p><a href="/collections/all" class="btn" data-drawer-close>Start shopping</a></div>';
      if (foot) foot.hidden = true;
      return;
    }
    if (foot) foot.hidden = false;

    const lines = cart.items.map((item) => {
      const img = item.image
        ? `<img src="${item.image.replace(/(\.[a-zA-Z]+)(\?.*)?$/, '_160x$1')}" alt="${item.product_title}" loading="lazy">`
        : '';
      const variant = item.variant_title && item.variant_title !== 'Default Title'
        ? `<div class="cart-line__variant">${item.variant_title}</div>` : '';
      return `
        <div class="cart-line" data-key="${item.key}">
          <a class="cart-line__img" href="${item.url}">${img}</a>
          <div>
            <a class="cart-line__title" href="${item.url}">${item.product_title}</a>
            ${variant}
            <div class="cart-line__price">${formatMoney(item.final_line_price)}</div>
            <div class="qty" data-key="${item.key}">
              <button type="button" data-qty="minus" aria-label="Decrease">–</button>
              <input type="number" value="${item.quantity}" min="0" data-qty-input>
              <button type="button" data-qty="plus" aria-label="Increase">+</button>
            </div>
            <button type="button" class="cart-line__remove" data-remove>Remove</button>
          </div>
        </div>`;
    }).join('');
    body.innerHTML = lines;

    const subtotalEl = $('[data-cart-subtotal]');
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
    renderShipBar(cart);
  }

  async function fetchCart() {
    const res = await fetch(window.routes.cart_url + '.js', { headers: { 'Accept': 'application/json' } });
    return res.json();
  }

  async function refreshCart() {
    try { renderCart(await fetchCart()); } catch (e) { console.error(e); }
  }

  async function changeLine(key, quantity) {
    const body = drawerBody();
    if (body) body.classList.add('is-loading');
    try {
      const res = await fetch(window.routes.cart_change_url + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: key, quantity })
      });
      renderCart(await res.json());
    } catch (e) { console.error(e); }
    finally { if (body) body.classList.remove('is-loading'); }
  }

  // Add to cart (delegated for any [data-product-form])
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-product-form]');
    if (!form) return;
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn ? btn.textContent : '';
    if (btn) { btn.classList.add('is-disabled'); btn.textContent = 'Adding…'; }
    try {
      const res = await fetch(window.routes.cart_add_url + '.js', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json();
      if (data.status) { // error
        if (btn) btn.textContent = data.description || window.cartStrings.error;
        setTimeout(() => { if (btn) btn.textContent = original; }, 2000);
      } else {
        await refreshCart();
        openDrawer($('#CartDrawer'));
        if (btn) btn.textContent = 'Added ✓';
        setTimeout(() => { if (btn) btn.textContent = original; }, 1500);
      }
    } catch (err) {
      console.error(err);
      if (btn) btn.textContent = original;
    } finally {
      if (btn) btn.classList.remove('is-disabled');
    }
  });

  // Cart drawer qty / remove (delegated)
  document.addEventListener('click', (e) => {
    const line = e.target.closest('.cart-line');
    if (!line) return;
    const key = line.getAttribute('data-key');
    const input = line.querySelector('[data-qty-input]');
    if (e.target.matches('[data-remove]')) { changeLine(key, 0); return; }
    if (e.target.matches('[data-qty="plus"]'))  { changeLine(key, parseInt(input.value, 10) + 1); }
    if (e.target.matches('[data-qty="minus"]')) { changeLine(key, Math.max(0, parseInt(input.value, 10) - 1)); }
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('.cart-line [data-qty-input]')) {
      const line = e.target.closest('.cart-line');
      changeLine(line.getAttribute('data-key'), Math.max(0, parseInt(e.target.value, 10) || 0));
    }
  });

  /* --- Generic quantity steppers (non-cart, e.g. product page) ----------- */
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cart-line')) return;
    const wrap = e.target.closest('.qty');
    if (!wrap) return;
    const input = wrap.querySelector('input');
    if (!input) return;
    if (e.target.matches('[data-qty="plus"]'))  input.value = (parseInt(input.value, 10) || 1) + 1;
    if (e.target.matches('[data-qty="minus"]')) input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
  });

  /* --- Mobile nav -------------------------------------------------------- */
  // handled by data-drawer-open="MobileNav"

  /* --- Product: gallery + variants --------------------------------------- */
  function initProduct(root) {
    // Gallery thumbnails
    const mainImg = $('[data-gallery-main] img', root);
    $$('[data-thumb]', root).forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const full = thumb.getAttribute('data-full');
        if (mainImg && full) mainImg.src = full;
        $$('[data-thumb]', root).forEach((t) => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
      });
    });

    // Variants
    const dataEl = $('[data-product-json]', root);
    if (!dataEl) return;
    let product;
    try { product = JSON.parse(dataEl.textContent); } catch (e) { return; }

    const form     = $('[data-product-form]', root);
    const idInput  = form ? form.querySelector('[name="id"]') : null;
    const priceEl  = $('[data-price]', root);
    const addBtn   = form ? form.querySelector('[type="submit"]') : null;

    function selectedOptions() {
      return $$('[data-option]', root).map((group) => {
        const checked = group.querySelector('input:checked');
        if (checked) return checked.value;
        const sel = group.querySelector('select');
        return sel ? sel.value : null;
      });
    }

    function findVariant(opts) {
      return product.variants.find((v) =>
        v.options.every((o, i) => o === opts[i])
      );
    }

    function update() {
      const variant = findVariant(selectedOptions());
      if (!variant) return;
      if (idInput) idInput.value = variant.id;
      if (priceEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          priceEl.innerHTML = `<span class="price__sale">${formatMoney(variant.price)}</span> <span class="price__compare">${formatMoney(variant.compare_at_price)}</span>`;
        } else {
          priceEl.textContent = formatMoney(variant.price);
        }
      }
      if (addBtn) {
        if (variant.available) { addBtn.disabled = false; addBtn.textContent = addBtn.getAttribute('data-add-text') || 'Add to cart'; }
        else { addBtn.disabled = true; addBtn.textContent = 'Sold out'; }
      }
      // update URL
      if (history.replaceState) {
        const url = new URL(window.location);
        url.searchParams.set('variant', variant.id);
        history.replaceState({}, '', url);
      }
    }

    $$('[data-option] input, [data-option] select', root).forEach((el) =>
      el.addEventListener('change', update)
    );
  }

  /* --- Newsletter success message (?customer_posted=true) ---------------- */
  function initNewsletter() {
    if (window.location.search.indexOf('customer_posted=true') !== -1) {
      $$('[data-newsletter-success]').forEach((el) => (el.hidden = false));
    }
  }

  /* --- Init -------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    refreshCart();
    $$('[data-product]').forEach(initProduct);
    initNewsletter();
  });
})();
