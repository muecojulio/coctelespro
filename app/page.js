'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './globals.css';
import { ActionButton, HorizontalRail, SearchableCombobox } from './components/InteractionPrimitives';
import { SectionTabs, TabPanel } from './components/AccessibleTabs';
import {
  DrinkDetail,
  DrinkRail,
  MatchList,
  CostPlanner,
  PriceEditor,
  ShoppingList,
  ShareCard,
} from './components/DrinkViews';
import { cachedFetch } from '../lib/api-cache';
import { LOCAL_DRINKS, mergeDrinks, remoteDrinkToDrink, searchDrinks, allCategories } from '../lib/drinks';
import { INGREDIENTS } from '../lib/data/ingredients';
import { EXTRA_ALIASES, rankDrinks, unlockSuggestions } from '../lib/pairing';
import { normalizeText } from '../lib/i18n';
import { partyPlan, formatMoney, CURRENCIES } from '../lib/costs';

const API = 'https://www.thecocktaildb.com/api/json/v1/1';
const TABS = [
  { id: 'inicio', label: 'Inicio', icon: '🍸' },
  { id: 'ingredientes', label: 'Ingredientes', icon: '🍋' },
  { id: 'fiesta', label: 'Fiesta', icon: '🎉' },
  { id: 'costos', label: 'Costos', icon: '💰' },
  { id: 'instalar', label: 'Instalar', icon: '📱' },
  { id: 'privacidad', label: 'Privacidad', icon: '🔒' },
];

const STORAGE_KEY = 'cocteles-pro';
const MAX_MENU_ITEMS = 6;
const RESULTS_PAGE = 36;

const PANTRY_SUGGESTIONS = Array.from(
  new Set([
    ...Object.values(INGREDIENTS).map((ingredient) => ingredient.es),
    ...Object.keys(EXTRA_ALIASES),
  ]),
).sort((a, b) => a.localeCompare(b, 'es'));

