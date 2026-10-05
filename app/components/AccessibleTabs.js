'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useHorizontalOverflow } from './InteractionPrimitives';

export function SectionTabs({ tabs, selectedIndex, onChange }) {
  const listRef = useRef(null);
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const overflow = useHorizontalOverflow(listRef, tabs.length);

  useLayoutEffect(() => {
    const list = listRef.current;
    const activeTab = tabRefs.current[selectedIndex];
    if (!list || !activeTab) return undefined;

    const updateIndicator = () => {
      const listRect = list.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - listRect.left + list.scrollLeft,
        width: tabRect.width,
      });
    };

    updateIndicator();
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateIndicator);
      resizeObserver.observe(list);
      resizeObserver.observe(activeTab);
    }
    window.addEventListener('resize', updateIndicator);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [selectedIndex, tabs.length]);

  useEffect(() => {
    const list = listRef.current;
    const activeTab = tabRefs.current[selectedIndex];
    if (!list || !activeTab) return undefined;

    const centerActiveTab = () => {
      if (list.scrollWidth <= list.clientWidth + 1) return;
      const nextLeft =
        list.scrollLeft +
        activeTab.getBoundingClientRect().left -
        list.getBoundingClientRect().left -
        (list.clientWidth - activeTab.clientWidth) / 2;
      const reduceMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
      list.scrollTo({ left: Math.max(0, nextLeft), behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    centerActiveTab();
    window.addEventListener('resize', centerActiveTab);
    return () => window.removeEventListener('resize', centerActiveTab);
  }, [selectedIndex]);

  function handleKeyDown(event, currentIndex) {
    let nextIndex = null;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    onChange(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      className="tabs-shell"
      data-can-scroll-left={String(overflow.canScrollLeft)}
      data-can-scroll-right={String(overflow.canScrollRight)}
    >
      <div className="tabs" role="tablist" aria-label="Secciones principales" ref={listRef}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={`section-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            aria-controls={`section-panel-${tab.id}`}
            tabIndex={selectedIndex === index ? 0 : -1}
            className={`tab ${selectedIndex === index ? 'active' : ''}`}
            onClick={() => onChange(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span className="tab__icon" aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
        <span
          className="tab-indicator"
          aria-hidden="true"
          style={{ width: `${indicator.width}px`, transform: `translateX(${indicator.left}px)` }}
        />
      </div>
      {overflow.hasOverflow && <span className="tabs-hint" aria-hidden="true">Desliza</span>}
    </div>
  );
}

export function TabPanel({ tab, panelDirection = 'next', onSwipe, children, hidden = false }) {
  const panelRef = useRef(null);
  const gesture = useRef(null);
  const onSwipeRef = useRef(onSwipe);
  const suppressClickRef = useRef(false);
  const clickResetTimer = useRef(null);

  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    if (hidden) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;

    function shouldIgnoreSwipe(target) {
      return target instanceof Element && Boolean(target.closest(
        'a, button, input, select, textarea, label, [role="button"], [role="combobox"], [role="tab"], [role="switch"], [contenteditable="true"], [data-no-swipe], [data-map], iframe'
      ));
    }

    function handleTouchStart(event) {
      // A fresh touch is a deliberate new action, not the click tail of the previous drag.
      suppressClickRef.current = false;
      window.clearTimeout(clickResetTimer.current);
      if (event.touches.length !== 1 || shouldIgnoreSwipe(event.target)) {
        gesture.current = null;
        return;
      }
      const touch = event.changedTouches[0];
      gesture.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: event.timeStamp,
        axis: null,
      };
    }

    function handleTouchMove(event) {
      const start = gesture.current;
      if (!start || event.touches.length !== 1) {
        gesture.current = null;
        return;
      }
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const distanceX = Math.abs(dx);
      const distanceY = Math.abs(dy);

      if (!start.axis && distanceX > 8 && distanceX > distanceY * 1.2) start.axis = 'horizontal';
      else if (!start.axis && distanceY > 8 && distanceY > distanceX * 1.2) start.axis = 'vertical';

      // Only claim a clearly horizontal gesture; vertical scrolling and pinch zoom stay native.
      if (start.axis === 'horizontal' && event.cancelable) event.preventDefault();
    }

    function handleTouchEnd(event) {
      const start = gesture.current;
      gesture.current = null;
      if (!start || start.axis !== 'horizontal') return;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const distanceX = Math.abs(dx);
      const elapsed = Math.max(1, event.timeStamp - start.time);
      const fastEnough = distanceX >= 36 && distanceX / elapsed >= 0.45;
      const longEnough = distanceX >= 64;

      if (distanceX > Math.abs(dy) * 1.2 && (longEnough || fastEnough)) {
        suppressClickRef.current = true;
        window.clearTimeout(clickResetTimer.current);
        clickResetTimer.current = window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 450);
        onSwipeRef.current(dx < 0 ? 1 : -1);
      }
    }

    function handleTouchCancel() {
      gesture.current = null;
    }

    panel.addEventListener('touchstart', handleTouchStart, { passive: true });
    panel.addEventListener('touchmove', handleTouchMove, { passive: false });
    panel.addEventListener('touchend', handleTouchEnd, { passive: true });
    panel.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      panel.removeEventListener('touchstart', handleTouchStart);
      panel.removeEventListener('touchmove', handleTouchMove);
      panel.removeEventListener('touchend', handleTouchEnd);
      panel.removeEventListener('touchcancel', handleTouchCancel);
      window.clearTimeout(clickResetTimer.current);
    };
  }, [hidden]);

  function preventAccidentalClick(event) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    window.clearTimeout(clickResetTimer.current);
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <section
      ref={panelRef}
      id={`section-panel-${tab.id}`}
      className={`tab-panel tab-panel--${panelDirection}`}
      role="tabpanel"
      aria-labelledby={`section-tab-${tab.id}`}
      hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      onClickCapture={preventAccidentalClick}
    >
      {children}
    </section>
  );
}
