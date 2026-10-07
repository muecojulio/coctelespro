'use client';

import { useEffect, useId, useRef, useState } from 'react';

export function ActionButton({
  status = 'idle',
  loadingLabel = 'Procesando…',
  successLabel = 'Listo',
  className = '',
  type = 'button',
  disabled = false,
  children,
  ...buttonProps
}) {
  const isLoading = status === 'loading';
  const isDisabled = disabled || isLoading;
  const label = isLoading
    ? loadingLabel
    : status === 'success'
      ? successLabel
      : children;

  return (
    <button
      {...buttonProps}
      type={type}
      className={className}
      data-state={status}
      disabled={isDisabled}
      aria-busy={isLoading ? 'true' : undefined}
    >
      <span className="action-button__content">
        {status === 'loading' && <span className="action-spinner" aria-hidden="true" />}
        {status === 'success' && <span className="action-state-icon" aria-hidden="true">✓</span>}
        {status === 'error' && <span className="action-state-icon" aria-hidden="true">!</span>}
        <span>{label}</span>
      </span>
    </button>
  );
}

export function useHorizontalOverflow(trackRef, measureKey) {
  const [overflow, setOverflow] = useState({ hasOverflow: false, canScrollLeft: false, canScrollRight: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const measure = () => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      setOverflow((previous) => {
        const next = {
          hasOverflow: maxScroll > 1,
          canScrollLeft: maxScroll > 1 && track.scrollLeft > 1,
          canScrollRight: maxScroll > 1 && track.scrollLeft < maxScroll - 1,
        };
        if (
          previous.hasOverflow === next.hasOverflow &&
          previous.canScrollLeft === next.canScrollLeft &&
          previous.canScrollRight === next.canScrollRight
        ) return previous;
        return next;
      });
    };

    const onScroll = () => measure();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(track);
      Array.from(track.children).forEach((child) => resizeObserver.observe(child));
    }

    const frame = window.requestAnimationFrame(measure);
    return () => {
      window.cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      resizeObserver?.disconnect();
    };
  }, [trackRef, measureKey]);

  return overflow;
}

export function HorizontalRail({
  children,
  label,
  className = '',
  trackClassName = '',
  trackRole = 'group',
}) {
  const trackRef = useRef(null);
  const overflow = useHorizontalOverflow(trackRef, children);
  const shellClasses = [
    'rail-shell',
    overflow.hasOverflow ? 'rail-shell--overflow' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={shellClasses}
      data-no-swipe="true"
      data-can-scroll-left={String(overflow.canScrollLeft)}
      data-can-scroll-right={String(overflow.canScrollRight)}
    >
      <div
        ref={trackRef}
        role={trackRole}
        aria-label={label}
        tabIndex={overflow.hasOverflow ? 0 : undefined}
        className={['horizontal-rail', trackClassName].filter(Boolean).join(' ')}
      >
        {children}
      </div>
      {overflow.hasOverflow && <span className="rail-hint" aria-hidden="true">Desliza para explorar</span>}
    </div>
  );
}

function normalizeOptionText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
}

