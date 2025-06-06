import React from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

export default function FilterSection({
  showFilters,
  onToggleFilters,
  filters,
  onFilterChange,
  renderSortButton,
  metaLists: { genderList, speciesList, breedList, sizeList, activityList, noiseList },
  onClearFilters,
}) {
  // filteredBreeds: Filtra la lista de razas según la especie seleccionada en los filtros.
  const filteredBreeds = filters.species_id
    ? breedList.filter(b => b.species_id === Number(filters.species_id))
    : breedList;

  // fieldConfigs: Configuración declarativa de los campos de filtro y sus opciones.
  const fieldConfigs = [
    { type: 'text', name: 'name', label: 'Buscar por nombre', colspan: 6 },
    { type: 'range', label: 'Edad (años)', sortKey: 'age', colspan: 2, fields: [ { name: 'age_min', placeholder: 'Min', min: 0, max: 20 }, { name: 'age_max', placeholder: 'Max', min: 0, max: 20 } ] },
    { type: 'range', label: 'Peso (kg)', sortKey: 'weight', colspan: 2, fields: [ { name: 'weight_min', placeholder: 'Min', min: 0, max: 100 }, { name: 'weight_max', placeholder: 'Max', min: 0, max: 100 } ] },
    { type: 'toggles', label: '', colspan: 2 },
    { type: 'select', name: 'gender_id', label: 'Género', sortKey: 'gender_id', colspan: 2, options: genderList.map(g => ({ value: g.id, label: g.name })) },
    { type: 'select', name: 'species_id', label: 'Especie', sortKey: 'species_id', colspan: 2, options: speciesList.map(s => ({ value: s.id, label: s.name })) },
    { type: 'select', name: 'breed_id', label: 'Raza', sortKey: 'breed_id', colspan: 2, options: filteredBreeds.map(b => ({ value: b.id, label: b.name })) },
    { type: 'select', name: 'size_id', label: 'Tamaño', sortKey: 'size_id', colspan: 2, options: sizeList.map(s => ({ value: s.id, label: s.name })) },
    { type: 'select', name: 'activity_level_id', label: 'Actividad', sortKey: 'activity_level_id', colspan: 2, options: activityList.map(a => ({ value: a.id, label: a.name })) },
    { type: 'select', name: 'noise_level_id', label: 'Ruido', sortKey: 'noise_level_id', colspan: 2, options: noiseList.map(n => ({ value: n.id, label: n.name })) }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg mb-8 z-10 border-2 border-green-100">
      {/* Buscador y toggle + limpiar */}
      <div className="flex items-center mb-4 gap-2 min-w-0">
        {/* Campo de texto para búsqueda directa por nombre */}
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={onFilterChange}
          placeholder="Buscar por nombre..."
          className="flex-grow min-w-0 border border-green-200 rounded-xl p-2 focus:ring-2 focus:ring-green-500 transition-all bg-green-50"
        />
        {/* Botón para mostrar/ocultar filtros avanzados */}
        <button
          onClick={onToggleFilters}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl flex items-center font-bold shadow"
        >
          Filtros {showFilters ? <ChevronUp /> : <ChevronDown />}
        </button>
        {/* Botón para limpiar todos los filtros */}
        <button
          onClick={onClearFilters}
          title="Limpiar filtros"
          className="ml-1 p-2 rounded-full bg-green-100 hover:bg-blue-100 text-green-700 hover:text-blue-700 transition flex items-center justify-center shadow"
          type="button"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Sección de filtros avanzados, visible sólo si showFilters es true */}
      <div className={`mt-2 overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[calc(100vh-200px)] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {fieldConfigs.map((cfg, i) => {
            if (cfg.type === 'text') return null;
            if (cfg.type === 'range') {
              // Campos de rango (edad, peso)
              return (
                <div key={i} className={`col-span-${cfg.colspan}`}>
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-green-700">{cfg.label}</label>
                    {renderSortButton(cfg.sortKey, cfg.label)}
                  </div>
                  <div className="flex items-center space-x-2 mt-1 min-w-0">
                    {cfg.fields.map((f, idx) => (
                      <React.Fragment key={f.name}>
                        <input
                          type="number"
                          name={f.name}
                          min={f.min}
                          max={f.max}
                          value={filters[f.name]}
                          onChange={onFilterChange}
                          placeholder={f.placeholder}
                          className="w-1/2 border border-green-200 rounded-md p-1 focus:ring-2 focus:ring-green-400 transition-all bg-green-50"
                        />
                        {idx === 0 && <span className="text-green-300">&lt;</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            }
            if (cfg.type === 'toggles') {
              // Campos toggle para adopción/cuidado
              return (
                <div key={i} className="col-span-2 flex justify-around">
                  {/* Adopción */}
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-green-700 mb-1">Adopción</label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="for_adoption"
                        checked={filters.for_adoption}
                        onChange={onFilterChange}
                        className="hidden"
                      />
                      <span className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${filters.for_adoption ? 'bg-red-500' : 'bg-gray-300'}`}>
                        <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${filters.for_adoption ? 'translate-x-6' : ''}`} />
                      </span>
                    </label>
                  </div>
                  {/* Cuidado */}
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-green-700 mb-1">Cuidado</label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="for_sitting"
                        checked={filters.for_sitting}
                        onChange={onFilterChange}
                        className="hidden"
                      />
                      <span className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${filters.for_sitting ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out ${filters.for_sitting ? 'translate-x-6' : ''}`} />
                      </span>
                    </label>
                  </div>
                </div>
              );
            }
            // Campos select (género, especie, raza, tamaño, actividad, ruido)
            return (
              <div key={i} className={`col-span-1 md:col-span-${cfg.colspan}`}>  
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-green-700">{cfg.label}</label>
                  {renderSortButton(cfg.sortKey, cfg.label)}
                </div>
                <select
                  name={cfg.name}
                  value={filters[cfg.name]}
                  onChange={onFilterChange}
                  className="mt-1 block w-full border border-green-200 rounded-md p-1.5 focus:ring-2 focus:ring-green-400 transition-all bg-green-50"
                >
                  <option value="">Todos</option>
                  {cfg.options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}