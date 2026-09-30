// Recetas locales de referencia para ampliar el catálogo sin depender de otra API.
const make = (id, name, ingredients, instructions, category='Cocktail', glass='Highball glass', tags=[]) => {
  const d = { idDrink:id, strDrink:name, strAlcoholic:'Alcoholic', strCategory:category, strGlass:glass, strInstructions:instructions, strDrinkThumb:'', strTags:tags.join(', ') };
  ingredients.forEach(([name, measure], i) => { d[`strIngredient${i+1}`]=name; d[`strMeasure${i+1}`]=measure; });
  return d;
};

export const LOCAL_COCKTAILS = [
  make('mx-michelada','Michelada',[['Beer','355 ml'],['Lime juice','30 ml'],['Clamato','60 ml'],['Worcestershire sauce','5 ml'],['Hot sauce','5 ml'],['Salt','1 pizca']],'Escarcha el vaso con limón y sal. Agrega hielo, jugo de limón, Clamato, salsas y sal. Completa con cerveza fría y mezcla suavemente.','Beer','Pint glass',['México','Cerveza']),
  make('mx-chelada','Chelada',[['Beer','355 ml'],['Lime juice','30 ml'],['Salt','1 pizca']],'Escarcha el vaso con limón y sal. Agrega hielo y jugo de limón. Completa con cerveza fría y sirve.','Beer','Pint glass',['México','Cerveza']),
  make('mx-ojo-rojo','Ojo Rojo',[['Beer','355 ml'],['Tomato juice','90 ml'],['Lime juice','30 ml'],['Worcestershire sauce','5 ml'],['Hot sauce','5 ml'],['Salt','1 pizca'],['Black pepper','1 pizca']],'Agrega hielo, jugo de tomate, limón, salsas, sal y pimienta. Completa con cerveza fría y mezcla suavemente.','Beer','Pint glass',['México','Cerveza']),
  make('mx-chavela','Chavela',[['Beer','355 ml'],['Clamato','90 ml'],['Lime juice','30 ml'],['Worcestershire sauce','5 ml'],['Hot sauce','5 ml'],['Salt','1 pizca']],'Escarcha el vaso. Mezcla hielo, Clamato, limón y salsas. Completa con cerveza y sirve.','Beer','Pint glass',['México','Cerveza']),
  make('mx-michelada-inglesa','Michelada Inglesa',[['Beer','355 ml'],['Lime juice','30 ml'],['Worcestershire sauce','10 ml'],['Hot sauce','5 ml'],['Salt','1 pizca'],['Black pepper','1 pizca']],'Escarcha el vaso. Añade hielo, limón, salsa inglesa, salsa picante, sal y pimienta. Completa con cerveza.','Beer','Pint glass',['México','Cerveza']),
  make('mx-michelada-tamarindo','Michelada de Tamarindo',[['Beer','355 ml'],['Tamarind syrup','30 ml'],['Lime juice','20 ml'],['Hot sauce','5 ml'],['Salt','1 pizca']],'Escarcha con sal y chile. Añade hielo, jarabe de tamarindo, limón y salsa picante. Completa con cerveza.','Beer','Pint glass',['México','Cerveza']),
  make('mx-paloma','Paloma',[['Tequila','50 ml'],['Grapefruit soda','120 ml'],['Lime juice','15 ml'],['Salt','1 pizca']],'Escarcha el vaso con sal. Agrega hielo, tequila y limón. Completa con refresco de toronja y mezcla suavemente.','Cocktail','Highball glass',['México']),
  make('mx-vampiro','Vampiro',[['Tequila','45 ml'],['Grapefruit soda','60 ml'],['Tomato juice','60 ml'],['Orange juice','30 ml'],['Lime juice','20 ml'],['Hot sauce','5 ml'],['Salt','1 pizca']],'Escarcha el vaso. Mezcla los ingredientes con hielo y completa con refresco de toronja.','Cocktail','Highball glass',['México']),
  make('mx-charro-negro','Charro Negro',[['Tequila','50 ml'],['Coca-Cola','120 ml'],['Lime juice','15 ml'],['Salt','1 pizca']],'Escarcha con sal. Añade hielo, tequila y limón. Completa con cola.','Cocktail','Highball glass',['México']),
  make('mx-batanga','Batanga',[['Tequila','50 ml'],['Coca-Cola','120 ml'],['Lime juice','20 ml'],['Salt','1 pizca']],'Escarcha con sal. Agrega hielo, tequila y limón. Completa con cola.','Cocktail','Highball glass',['México']),
  make('mx-cantarito','Cantarito',[['Tequila','45 ml'],['Grapefruit soda','90 ml'],['Orange juice','45 ml'],['Lime juice','20 ml'],['Grapefruit juice','30 ml'],['Salt','1 pizca']],'Escarcha el cantarito. Agrega hielo, tequila y cítricos. Completa con refresco de toronja.','Cocktail','Highball glass',['México']),
  make('mx-cantarito-cerveza','Cantarito con Cerveza',[['Tequila','40 ml'],['Beer','180 ml'],['Grapefruit soda','60 ml'],['Orange juice','30 ml'],['Lime juice','20 ml'],['Salt','1 pizca']],'Escarcha el vaso. Añade hielo, tequila y jugos. Completa con cerveza y refresco de toronja.','Beer','Pint glass',['México','Cerveza']),
  make('mx-tequila-beer','Tequila Beer',[['Tequila','30 ml'],['Beer','330 ml'],['Lime juice','15 ml'],['Salt','1 pizca']],'Escarcha el vaso con sal. Añade hielo, tequila y limón. Completa con cerveza fría.','Beer','Pint glass',['México','Cerveza']),
  make('mx-beer-margarita','Margarita con Cerveza',[['Tequila','30 ml'],['Triple sec','20 ml'],['Lime juice','30 ml'],['Beer','180 ml'],['Salt','1 pizca']],'Escarcha el vaso. Agrega hielo, tequila, triple sec y limón. Completa con cerveza.','Beer','Pint glass',['México','Cerveza']),
  make('beer-shandy','Shandy',[['Beer','180 ml'],['Lemon-lime soda','180 ml'],['Lime juice','15 ml']],'Sirve la cerveza fría y completa con refresco de limón-lima.','Beer','Pint glass',['Cerveza']),
  make('beer-radler','Radler de Limón',[['Beer','180 ml'],['Lemon-lime soda','180 ml'],['Lemon juice','15 ml']],'Combina cerveza fría con refresco de limón-lima.','Beer','Pint glass',['Cerveza']),
  make('beer-black-tan','Black & Tan',[['Beer','180 ml'],['Stout beer','180 ml']],'Sirve primero la cerveza clara. Vierte la stout sobre una cuchara.','Beer','Pint glass',['Cerveza']),
  make('beer-red-eye','Red Eye',[['Beer','330 ml'],['Tomato juice','120 ml'],['Lime juice','15 ml']],'Sirve cerveza fría y añade jugo de tomate y limón.','Beer','Pint glass',['Cerveza']),
  make('beer-michelada-mango','Michelada de Mango',[['Beer','355 ml'],['Mango juice','60 ml'],['Lime juice','20 ml'],['Hot sauce','5 ml'],['Salt','1 pizca']],'Escarcha el vaso. Agrega hielo, mango, limón y salsa picante. Completa con cerveza.','Beer','Pint glass',['México','Cerveza'])
];
export default LOCAL_COCKTAILS;
