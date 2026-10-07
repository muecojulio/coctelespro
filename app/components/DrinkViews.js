'use client';

import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { HorizontalRail } from './InteractionPrimitives';
import { formatMoney, packOf, priceIsEdited, suggestedPrice } from '../../lib/costs';
import { INGREDIENTS, getIngredient } from '../../lib/data/ingredients';

export function FavoriteButton({ active, onToggle, name }) {
  return (
    <button
      type="button"
      className={`favorite ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      aria-label={active ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <span aria-hidden="true">{active ? '★' : '☆'}</span>
    </button>
  );
}

export function DrinkCard({ drink, isSelected, isFavorite, onSelect, onToggleFavorite }) {
  const ingredients = drink.ingredients.map((item) => item.name).join(' · ');
  return (
    <li className="drink-card-slot">
      <button
        type="button"
        className="drink-card"
        aria-pressed={isSelected}
        onClick={() => onSelect(drink)}
      >
        <span className="drink-body">
          <span className="drink-card__heading">
            <span className="drink-emoji" aria-hidden="true">{drink.emoji}</span>
            <span className="drink-name">{drink.name}</span>
          </span>
          <span className="drink-tags">
            <span className="badge">{drink.category}</span>
            <span className="badge badge--muted">{drink.alcoholic}</span>
            {isSelected && <span className="drink-card__selected" aria-hidden="true">✓ Elegida</span>}
          </span>
          <span className="drink-ingredients">
            {ingredients || 'Consulta sus ingredientes'}
          </span>
        </span>
      </button>
      <FavoriteButton active={isFavorite} onToggle={() => onToggleFavorite(drink.id)} name={drink.name} />
    </li>
  );
}

export function DrinkRail({ drinks, selectedId, favorites, onSelect, onToggleFavorite }) {
  return (
    <HorizontalRail
      label="Bebidas encontradas"
      className="drink-rail"
      trackClassName={`drink-list ${drinks.length === 1 ? 'drink-list--single' : ''}`}
      trackRole="list"
    >
      {drinks.map((drink) => (
        <DrinkCard
          key={drink.id}
          drink={drink}
          isSelected={selectedId === drink.id}
          isFavorite={favorites.includes(drink.id)}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </HorizontalRail>
  );
}

export function DrinkDetail({ drink, wiki, isFavorite, onToggleFavorite, onAddToParty, onGoToCosts, canAddToParty }) {
  if (!drink) return null;
  return (
    <article className="drink-detail">
      <header className="drink-detail__header">
        <div>
          <h3 className="drink-detail__title">
            <span aria-hidden="true">{drink.emoji}</span> {drink.name}
          </h3>
          <p className="drink-detail__subtitle">
            {drink.nameEn && drink.nameEn !== drink.name ? `También conocido como “${drink.nameEn}”. ` : ''}
            Se sirve en {drink.glass.toLocaleLowerCase('es')} · {drink.category} · {drink.alcoholic}
          </p>
        </div>
        <FavoriteButton active={isFavorite} onToggle={onToggleFavorite} name={drink.name} />
      </header>

      {drink.tags.length > 0 && (
        <ul className="tag-list">
          {drink.tags.map((tag) => <li key={tag} className="badge badge--muted">{tag}</li>)}
        </ul>
      )}

      <h4 className="subheading">Ingredientes</h4>
      <dl className="cost-list">
        {drink.ingredients.map((ingredient, index) => (
          <div className="result-row" key={`${ingredient.key}-${index}`}>
            <dt>{ingredient.name}</dt>
            <dd>{ingredient.measure}</dd>
          </div>
        ))}
      </dl>

      <h4 className="subheading">Preparación</h4>
      <p className="instructions">{drink.instructions || 'Esta bebida todavía no tiene preparación registrada.'}</p>
      {drink.instructionsAutomatic && (
        <p className="note">Pasos traducidos automáticamente desde el catálogo internacional.</p>
      )}

      {wiki?.extract && (
        <p className="wiki-extract">
          <span className="wiki-extract__title">Sobre {wiki.title}: </span>
          {wiki.extract}
          {wiki.url && (
            <>
              {' '}
              <a className="inline-link" href={wiki.url} target="_blank" rel="noreferrer">Ver en Wikipedia</a>
            </>
          )}
        </p>
      )}

      <div className="detail-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onAddToParty(drink)}
          disabled={!canAddToParty}
        >
          Añadir a la fiesta
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onGoToCosts(drink)}>
          Calcular costos
        </button>
      </div>
    </article>
  );
}

export function MatchList({ results, filter, onFilterChange, onSelect, onAddIngredient, selectedId, hasPantry }) {
  const filters = [
    { id: 'todos', label: 'Todas' },
    { id: 'listos', label: 'Listas para preparar' },
    { id: 'casi', label: 'Casi listas (1 o 2 faltantes)' },
  ];

  if (!hasPantry) {
    return (
      <p className="empty-state">
        Añade los ingredientes que tienes en casa y aquí verás qué bebidas puedes preparar.
      </p>
    );
  }

  if (!results.length) {
    return (
      <p className="empty-state">
        Ninguna bebida coincide todavía con tus ingredientes. Prueba añadir un destilado (tequila, ron, vodka),
        un refresco o un jugo.
      </p>
    );
  }

  return (
    <>
      <div className="filter-row" role="group" aria-label="Filtrar bebidas por disponibilidad">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip-filter ${filter === item.id ? 'is-active' : ''}`}
            aria-pressed={filter === item.id}
            onClick={() => onFilterChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="match-list">
        {results.map((result) => {
          const percent = Math.round(result.coverage * 100);
          return (
            <li className={`match-row ${result.canMake ? 'is-ready' : ''}`} key={result.drink.id}>
              <div className="match-row__head">
                <span className="drink-emoji" aria-hidden="true">{result.drink.emoji}</span>
                <div className="match-row__title">
                  <p className="match-row__name">{result.drink.name}</p>
                  <p className="match-row__meta">
                    {result.canMake
                      ? 'Lista con lo que tienes'
                      : `Tienes ${result.have.length} de ${result.drink.ingredients.length} ingredientes`}
                  </p>
                </div>
                <span className={`badge ${result.canMake ? 'badge--ready' : 'badge--muted'}`}>{percent}%</span>
              </div>

              <div className="meter" role="img" aria-label={`Coincidencia del ${percent} por ciento`}>
                <span style={{ width: `${percent}%` }} />
              </div>

              {result.drink.ingredients.length > 0 && (
                <p className="match-row__ingredients">
                  {result.drink.ingredients.map((ingredient) => (
                    <span
                      key={ingredient.key}
                      className={`pill ${
                        result.have.some((entry) => entry.ingredient.key === ingredient.key)
                        || (result.basics || []).some((entry) => entry.key === ingredient.key)
                          ? 'pill--have'
                          : 'pill--miss'
                      }`}
                    >
                      {ingredient.name}
                    </span>
                  ))}
                </p>
              )}

              {result.missing.length > 0 && (
                <div className="missing-block">
                  <p className="match-row__meta">Te falta:</p>
                  <div className="missing-chips">
                    {result.missing.map(({ ingredient }) => (
                      <button
                        key={ingredient.key}
                        type="button"
                        className="chip chip--add"
                        onClick={() => onAddIngredient(ingredient.name)}
                      >
                        <span aria-hidden="true">+</span> {ingredient.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="match-row__actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  aria-pressed={selectedId === result.drink.id}
                  onClick={() => onSelect(result.drink)}
                >
                  {selectedId === result.drink.id ? 'Elegida' : 'Usar esta bebida'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function CostBreakdown({ drink, lines, total, perDrink, people, drinksPerPerson, currency, margin, onMarginChange, onOpenPrices }) {
  if (!drink) return <p className="empty-state">Elige una bebida para ver sus costos.</p>;
  const sale = suggestedPrice(perDrink, margin);
  const partyDrinks = Math.max(1, people) * Math.max(1, drinksPerPerson);

  return (
    <>
      <h3 className="cost-recipe-title">{drink.emoji} {drink.name}</h3>
      <p className="card-description">
        Costo estimado por bebida con los precios de referencia de cada insumo.
      </p>

      <div className="cost-list" role="table" aria-label={`Costos de ${drink.name}`}>
        {lines.map((line) => (
          <div className="cost-row" role="row" key={line.key}>
            <div role="cell">
              <p className="cost-row__name">{line.name}</p>
              <p className="cost-row__meta">
                {line.scaledLabel} · {line.pack.label} {line.estimated ? '(precio estimado)' : ''}
              </p>
            </div>
            <p className="cost-row__cost" role="cell">{formatMoney(line.costPerDrink, currency)}</p>
          </div>
        ))}
      </div>

      <div className="total-row">
        <span>Total por bebida</span>
        <strong>{formatMoney(perDrink, currency)}</strong>
      </div>

      <div className="cost-grid">
        <div className="cost-stat">
          <p className="cost-stat__label">Para {people} {people === 1 ? 'persona' : 'personas'}</p>
          <p className="cost-stat__value">{formatMoney(perDrink * partyDrinks / Math.max(1, people), currency)}</p>
          <p className="cost-stat__meta">por persona ({partyDrinks} bebidas en total)</p>
        </div>
        <div className="cost-stat">
          <p className="cost-stat__label">Costo total de la tanda</p>
          <p className="cost-stat__value">{formatMoney(perDrink * partyDrinks, currency)}</p>
          <p className="cost-stat__meta">usando el número de personas de la pestaña Fiesta</p>
        </div>
      </div>

      <h4 className="subheading">Precio de venta sugerido</h4>
      <div className="margin-control">
        <label className="field-label" htmlFor="margin">Margen de ganancia: {margin}%</label>
        <input
          id="margin"
          className="range"
          type="range"
          min="0"
          max="300"
          step="5"
          value={margin}
          onChange={(event) => onMarginChange(Number(event.target.value))}
        />
      </div>
      <div className="cost-grid">
        <div className="cost-stat">
          <p className="cost-stat__label">Precio sugerido por bebida</p>
          <p className="cost-stat__value cost-stat__value--accent">{formatMoney(sale.price, currency)}</p>
          <p className="cost-stat__meta">ganancia {formatMoney(sale.profit, currency)} por bebida</p>
        </div>
        <div className="cost-stat">
          <p className="cost-stat__label">Ganancia de la tanda</p>
          <p className="cost-stat__value">{formatMoney(sale.profit * partyDrinks, currency)}</p>
          <p className="cost-stat__meta">{formatMoney(sale.price * partyDrinks, currency)} de venta total</p>
        </div>
      </div>

      <button type="button" className="btn btn-secondary" onClick={onOpenPrices}>
        Editar precios de los insumos
      </button>
    </>
  );
}

export function PriceEditor({ usedKeys, prices, currency, onChangePrice, onResetPrice, onResetAll }) {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const catalog = useMemo(() => {
    const used = usedKeys.map((key) => ({ key, ...getIngredient(key) }));
    if (!showAll) return used;
    const term = query.trim().toLocaleLowerCase('es');
    return Object.entries(INGREDIENTS)
      .map(([key, value]) => ({ key, ...value }))
      .filter((item) => !term || item.es.toLocaleLowerCase('es').includes(term))
      .slice(0, 60);
  }, [usedKeys, showAll, query]);

  return (
    <div className="price-editor">
      <div className="price-editor__head">
        <div>
          <h4 className="subheading">Precios de los insumos</h4>
          <p className="note">
            Ajusta el precio y el tamaño de la presentación que compras. Se guardan en este dispositivo.
          </p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onResetAll}>
          Restablecer todo
        </button>
      </div>

      <div className="price-editor__tools">
        <label className="field-label" htmlFor="price-search">Buscar insumo</label>
        <input
          id="price-search"
          className="input"
          type="search"
          value={query}
          placeholder="Tequila, cerveza, hielo…"
          onChange={(event) => {
            setQuery(event.target.value);
            setShowAll(true);
          }}
          onFocus={() => setShowAll(true)}
        />
        {showAll && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowAll(false); setQuery(''); }}>
            Ver solo los insumos de esta bebida
          </button>
        )}
      </div>

      <ul className="price-list">
        {catalog.map((item) => {
          const pack = packOf(item.key, prices);
          const edited = priceIsEdited(item.key, prices);
          return (
            <li className="price-row" key={item.key}>
              <div className="price-row__info">
                <p className="price-row__name">
                  {item.es} {edited && <span className="badge badge--muted">editado</span>}
                </p>
                <p className="price-row__meta">
                  {formatMoney(pack.price, currency)} por {pack.label}
                </p>
              </div>
              <div className="price-row__inputs">
                <label className="field-group">
                  <span className="field-label">Tamaño</span>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    step="1"
                    value={pack.size}
                    onChange={(event) => onChangePrice(item.key, { size: Number(event.target.value), price: pack.price, label: pack.label })}
                  />
                </label>
                <label className="field-group">
                  <span className="field-label">Precio</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    value={pack.price}
                    onChange={(event) => onChangePrice(item.key, { size: pack.size, price: Number(event.target.value), label: pack.label })}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onResetPrice(item.key)}
                  disabled={!edited}
                >
                  Restablecer
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ShoppingList({ plan, currency }) {
  if (!plan.items.length) {
    return (
      <p className="empty-state">
        Añade bebidas al menú de la fiesta para ver los insumos y el costo total.
      </p>
    );
  }
  return (
    <>
      <div className="total-row">
        <span>Insumos para {plan.drinksTotal} bebidas ({plan.people} {plan.people === 1 ? 'persona' : 'personas'})</span>
        <strong>{formatMoney(plan.total, currency)}</strong>
      </div>
      <div className="cost-grid">
        <div className="cost-stat">
          <p className="cost-stat__label">Costo por persona</p>
          <p className="cost-stat__value">{formatMoney(plan.perPerson, currency)}</p>
        </div>
        <div className="cost-stat">
          <p className="cost-stat__label">Costo por bebida</p>
          <p className="cost-stat__value">{formatMoney(plan.perDrink, currency)}</p>
        </div>
        <div className="cost-stat">
          <p className="cost-stat__label">Hielo recomendado</p>
          <p className="cost-stat__value">{plan.iceKg} kg</p>
          <p className="cost-stat__meta">35% de hielo por bebida</p>
        </div>
      </div>

      <ul className="shopping-list">
        {plan.shopping.map((item) => (
          <li className="shopping-row" key={item.key}>
            <div>
              <p className="shopping-row__name">{item.name}</p>
              <p className="shopping-row__meta">
                {item.amountLabel}
                {item.packs ? ` · ≈ ${item.packs.roundedPacks} × ${item.packs.label}` : ''}
              </p>
              <p className="shopping-row__meta">Para: {item.usedBy.join(', ')}</p>
            </div>
            <p className="shopping-row__cost">{formatMoney(item.cost, currency)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ShareCard({ title, text }) {
  const [copied, setCopied] = useState('');
  return (
    <div className="share-card">
      <div className="share-card__text">
        <p className="field-label">Compartir {title}</p>
        <textarea className="input share-card__area" readOnly rows="6" value={text} aria-label={`Resumen de ${title}`} />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied('Resumen copiado al portapapeles.');
            } catch {
              setCopied('No se pudo copiar automáticamente; selecciona el texto y cópialo.');
            }
          }}
        >
          Copiar resumen
        </button>
        {copied && <p className="note" role="status">{copied}</p>}
      </div>
      <div className="share-card__qr">
        <QRCodeSVG value={text.slice(0, 900)} size={148} bgColor="#ffffff" fgColor="#1a1a2e" level="L" />
        <p className="note">Escanea con el celular para llevar la lista.</p>
      </div>
    </div>
  );
}
