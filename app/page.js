'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './globals.css';
import { LOCAL_COCKTAILS } from './cocktails-local';
import { ActionButton, HorizontalRail, SearchableCombobox } from './components/InteractionPrimitives';
import { SectionTabs, TabPanel } from './components/AccessibleTabs';
import { cachedFetch } from '../lib/api-cache';

const API = 'https://www.thecocktaildb.com/api/json/v1/1';
const TABS = [
  { id: 'inicio', label: 'Inicio', icon: '🍸' },
  { id: 'ingredientes', label: 'Ingredientes', icon: '🍋' },
  { id: 'fiesta', label: 'Fiesta', icon: '🎉' },
  { id: 'costos', label: 'Costos', icon: '💰' },
];

function ings(drink) {
  const out = [];
  for (let i = 1; i <= 15; i += 1) {
    const name = drink[`strIngredient${i}`];
    if (name) out.push({ name, measure: drink[`strMeasure${i}`] || '' });
  }
  return out;
}

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
}

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

function RecipePicker({ options, selected, onSelect }) {
  return (
    <SearchableCombobox
      label="Cóctel de referencia"
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
  const [q, setQ] = useState('');
  const [results, setResults] = useState(LOCAL_COCKTAILS);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchFeedback, setSearchFeedback] = useState('');
  const [mine, setMine] = useState([]);
  const [newIng, setNewIng] = useState('');
  const [ingredientStatus, setIngredientStatus] = useState('idle');
  const [ingredientFeedback, setIngredientFeedback] = useState('');
  const [breweries, setBreweries] = useState([]);
  const [beers, setBeers] = useState([]);
  const [wiki, setWiki] = useState(null);
  const [selected, setSelected] = useState(LOCAL_COCKTAILS[0]);
  const [people, setPeople] = useState(10);
  const searchingRef = useRef(false);
  const wikiRequestRef = useRef(0);
  const ingredientRemoveRefs = useRef([]);
  const ingredientInputRef = useRef(null);

  const cocktailOptions = useMemo(() => {
    const unique = new Map();
    [...LOCAL_COCKTAILS, ...results, ...(selected ? [selected] : [])].forEach((drink) => {
      if (drink?.idDrink) unique.set(drink.idDrink, drink);
    });
    return Array.from(unique.values());
  }, [results, selected]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cocteles-pro') || '{}');
      if (Array.isArray(saved.ingredients)) setMine(saved.ingredients);
      if (saved.theme === 'light' || saved.theme === 'dark') setTheme(saved.theme);
    } catch {}
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem('cocteles-pro', JSON.stringify({ ingredients: mine, theme }));
    } catch {}
  }, [mine, theme, storageReady]);

  useEffect(() => {
    cachedFetch('/api/breweries').then((data) => setBreweries(Array.isArray(data) ? data : [])).catch(() => {});
    cachedFetch('/api/beers').then((data) => setBeers(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchStatus !== 'success') return undefined;
    const timeout = window.setTimeout(() => {
      setSearchStatus('idle');
      setSearchFeedback('');
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, [searchStatus]);

  useEffect(() => {
    if (ingredientStatus !== 'success') return undefined;
    const timeout = window.setTimeout(() => {
      setIngredientStatus('idle');
      setIngredientFeedback('');
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, [ingredientStatus]);

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
    setSearchFeedback('Buscando recetas…');

    const query = q.trim();
    const local = LOCAL_COCKTAILS.filter((drink) => normalizeSearch(drink.strDrink).includes(normalizeSearch(query)));

    try {
      const data = await cachedFetch(`${API}/search.php?s=${encodeURIComponent(query || 'margarita')}`);
      const remote = Array.isArray(data?.drinks) ? data.drinks : [];
      const combined = [...local, ...remote].filter((drink, index, all) =>
        all.findIndex((candidate) => candidate.idDrink === drink.idDrink) === index
      );
      setResults(combined);
      setSearchStatus('success');
      setSearchFeedback(`Búsqueda completada. ${combined.length} ${combined.length === 1 ? 'receta disponible' : 'recetas disponibles'}.`);
    } catch {
      setResults(local.length ? local : LOCAL_COCKTAILS);
      setSearchStatus('error');
      setSearchFeedback('No se pudo conectar con el catálogo en línea. Se muestran recetas locales.');
    } finally {
      searchingRef.current = false;
    }
  }

  async function pick(drink) {
    setSelected(drink);
    setWiki(null);
    const requestId = ++wikiRequestRef.current;
    try {
      const data = await cachedFetch(`/api/wiki?title=${encodeURIComponent(drink.strDrink)}`);
      if (requestId === wikiRequestRef.current) setWiki(data);
    } catch {
      if (requestId === wikiRequestRef.current) setWiki(null);
    }
  }

  function addIngredient(event) {
    event.preventDefault();
    const ingredient = newIng.trim().toLocaleLowerCase('es');
    if (!ingredient) {
      setIngredientStatus('error');
      setIngredientFeedback('Escribe el nombre de un ingrediente para añadirlo.');
      return;
    }
    setMine((current) => [...current, ingredient]);
    setNewIng('');
    setIngredientStatus('success');
    setIngredientFeedback(`Se añadió ${ingredient}.`);
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

  function swipeToTab(direction) {
    const nextTab = Math.min(TABS.length - 1, Math.max(0, tab + direction));
    if (nextTab !== tab) changeTab(nextTab);
  }

  const selectedIngredients = selected ? ings(selected) : [];
  const panels = [
    (
      <section className="card search-card" aria-labelledby="search-title">
        <div className="section-heading">
          <div>
            <h2 className="card-title" id="search-title">Buscar cócteles</h2>
            <p className="card-description">Explora recetas y selecciona una para tu próxima ronda.</p>
          </div>
        </div>

        <form className="search-form" onSubmit={search}>
          <div className="field-group search-form__field">
            <label className="field-label" htmlFor="drink-search">Nombre del cóctel</label>
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
              placeholder="Margarita, Paloma…"
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
            Buscar recetas
          </ActionButton>
        </form>
        <Feedback status={searchStatus} id="search-feedback">{searchFeedback}</Feedback>

        <div className="results-header">
          <h3 className="results-title">Recetas para explorar</h3>
          <p className="result-count" aria-live="polite" aria-atomic="true">
            {results.length} {results.length === 1 ? 'receta' : 'recetas'}
          </p>
        </div>

        {results.length > 0 ? (
          <HorizontalRail
            label="Resultados de cócteles"
            className="drink-rail"
            trackClassName={`drink-list ${results.length === 1 ? 'drink-list--single' : ''}`}
            trackRole="list"
          >
            {results.map((drink) => {
              const isSelected = selected?.idDrink === drink.idDrink;
              const ingredients = ings(drink).map((ingredient) => ingredient.name).join(', ');
              return (
                <li className="drink-card-slot" key={drink.idDrink}>
                  <button
                    type="button"
                    className="drink-card"
                    aria-pressed={isSelected}
                    onClick={() => pick(drink)}
                  >
                    <span className="drink-body">
                      <span className="drink-card__heading">
                        <span className="drink-name">{drink.strDrink}</span>
                        {isSelected && <span className="drink-card__selected" aria-hidden="true">✓ Seleccionado</span>}
                      </span>
                      <span className="drink-ingredients">
                        {ingredients || 'Selecciona para consultar sus ingredientes'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </HorizontalRail>
        ) : (
          <p className="empty-state" role="status">No encontramos recetas para esa búsqueda. Prueba con otro nombre.</p>
        )}

        {wiki?.extract && (
          <p className="wiki-extract">
            <span className="wiki-extract__title">Sobre {selected?.strDrink}: </span>
            {wiki.extract}
          </p>
        )}
      </section>
    ),
    (
      <section className="card" aria-labelledby="ingredients-title">
        <div className="section-heading">
          <div>
            <h2 className="card-title" id="ingredients-title">Mis ingredientes</h2>
            <p className="card-description">Guarda lo que tienes a mano para planificar tus recetas.</p>
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
          <p className="empty-state empty-state--compact">Todavía no has añadido ingredientes.</p>
        )}

        <form className="ingredient-form" onSubmit={addIngredient}>
          <div className="field-group ingredient-form__field">
            <label className="field-label" htmlFor="new-ingredient">Añadir ingrediente</label>
            <input
              ref={ingredientInputRef}
              id="new-ingredient"
              className="input"
              value={newIng}
              onChange={(event) => {
                setNewIng(event.target.value);
                if (ingredientStatus === 'error' || ingredientStatus === 'success') {
                  setIngredientStatus('idle');
                  setIngredientFeedback('');
                }
              }}
              placeholder="Tequila, limón, cerveza…"
              aria-invalid={ingredientStatus === 'error'}
              aria-describedby={ingredientFeedback ? 'ingredient-feedback' : undefined}
              autoComplete="off"
            />
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
      </section>
    ),
    (
      <section className="card" aria-labelledby="party-title">
        <div className="section-heading">
          <div>
            <h2 className="card-title" id="party-title">Planea tu fiesta</h2>
            <p className="card-description">Elige una receta y calcula una cantidad aproximada para tus invitados.</p>
          </div>
        </div>

        <div className="party-controls">
          <RecipePicker options={cocktailOptions} selected={selected} onSelect={pick} />
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

        <p className="party-summary" aria-live="polite" aria-atomic="true">
          Para <strong>{people} {people === 1 ? 'persona' : 'personas'}</strong>, calcula aproximadamente <strong>{people * 2} vasos</strong> de {selected?.strDrink || 'tu cóctel'}.
        </p>

        {(breweries.length > 0 || beers.length > 0) && (
          <div className="local-recommendations">
            <h3 className="results-title">Cervezas y productores</h3>
            {breweries.length > 0 && (
              <section className="data-section" aria-labelledby="brewery-title">
                <h4 className="data-section__title" id="brewery-title">Cervecerías</h4>
                <ul className="data-list">
                  {breweries.map((brewery) => (
                    <li key={brewery.id} className="result-row">
                      <span>{brewery.name}</span>
                      <span>{brewery.city}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {beers.length > 0 && (
              <section className="data-section" aria-labelledby="beer-title">
                <h4 className="data-section__title" id="beer-title">Cervezas</h4>
                <ul className="data-list">
                  {beers.slice(0, 6).map((beer) => (
                    <li key={beer.id} className="result-row">
                      <span>{beer.name}</span>
                      <span>{beer.price || ''}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </section>
    ),
    (
      <section className="card" aria-labelledby="cost-title">
        <div className="section-heading">
          <div>
            <h2 className="card-title" id="cost-title">Ingredientes y costos</h2>
            <p className="card-description">Consulta las cantidades de la receta seleccionada.</p>
          </div>
        </div>

        <RecipePicker options={cocktailOptions} selected={selected} onSelect={pick} />

        <h3 className="cost-recipe-title">{selected?.strDrink || 'Selecciona un cóctel'}</h3>
        {selectedIngredients.length ? (
          <dl className="cost-list">
            {selectedIngredients.map((ingredient, index) => (
              <div className="result-row" key={`${ingredient.name}-${index}`}>
                <dt>{ingredient.name}</dt>
                <dd>{ingredient.measure || '—'}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="empty-state">Esta receta todavía no tiene ingredientes registrados.</p>
        )}
      </section>
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
            onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
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
