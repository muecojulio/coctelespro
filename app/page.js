'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import { LOCAL_COCKTAILS } from './cocktails-local';
import { cachedFetch } from '../lib/api-cache';

const API = 'https://www.thecocktaildb.com/api/json/v1/1';

function ings(drink) {
  const out = [];
  for (let i = 1; i <= 15; i += 1) {
    const name = drink[`strIngredient${i}`];
    if (name) out.push({ name, measure: drink[`strMeasure${i}`] || '' });
  }
  return out;
}

export default function Home() {
  const [tab, setTab] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [q, setQ] = useState('');
  const [results, setResults] = useState(LOCAL_COCKTAILS);
  const [mine, setMine] = useState([]);
  const [newIng, setNewIng] = useState('');
  const [breweries, setBreweries] = useState([]);
  const [beers, setBeers] = useState([]);
  const [wiki, setWiki] = useState(null);
  const [selected, setSelected] = useState(LOCAL_COCKTAILS[0]);
  const [people, setPeople] = useState(10);

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cocteles-pro') || '{}');
      if (saved.ingredients) setMine(saved.ingredients);
      if (saved.theme) setTheme(saved.theme);
    } catch (e) {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('cocteles-pro', JSON.stringify({ ingredients: mine, theme })); } catch (e) {}
  }, [mine, theme]);
  useEffect(() => {
    cachedFetch('/api/breweries').then((d) => setBreweries(Array.isArray(d) ? d : [])).catch(() => {});
    cachedFetch('/api/beers').then((d) => setBeers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function search() {
    const local = LOCAL_COCKTAILS.filter((d) => d.strDrink.toLowerCase().includes(q.toLowerCase()));
    try {
      const data = await cachedFetch(`${API}/search.php?s=${encodeURIComponent(q || 'margarita')}`);
      const remote = data.drinks || [];
      setResults([...local, ...remote].filter((d, i, arr) => arr.findIndex((x) => x.idDrink === d.idDrink) === i));
    } catch (e) {
      setResults(local.length ? local : LOCAL_COCKTAILS);
    }
  }

  async function pick(drink) {
    setSelected(drink);
    try { setWiki(await cachedFetch(`/api/wiki?title=${encodeURIComponent(drink.strDrink)}`)); }
    catch (e) { setWiki(null); }
  }

  const tabs = ['Inicio', 'Ingredientes', 'Fiesta', 'Costos'];
  return (
    <div className="app-container">
      <header className="header">
        <h1>Cócteles Pro</h1>
        <div className="header-actions">
          <button className="switch" role="switch" aria-checked={theme === 'light'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            <span className="thumb" />
          </button>
        </div>
      </header>
      <nav className="tabs">
        {tabs.map((label, i) => (
          <button key={label} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
            <span>{['\ud83c\udf79', '\ud83c\udf4b', '\ud83c\udf89', '\ud83d\udcb0'][i]}</span>{label}
          </button>
        ))}
      </nav>
      <main className="content">
        {tab === 0 && (
          <div className="card">
            <div className="card-title">Buscar</div>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Margarita, Paloma..." />
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={search}>Buscar</button>
            {results.map((d) => (
              <button key={d.idDrink} className="drink-card" onClick={() => pick(d)} style={{ width: '100%', textAlign: 'left' }}>
                <div className="drink-body">
                  <div className="drink-name">{d.strDrink}</div>
                  <div className="drink-ingredients">{ings(d).map((x) => x.name).join(', ')}</div>
                </div>
              </button>
            ))}
            {wiki?.extract && <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{wiki.extract}</p>}
          </div>
        )}
        {tab === 1 && (
          <div className="card">
            <div className="card-title">Mis ingredientes</div>
            <div className="chips">{mine.map((ing) => (
              <span key={ing} className="chip">{ing}<button className="remove" onClick={() => setMine(mine.filter((x) => x !== ing))}>x</button></span>
            ))}</div>
            <input className="input" value={newIng} onChange={(e) => setNewIng(e.target.value)} placeholder="tequila, limon, cerveza" />
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => { if (newIng.trim()) setMine([...mine, newIng.trim().toLowerCase()]); setNewIng(''); }}>Anadir</button>
          </div>
        )}
        {tab === 2 && (
          <div className="card">
            <div className="card-title">Fiesta</div>
            <input className="input" type="number" value={people} onChange={(e) => setPeople(+e.target.value || 1)} />
            <p>Coctel: <strong>{selected?.strDrink}</strong> · {people * 2} vasos</p>
            {breweries.map((b) => <div key={b.id} className="result-row"><span>{b.name}</span><span>{b.city}</span></div>)}
            {beers.slice(0, 6).map((b) => <div key={b.id} className="result-row"><span>{b.name}</span><span>{b.price || ''}</span></div>)}
          </div>
        )}
        {tab === 3 && (
          <div className="card">
            <div className="card-title">Costos</div>
            {selected && ings(selected).map((x) => <div key={x.name} className="result-row"><span>{x.name}</span><span>{x.measure}</span></div>)}
          </div>
        )}
      </main>
    </div>
  );
}