export function SearchableCombobox({
  label,
  options,
  selected,
  onSelect,
  placeholder = 'Escribe para buscar…',
}) {
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-listbox`;
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(selected?.strDrink || '');
  const [activeIndex, setActiveIndex] = useState(-1);

  const normalizedQuery = normalizeOptionText(query.trim());
  const filteredOptions = options.filter((option) =>
    [option.strDrink, option.name, option.nameEn]
      .some((value) => normalizeOptionText(value).includes(normalizedQuery))
  );
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : null;

  useEffect(() => {
    if (!isOpen) setQuery(selected?.strDrink || '');
  }, [isOpen, selected?.idDrink, selected?.strDrink]);

  useEffect(() => {
    if (!isOpen || !activeOption) return;
    const activeElement = document.getElementById(`${id}-option-${activeIndex}`);
    activeElement?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, activeOption, id, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsidePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [isOpen]);

  function openWithCurrentQuery() {
    const matchingIndex = filteredOptions.findIndex((option) => option.idDrink === selected?.idDrink);
    setActiveIndex(matchingIndex >= 0 ? matchingIndex : (filteredOptions.length ? 0 : -1));
    setIsOpen(true);
  }

  function openAllOptions() {
    const nextOptions = options;
    setQuery('');
    setActiveIndex(nextOptions.length ? 0 : -1);
    setIsOpen(true);
  }

  function closeAndRestoreSelection() {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery(selected?.strDrink || '');
  }

  function chooseOption(option) {
    setQuery(option.strDrink);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect(option);
  }

  function handleInputKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        openWithCurrentQuery();
      } else if (filteredOptions.length) {
        setActiveIndex((index) => (index < 0 ? 0 : Math.min(index + 1, filteredOptions.length - 1)));
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(filteredOptions.length ? filteredOptions.length - 1 : -1);
      } else if (filteredOptions.length) {
        setActiveIndex((index) => (index < 0 ? filteredOptions.length - 1 : Math.max(index - 1, 0)));
      }
      return;
    }

    if (isOpen && event.key === 'Home' && filteredOptions.length) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (isOpen && event.key === 'End' && filteredOptions.length) {
      event.preventDefault();
      setActiveIndex(filteredOptions.length - 1);
      return;
    }

    if (event.key === 'Enter' && isOpen && activeOption) {
      event.preventDefault();
      chooseOption(activeOption);
      return;
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closeAndRestoreSelection();
      return;
    }

    if (event.key === 'Tab' && isOpen) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="combobox" ref={rootRef} data-no-swipe="true">
      <label className="field-label" htmlFor={inputId}>{label}</label>
      <div className="combobox__field">
        <input
          ref={inputRef}
          id={inputId}
          className="input combobox__input"
          type="text"
          role="combobox"
          value={isOpen ? query : (selected?.strDrink || query)}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={isOpen && activeOption ? `${id}-option-${activeIndex}` : undefined}
          onFocus={openWithCurrentQuery}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={handleInputKeyDown}
        />
        <button
          className="combobox__toggle"
          type="button"
          aria-label={isOpen ? 'Cerrar opciones de cóctel' : 'Mostrar todas las opciones de cóctel'}
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={() => {
            if (isOpen) closeAndRestoreSelection();
            else openAllOptions();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && isOpen) {
              event.preventDefault();
              closeAndRestoreSelection();
            }
            if (event.key === 'Tab' && isOpen) {
              setIsOpen(false);
              setActiveIndex(-1);
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              if (!isOpen) openAllOptions();
              inputRef.current?.focus({ preventScroll: true });
            }
            if (!isOpen && (event.key === 'Enter' || event.key === ' ')) {
              window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
            }
          }}
        >
          <span aria-hidden="true" className={`combobox__chevron ${isOpen ? 'is-open' : ''}`} />
        </button>
      </div>
      <div className="combobox__menu" hidden={!isOpen}>
        <ul
          id={listId}
          className="combobox__options"
          role="listbox"
          aria-label={`${label}: resultados`}
          hidden={!isOpen || filteredOptions.length === 0}
        >
          {filteredOptions.map((option, index) => {
            const isSelected = option.idDrink === selected?.idDrink;
            const isActive = index === activeIndex;
            return (
              <li
                id={`${id}-option-${index}`}
                key={option.idDrink}
                role="option"
                aria-selected={isSelected}
                className={`combobox__option ${isActive ? 'is-active' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseOption(option)}
              >
                <span>{option.strDrink}</span>
                {isSelected && <span className="combobox__selected" aria-hidden="true">✓</span>}
              </li>
            );
          })}
        </ul>
        {isOpen && filteredOptions.length === 0 && (
          <p className="combobox__empty" role="status" aria-live="polite">
            No hay coincidencias{query.trim() ? ` para “${query.trim()}”` : ''}.
          </p>
        )}
      </div>
    </div>
  );
}