function Feedback({ status, children, id }) {
  if (!children) return null;
  const isError = status === 'error';
  return (
    <p
      id={id}
      className={`form-feedback ${isError ? 'form-feedback--error' : ''}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {children}
    </p>
  );
}

function RecipePicker({ options, selected, onSelect, label = 'Bebida de referencia' }) {
  return (
    <SearchableCombobox
      label={label}
      placeholder="Escribe un nombre o elige una opción…"
      options={options}
      selected={selected}
      onSelect={onSelect}
    />
  );
}

export default function Home() {
  const [tab, setTab] = useState(0);
  const [panelDirection, setPanelDirection] = useState('next');
  const [theme, setTheme] = useState('dark');
  const [storageReady, setStorageReady] = useState(false);

  const [onlineDrinks, setOnlineDrinks] = useState([]);
  const [q, setQ] = useState('');
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchFeedback, setSearchFeedback] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [noAlcoholOnly, setNoAlcoholOnly] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(RESULTS_PAGE);

  const [selectedId, setSelectedId] = useState(LOCAL_DRINKS[0].id);
  const [wiki, setWiki] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  const [mine, setMine] = useState([]);
  const [newIng, setNewIng] = useState('');
  const [ingredientStatus, setIngredientStatus] = useState('idle');
  const [ingredientFeedback, setIngredientFeedback] = useState('');
  const [includeStaples, setIncludeStaples] = useState(true);
  const [matchFilter, setMatchFilter] = useState('todos');

  const [people, setPeople] = useState(10);
  const [menu, setMenu] = useState([]);

  const [prices, setPrices] = useState({});
  const [currency, setCurrency] = useState('MXN');
  const [margin, setMargin] = useState(70);
  const [showPriceEditor, setShowPriceEditor] = useState(false);

  const [breweries, setBreweries] = useState([]);
  const [beers, setBeers] = useState([]);

  const searchingRef = useRef(false);
  const wikiRequestRef = useRef(0);
  const ingredientRemoveRefs = useRef([]);
  const ingredientInputRef = useRef(null);

  const catalog = useMemo(() => mergeDrinks(LOCAL_DRINKS, onlineDrinks), [onlineDrinks]);
  const selected = useMemo(
    () => catalog.find((drink) => drink.id === selectedId) || LOCAL_DRINKS[0],
    [catalog, selectedId],
  );
  const categories = useMemo(() => allCategories(catalog), [catalog]);

  const visibleDrinks = useMemo(() => {
    let list = searchDrinks(catalog, q);
    if (categoryFilter !== 'todas') list = list.filter((drink) => drink.category === categoryFilter);
    if (noAlcoholOnly) list = list.filter((drink) => drink.type === 'sin-alcohol' || /sin alcohol/i.test(drink.alcoholic));
    if (onlyFavorites) list = list.filter((drink) => favorites.includes(drink.id));
    return list;
  }, [catalog, q, categoryFilter, noAlcoholOnly, onlyFavorites, favorites]);

  const shownDrinks = visibleDrinks.slice(0, visibleLimit);
  const favoriteDrinks = useMemo(
    () => catalog.filter((drink) => favorites.includes(drink.id)),
    [catalog, favorites],
  );

  const matches = useMemo(
    () => rankDrinks(catalog, mine, { includeStaples }),
    [catalog, mine, includeStaples],
  );
  const readyMatches = matches.filter((result) => result.canMake);
  const filteredMatches = matches.filter((result) => {
    if (matchFilter === 'listos') return result.canMake;
    if (matchFilter === 'casi') return !result.canMake && result.missing.length <= 2;
    return true;
  });
  const unlock = useMemo(() => unlockSuggestions(matches), [matches]);

  const menuPlan = useMemo(() => {
    const items = menu
      .map((entry) => ({ drink: catalog.find((drink) => drink.id === entry.id), perPerson: entry.perPerson }))
      .filter((entry) => entry.drink);
    return partyPlan(items, people, prices);
  }, [menu, catalog, people, prices]);

  const selectedInMenu = menu.find((entry) => entry.id === selected?.id);

  const shareText = useMemo(() => {
    const lines = ['🍸 Cócteles Pro — plan de fiesta', `${menuPlan.people} personas · ${menuPlan.drinksTotal} bebidas`, ''];
    if (menuPlan.items.length) {
      menuPlan.items.forEach((item) => lines.push(`• ${item.drink.name}: ${item.drinks} vasos (${formatMoney(item.cost, currency)})`));
      lines.push('', 'Insumos:');
      menuPlan.shopping.forEach((item) => {
        lines.push(`- ${item.name}: se usan ${item.amountLabel}${item.packs ? `; comprar ${item.packs.requiredPacks} × ${item.packs.label} (≈ ${formatMoney(item.packs.purchaseCost, currency)})` : ''} — ${formatMoney(item.cost, currency)} consumido`);
      });
      lines.push('', `Total estimado: ${formatMoney(menuPlan.total, currency)}`, `Costo por persona: ${formatMoney(menuPlan.perPerson, currency)}`);
    } else {
      lines.push('Todavía no hay bebidas en el menú.');
    }
    return lines.join('\n');
  }, [menuPlan, currency]);

  // ── Persistencia ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(saved.ingredients)) setMine(saved.ingredients.filter(Boolean).map(String));
      if (Array.isArray(saved.favorites)) setFavorites(saved.favorites);
      if (Array.isArray(saved.history)) setHistory(saved.history);
      if (Array.isArray(saved.menu)) setMenu(saved.menu.filter((entry) => entry?.id));
      if (saved.prices && typeof saved.prices === 'object') setPrices(saved.prices);
      if (CURRENCIES[saved.currency]) setCurrency(saved.currency);
      if (Number.isFinite(saved.margin)) setMargin(saved.margin);
      if (Number.isFinite(saved.people)) setPeople(Math.max(1, saved.people));
      if (typeof saved.includeStaples === 'boolean') setIncludeStaples(saved.includeStaples);
      if (saved.theme === 'light' || saved.theme === 'dark') setTheme(saved.theme);
    } catch {
      // Si el almacenamiento está dañado se arranca con los valores por defecto.
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 3,
        ingredients: mine,
        favorites,
        history,
        menu,
        prices,
        currency,
        margin,
        people,
        includeStaples,
        theme,
      }));
    } catch {
      // Sin espacio o sin permisos: la app sigue funcionando en memoria.
    }
  }, [storageReady, mine, favorites, history, menu, prices, currency, margin, people, includeStaples, theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // El resumen de Wikipedia se pide cada vez que cambia la bebida elegida.
  useEffect(() => {
    if (!selected) return;
    fetchWiki(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  useEffect(() => {
    cachedFetch('/api/breweries').then((data) => setBreweries(Array.isArray(data) ? data : [])).catch(() => {});
    cachedFetch('/api/beers').then((data) => setBeers(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchStatus !== 'success') return undefined;
    const timeout = window.setTimeout(() => {
      setSearchStatus('idle');
      setSearchFeedback('');
    }, 2600);
    return () => window.clearTimeout(timeout);
  }, [searchStatus]);

  useEffect(() => {
    if (ingredientStatus !== 'success') return undefined;
    const timeout = window.setTimeout(() => {
      setIngredientStatus('idle');
      setIngredientFeedback('');
    }, 2200);
    return () => window.clearTimeout(timeout);
  }, [ingredientStatus]);

  useEffect(() => {
    setVisibleLimit(RESULTS_PAGE);
  }, [q, categoryFilter, onlyFavorites, noAlcoholOnly]);

  // ── Acciones ─────────────────────────────────────────────────────────────
  function changeTab(nextTab) {
    if (tab === nextTab) return;
    setPanelDirection(nextTab > tab ? 'next' : 'previous');
    setTab(nextTab);
  }

  async function search(event) {
    event?.preventDefault();
    if (searchingRef.current) return;
    searchingRef.current = true;
    setSearchStatus('loading');
    setSearchFeedback('Buscando en el catálogo local y en el internacional…');

    const query = q.trim();
    const localCount = searchDrinks(LOCAL_DRINKS, query).length;

    try {
      const data = await cachedFetch(`${API}/search.php?s=${encodeURIComponent(query || 'margarita')}`);
      const remote = Array.isArray(data?.drinks) ? data.drinks.map(remoteDrinkToDrink) : [];
      setOnlineDrinks((current) => mergeDrinks(remote, current).slice(0, 120));
      setSearchStatus('success');
      setSearchFeedback(
        remote.length
          ? `Listo: ${localCount} recetas locales y ${remote.length} del catálogo internacional (traducidas).`
          : `Listo: ${localCount} recetas locales. El catálogo internacional no devolvió resultados.`,
      );
    } catch {
      setSearchStatus('error');
      setSearchFeedback(
        localCount
          ? `Sin conexión con el catálogo internacional. Mostrando ${localCount} recetas locales.`
          : 'No se pudo conectar con el catálogo internacional. Prueba otra palabra o revisa tu conexión.',
      );
    } finally {
      searchingRef.current = false;
    }
  }

  async function fetchWiki(drink) {
    setWiki(null);
    const requestId = ++wikiRequestRef.current;
    try {
      const params = new URLSearchParams({ title: drink.name });
      if (drink.nameEn && drink.nameEn !== drink.name) params.set('fallback', drink.nameEn);
      const data = await cachedFetch(`/api/wiki?${params.toString()}`);
      if (requestId === wikiRequestRef.current) setWiki(data?.extract ? data : null);
    } catch {
      if (requestId === wikiRequestRef.current) setWiki(null);
    }
  }

  function pick(drink) {
    if (!drink) return;
    setSelectedId(drink.id);
    setHistory((current) => {
      const entry = { id: drink.id, name: drink.name, at: Date.now() };
      return [entry, ...current.filter((item) => item.id !== drink.id)].slice(0, 8);
    });
  }

  function toggleFavorite(id) {
    setFavorites((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function addIngredientByName(value) {
    const clean = String(value || '').trim().toLocaleLowerCase('es');
    if (!clean) return;
    let duplicated = false;
    setMine((current) => {
      if (current.some((item) => normalizeText(item) === normalizeText(clean))) {
        duplicated = true;
        return current;
      }
      return [...current, clean];
    });
    setIngredientStatus(duplicated ? 'error' : 'success');
    setIngredientFeedback(duplicated ? `${clean} ya estaba en tu lista.` : `Se añadió ${clean}.`);
  }

  function addIngredient(event) {
    event.preventDefault();
    if (!newIng.trim()) {
      setIngredientStatus('error');
      setIngredientFeedback('Escribe el nombre de un ingrediente para añadirlo.');
      return;
    }
    addIngredientByName(newIng);
    setNewIng('');
  }

  function removeIngredient(ingredient, index) {
    setMine((current) => current.filter((item) => item !== ingredient));
    setIngredientStatus('idle');
    setIngredientFeedback(`Se quitó ${ingredient}.`);
    window.requestAnimationFrame(() => {
      const nextFocusIndex = Math.min(index, ingredientRemoveRefs.current.length - 1);
      const nextRemoveButton = nextFocusIndex >= 0 ? ingredientRemoveRefs.current[nextFocusIndex] : null;
      if (nextRemoveButton) nextRemoveButton.focus();
      else ingredientInputRef.current?.focus();
    });
  }

  function addToParty(drink) {
    if (!drink) return;
    setMenu((current) => {
      const existing = current.find((entry) => entry.id === drink.id);
      if (existing) {
        return current.map((entry) => (
          entry.id === drink.id ? { ...entry, perPerson: Math.min(6, entry.perPerson + 1) } : entry
        ));
      }
      if (current.length >= MAX_MENU_ITEMS) return current;
      return [...current, { id: drink.id, perPerson: 1 }];
    });
  }

  function changePerPerson(id, delta) {
    setMenu((current) => current.map((entry) => (
      entry.id === id ? { ...entry, perPerson: Math.min(6, Math.max(1, entry.perPerson + delta)) } : entry
    )));
  }

  function removeFromMenu(id) {
    setMenu((current) => current.filter((entry) => entry.id !== id));
  }

  function changePrice(key, next) {
    setPrices((current) => ({
      ...current,
      [key]: { size: next.size, price: next.price, label: next.label },
    }));
  }

  function resetPrice(key) {
    setPrices((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function swipeToTab(direction) {
    const nextTab = Math.min(TABS.length - 1, Math.max(0, tab + direction));
    if (nextTab !== tab) changeTab(nextTab);
  }

  const usedKeys = Array.from(new Set(
    menuPlan.items.flatMap((item) => item.lines.map((line) => line.key)),
  ));

  const panels = [
    // ── Inicio ──────────────────────────────────────────────────────────────
    (
      <div key="inicio">
        <section className="card" aria-labelledby="search-title">
          <div className="section-heading">
            <div>
              <h2 className="card-title" id="search-title">Buscar bebidas</h2>
              <p className="card-description">
                {LOCAL_DRINKS.length} bebidas en el catálogo local. Si hay conexión también se consulta el
                catálogo internacional y se traduce al español.
              </p>
            </div>
          </div>

          <form className="search-form" onSubmit={search}>
            <div className="field-group search-form__field">
              <label className="field-label" htmlFor="drink-search">Nombre, ingrediente o estilo</label>
              <input
                id="drink-search"
                className="input"
                type="search"
                value={q}
                onChange={(event) => {
                  setQ(event.target.value);
                  if (searchStatus !== 'loading') {
                    setSearchStatus('idle');
                    setSearchFeedback('');
                  }
                }}
                placeholder="Margarita, cerveza, tequila, sin alcohol…"
                autoComplete="off"
              />
            </div>
            <ActionButton
              className="btn btn-primary search-submit"
              type="submit"
              status={searchStatus}
              loadingLabel="Buscando…"
              successLabel="Resultados listos"
            >
              Buscar bebidas
            </ActionButton>
          </form>
          <Feedback status={searchStatus} id="search-feedback">{searchFeedback}</Feedback>

          <div className="filter-row" role="group" aria-label="Filtros de bebidas">
            <label className="field-group filter-select">
              <span className="field-label">Categoría</span>
              <select
                className="select"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="todas">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={`chip-filter ${onlyFavorites ? 'is-active' : ''}`}
              aria-pressed={onlyFavorites}
              onClick={() => setOnlyFavorites((value) => !value)}
            >
              ★ Solo favoritos
            </button>
            <button
              type="button"
              className={`chip-filter ${noAlcoholOnly ? 'is-active' : ''}`}
              aria-pressed={noAlcoholOnly}
              onClick={() => setNoAlcoholOnly((value) => !value)}
            >
              Sin alcohol
            </button>
          </div>

          <div className="results-header">
            <h3 className="results-title">Resultados</h3>
            <p className="result-count" aria-live="polite" aria-atomic="true">
              {visibleDrinks.length} {visibleDrinks.length === 1 ? 'bebida' : 'bebidas'}
            </p>
          </div>

          {shownDrinks.length > 0 ? (
            <>
              <DrinkRail
                drinks={shownDrinks}
                selectedId={selected?.id}
                favorites={favorites}
                onSelect={pick}
                onToggleFavorite={toggleFavorite}
              />
              {visibleDrinks.length > shownDrinks.length && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setVisibleLimit((value) => value + RESULTS_PAGE)}
                >
                  Ver más bebidas ({visibleDrinks.length - shownDrinks.length} restantes)
                </button>
              )}
            </>
          ) : (
            <p className="empty-state" role="status">
              No encontramos bebidas con esos filtros. Prueba otra palabra o quita filtros.
            </p>
          )}
        </section>

        <section className="card" aria-labelledby="detail-title">
          <h2 className="card-title" id="detail-title">Receta seleccionada</h2>
          <DrinkDetail
            drink={selected}
            wiki={wiki}
            isFavorite={favorites.includes(selected?.id)}
            onToggleFavorite={() => toggleFavorite(selected?.id)}
            onAddToParty={addToParty}
            onGoToCosts={() => changeTab(3)}
            canAddToParty={menu.length < MAX_MENU_ITEMS || Boolean(selectedInMenu)}
          />
        </section>

        {favoriteDrinks.length > 0 && (
          <section className="card" aria-labelledby="favorites-title">
            <div className="section-heading">
              <div>
                <h2 className="card-title" id="favorites-title">Tus favoritos</h2>
                <p className="card-description">Las bebidas que marcaste con ★.</p>
              </div>
            </div>
            <DrinkRail
              drinks={favoriteDrinks}
              selectedId={selected?.id}
              favorites={favorites}
              onSelect={pick}
              onToggleFavorite={toggleFavorite}
            />
          </section>
        )}

        {history.length > 0 && (
          <section className="card" aria-labelledby="history-title">
            <h2 className="card-title" id="history-title">Historial reciente</h2>
            <ul className="history-list">
              {history.map((entry) => (
                <li key={`${entry.id}-${entry.at}`}>
                  <button
                    type="button"
                    className="history-item"
                    onClick={() => {
                      const drink = catalog.find((item) => item.id === entry.id);
                      if (drink) pick(drink);
                    }}
                  >
                    <span>{entry.name}</span>
                    <span className="history-item__date">
                      {new Date(entry.at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    ),

    // ── Ingredientes ────────────────────────────────────────────────────────
    (
      <div key="ingredientes">
        <section className="card" aria-labelledby="ingredients-title">
          <div className="section-heading">
            <div>
              <h2 className="card-title" id="ingredients-title">Mis ingredientes</h2>
              <p className="card-description">
                Guarda lo que tienes en casa y la app calcula al instante qué bebidas puedes preparar.
              </p>
            </div>
          </div>

          {mine.length ? (
            <HorizontalRail label="Mis ingredientes disponibles" className="chips-rail">
              {mine.map((ingredient, index) => (
                <span className="chip" key={`${ingredient}-${index}`}>
                  <span className="chip__name">{ingredient}</span>
                  <button
                    ref={(element) => { ingredientRemoveRefs.current[index] = element; }}
                    className="remove"
                    type="button"
                    aria-label={`Quitar ${ingredient}`}
                    onClick={() => removeIngredient(ingredient, index)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </span>
              ))}
            </HorizontalRail>
          ) : (
            <p className="empty-state empty-state--compact">
              Todavía no has añadido ingredientes. Empieza por lo básico: tequila, limón, cerveza, refresco de toronja…
            </p>
          )}

          <form className="ingredient-form" onSubmit={addIngredient}>
            <div className="field-group ingredient-form__field">
              <label className="field-label" htmlFor="new-ingredient">Añadir ingrediente</label>
              <input
                ref={ingredientInputRef}
                id="new-ingredient"
                className="input"
                value={newIng}
                list="pantry-suggestions"
                onChange={(event) => {
                  setNewIng(event.target.value);
                  if (ingredientStatus === 'error' || ingredientStatus === 'success') {
                    setIngredientStatus('idle');
                    setIngredientFeedback('');
                  }
                }}
                placeholder="Tequila, limón, cerveza, hielo…"
                aria-invalid={ingredientStatus === 'error'}
                aria-describedby={ingredientFeedback ? 'ingredient-feedback' : undefined}
                autoComplete="off"
              />
              <datalist id="pantry-suggestions">
                {PANTRY_SUGGESTIONS.map((item) => <option key={item} value={item} />)}
              </datalist>
            </div>
            <ActionButton
              className="btn btn-primary ingredient-submit"
              type="submit"
              status={ingredientStatus}
              successLabel="Añadido"
            >
              Añadir ingrediente
            </ActionButton>
          </form>
          <Feedback status={ingredientStatus} id="ingredient-feedback">{ingredientFeedback}</Feedback>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={includeStaples}
              onChange={(event) => setIncludeStaples(event.target.checked)}
            />
            <span>Asumir que ya tengo hielo y agua</span>
          </label>
        </section>

        <section className="card" aria-labelledby="ready-title">
          <div className="section-heading">
            <div>
              <h2 className="card-title" id="ready-title">Qué puedes preparar</h2>
              <p className="card-description">
                {mine.length
                  ? `Con lo que tienes: ${readyMatches.length} ${readyMatches.length === 1 ? 'bebida lista' : 'bebidas listas'} y ${matches.length} con coincidencias parciales.`
                  : 'Añade tus ingredientes para ver las coincidencias.'}
              </p>
            </div>
          </div>

          {unlock.length > 0 && readyMatches.length < matches.length && (
            <div className="unlock-box">
              <p className="unlock-box__title">Si añades un ingrediente más podrías preparar:</p>
              <ul className="unlock-list">
                {unlock.map((entry) => (
                  <li key={entry.ingredient.key}>
                    <button
                      type="button"
                      className="chip chip--add"
                      onClick={() => addIngredientByName(entry.ingredient.name)}
                    >
                      <span aria-hidden="true">+</span> {entry.ingredient.name}
                    </button>
                    <span className="unlock-list__meta">{entry.count} {entry.count === 1 ? 'bebida' : 'bebidas'} más</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <MatchList
            results={filteredMatches}
            filter={matchFilter}
            onFilterChange={setMatchFilter}
            onSelect={pick}
            onAddIngredient={addIngredientByName}
            selectedId={selected?.id}
            hasPantry={mine.length > 0}
          />
        </section>
      </div>
    ),

    // ── Fiesta ──────────────────────────────────────────────────────────────
    (
      <div key="fiesta">
        <section className="card" aria-labelledby="party-title">
          <div className="section-heading">
            <div>
              <h2 className="card-title" id="party-title">Planea tu fiesta</h2>
              <p className="card-description">
                Arma el menú, define cuántas personas llegan y la app recalcula insumos, cantidades y costos.
              </p>
            </div>
          </div>

          <div className="party-controls">
            <RecipePicker
              options={catalog}
              selected={selected}
              onSelect={pick}
              label="Elige una bebida para el menú"
            />
            <div className="field-group guests-field">
              <label className="field-label" htmlFor="guest-count">Número de personas</label>
              <input
                id="guest-count"
                className="input"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={people}
                onChange={(event) => setPeople(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => addToParty(selected)}
            disabled={menu.length >= MAX_MENU_ITEMS && !selectedInMenu}
          >
            Añadir {selected?.name} al menú
          </button>

          <h3 className="subheading">Menú de la fiesta</h3>
          {menuPlan.items.length ? (
            <ul className="menu-list">
              {menuPlan.items.map((item) => (
                <li className="menu-row" key={item.drink.id}>
                  <div className="menu-row__info">
                    <p className="menu-row__name">{item.drink.emoji} {item.drink.name}</p>
                    <p className="menu-row__meta">
                      {item.perPerson} {item.perPerson === 1 ? 'vaso' : 'vasos'} por persona · {item.drinks} vasos · {formatMoney(item.cost, currency)}
                    </p>
                  </div>
                  <div className="menu-row__actions">
                    <button
                      type="button"
                      className="stepper"
                      aria-label={`Quitar un vaso por persona de ${item.drink.name}`}
                      onClick={() => changePerPerson(item.drink.id, -1)}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      className="stepper"
                      aria-label={`Añadir un vaso por persona de ${item.drink.name}`}
                      onClick={() => changePerPerson(item.drink.id, 1)}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="remove"
                      aria-label={`Quitar ${item.drink.name} del menú`}
                      onClick={() => removeFromMenu(item.drink.id)}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state empty-state--compact">
              El menú está vacío. Elige bebidas arriba y añádelas: puedes combinar hasta {MAX_MENU_ITEMS}.
            </p>
          )}

          <p className="party-summary" aria-live="polite" aria-atomic="true">
            Para <strong>{people} {people === 1 ? 'persona' : 'personas'}</strong> el menú suma{' '}
            <strong>{menuPlan.drinksTotal} vasos</strong> y cuesta aproximadamente{' '}
            <strong>{formatMoney(menuPlan.total, currency)}</strong> ({formatMoney(menuPlan.perPerson, currency)} por persona).
          </p>
        </section>

        <section className="card" aria-labelledby="supplies-title">
          <h2 className="card-title" id="supplies-title">Insumos y lista de compras</h2>
          <p className="card-description">
            Cantidades totales para {people} {people === 1 ? 'persona' : 'personas'}, con el envase que conviene comprar.
          </p>
          <ShoppingList plan={menuPlan} currency={currency} />
          <ShareCard title="la lista de compras" text={shareText} />
        </section>

        {(breweries.length > 0 || beers.length > 0) && (
          <section className="card" aria-labelledby="local-title">
            <h2 className="card-title" id="local-title">Cervezas y productores</h2>
            <p className="card-description">Datos de referencia del catálogo abierto de cervecerías y cervezas artesanales.</p>
            {breweries.length > 0 && (
              <section className="data-section" aria-labelledby="brewery-title">
                <h3 className="data-section__title" id="brewery-title">Cervecerías en México</h3>
                <ul className="data-list">
                  {breweries.map((brewery) => (
                    <li key={brewery.id} className="result-row">
                      <span>{brewery.name}</span>
                      <span>{[brewery.city, brewery.state].filter(Boolean).join(', ')}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {beers.length > 0 && (
              <section className="data-section" aria-labelledby="beer-title">
                <h3 className="data-section__title" id="beer-title">Cervezas artesanales</h3>
                <ul className="data-list">
                  {beers.slice(0, 8).map((beer) => (
                    <li key={beer.id} className="result-row">
                      <span>{beer.name}</span>
                      <span>{beer.price}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </section>
        )}
      </div>
    ),

    // ── Costos ──────────────────────────────────────────────────────────────
    (
      <div key="costos">
        <section className="card" aria-labelledby="cost-title">
          <div className="section-heading">
            <div>
              <h2 className="card-title" id="cost-title">Costos de tu menú</h2>
              <p className="card-description">
                Elige uno o más cócteles, define personas y vasos por persona. Aquí ves el costo de ingredientes,
                los envases que comprar, el ingreso sugerido y la ganancia estimada.
              </p>
            </div>
          </div>

          <div className="cost-controls">
            <div className="cost-controls__selector">
              <RecipePicker
                options={catalog}
                selected={selected}
                onSelect={pick}
                label="Cóctel para agregar al cálculo"
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => addToParty(selected)}
                disabled={!selected || Boolean(selectedInMenu) || menu.length >= MAX_MENU_ITEMS}
              >
                {selectedInMenu
                  ? 'Ya está incluido en el cálculo'
                  : menu.length >= MAX_MENU_ITEMS
                    ? `Límite de ${MAX_MENU_ITEMS} cócteles`
                    : `Agregar ${selected?.name} al cálculo`}
              </button>
            </div>
            <div className="cost-controls__settings">
              <div className="field-group guests-field">
                <label className="field-label" htmlFor="cost-guest-count">Número de personas</label>
                <input
                  id="cost-guest-count"
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={people}
                  onChange={(event) => setPeople(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
                />
              </div>
              <label className="field-group currency-field">
                <span className="field-label">Moneda</span>
                <select className="select" value={currency} onChange={(event) => setCurrency(event.target.value)}>
                  {Object.entries(CURRENCIES).map(([code, config]) => (
                    <option key={code} value={code}>{config.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <p className="note cost-planner-note">
            El menú de costos se comparte con la pestaña Fiesta. Los precios y las recetas son referencias editables;
            las compras se calculan solo con los ingredientes de los cócteles incluidos.
          </p>

          <CostPlanner
            plan={menuPlan}
            currency={currency}
            margin={margin}
            onMarginChange={setMargin}
            onChangePerPerson={changePerPerson}
            onRemoveDrink={removeFromMenu}
            onOpenPrices={() => setShowPriceEditor((value) => !value)}
          />

          {showPriceEditor && menuPlan.items.length > 0 && (
            <PriceEditor
              usedKeys={usedKeys}
              prices={prices}
              currency={currency}
              onChangePrice={changePrice}
              onResetPrice={resetPrice}
              onResetAll={() => setPrices({})}
            />
          )}
        </section>
      </div>
    ),

    // ── Instalar (QR) ──────────────────────────────────────────────────────
    (
      <div key="instalar">
        <section className="card" aria-labelledby="install-title">
          <div className="section-heading">
            <div>
              <h2 className="card-title" id="install-title">Instalar Cócteles Pro</h2>
              <p className="card-description">
                Escanea el código QR desde tu teléfono para abrir la app o instálala como aplicación en tu pantalla de inicio.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            {(() => {
              const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://coctelespro.vercel.app';
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(appUrl)}`;
              return (
                <>
                  <img
                    src={qrUrl}
                    alt="Código QR para instalar Cócteles Pro"
                    style={{ width: 260, height: 260, maxWidth: '100%', borderRadius: 12, background: '#fff', padding: 8 }}
                  />
                  <p style={{ marginTop: 12, color: 'var(--text2)', wordBreak: 'break-all' }}>
                    {appUrl}
                  </p>
                </>
              );
            })()}
          </div>

          <h3 className="subheading">Cómo instalarla</h3>
          <div className="install-instructions" style={{ display: 'grid', gap: 12 }}>
            <div className="card" style={{ padding: 16, background: 'rgba(255,255,255,0.04)' }}>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>📱 Android (Chrome)</p>
              <ol style={{ paddingLeft: 20, margin: 0, color: 'var(--text2)', lineHeight: 1.6 }}>
                <li>Abre la app en Chrome.</li>
                <li>Toca el menú (⋮) en la esquina superior derecha.</li>
                <li>Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".</li>
                <li>Confirma y listo: funcionará sin conexión.</li>
              </ol>
            </div>
            <div className="card" style={{ padding: 16, background: 'rgba(255,255,255,0.04)' }}>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>🍎 iPhone / iPad (Safari)</p>
              <ol style={{ paddingLeft: 20, margin: 0, color: 'var(--text2)', lineHeight: 1.6 }}>
                <li>Abre la app en Safari.</li>
                <li>Toca el botón Compartir (⬆️) en la barra inferior.</li>
                <li>Elige "Añadir a la pantalla de inicio".</li>
                <li>Confirma el nombre y toca "Añadir".</li>
              </ol>
            </div>
          </div>

          <p className="note" style={{ marginTop: 16 }}>
            La app funciona completamente sin internet una vez cargada; tus datos se guardan solo en tu dispositivo.
          </p>
        </section>
      </div>
    ),

    // ── Privacidad ──────────────────────────────────────────────────────────
    (
      <div key="privacidad">
        <section className="card" aria-labelledby="privacy-title">
          <div className="section-heading">
            <div>
              <h2 className="card-title" id="privacy-title">Política de privacidad</h2>
              <p className="card-description">Última actualización: 7 de octubre de 2026</p>
            </div>
          </div>

          <h3 className="subheading">Responsable</h3>
          <p style={{ color: 'var(--text2)' }}>
            Cócteles Pro opera de forma local en tu navegador.
          </p>

          <h3 className="subheading">Datos que se guardan</h3>
          <p style={{ color: 'var(--text2)' }}>
            Ingredientes, favoritos, historial, precios y preferencias viven solo en <code>localStorage</code> de este dispositivo.
            No hay cuenta ni backend de usuarios. Las traducciones del catálogo internacional se hacen en tu propio navegador.
          </p>

          <h3 className="subheading">APIs de terceros</h3>
          <p style={{ color: 'var(--text2)' }}>
            TheCocktailDB, Open Brewery DB, SampleAPIs, Wikipedia REST y QR Server. Las consultas pueden revelar el nombre
            de la bebida al proveedor. No se envían precios ni ingredientes personales.
          </p>

          <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)' }}>
            <p style={{ margin: 0, fontSize: '0.95em' }}>
              🔐 Ninguna información personal sale de tu teléfono o computadora.
            </p>
          </div>
        </section>
      </div>
    ),
  ];

  return (
    <div className="app-container">
      <header className="header">
        <h1>Cócteles Pro</h1>
        <div className="header-actions">
          <span className="theme-caption" aria-hidden="true">Tema</span>
          <button
            className="switch"
            type="button"
            role="switch"
            aria-checked={theme === 'light'}
            aria-label="Tema claro"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            <span className="thumb" aria-hidden="true" />
          </button>
        </div>
      </header>

      <SectionTabs tabs={TABS} selectedIndex={tab} onChange={changeTab} />

      <main className="content">
        {TABS.map((panel, index) => {
          const isActive = tab === index;
          return (
            <TabPanel
              key={`${panel.id}-${isActive ? `active-${tab}` : 'inactive'}`}
              tab={panel}
              hidden={!isActive}
              panelDirection={panelDirection}
              onSwipe={swipeToTab}
            >
              {panels[index]}
            </TabPanel>
          );
        })}
      </main>
    </div>
  );
}
