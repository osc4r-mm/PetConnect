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
  // Ajuste para razas filtradas
  const filteredBreeds = filters.species_id
    ? breedList.filter(b => b.species_id === Number(filters.species_id))
    : breedList;

  // Configuración de campos
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
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 z-10">
      {/* Buscador y toggle + limpiar */}
      <div className="flex items-center mb-4 gap-2 min-w-0">
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={onFilterChange}
          placeholder="Buscar por nombre..."
          className="flex-grow min-w-0 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          onClick={onToggleFilters}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md flex items-center"
        >
          Filtros {showFilters ? <ChevronUp /> : <ChevronDown />}
        </button>
        <button
          onClick={onClearFilters}
          title="Limpiar filtros"
          className="ml-1 p-2 rounded-full bg-gray-200 hover:bg-blue-100 text-blue-700 transition flex items-center justify-center"
          type="button"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Sección de filtros */}
      <div className={`mt-2 overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[calc(100vh-200px)] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {fieldConfigs.map((cfg, i) => {
            if (cfg.type === 'text') return null;
            if (cfg.type === 'range') {
              return (
                <div key={i} className={`col-span-${cfg.colspan}`}>
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-gray-700">{cfg.label}</label>
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
                          className="w-1/2 border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        {idx === 0 && <span className="text-gray-500">&lt;</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            }
            if (cfg.type === 'toggles') {
              return (
                <div key={i} className="col-span-2 flex justify-around">
                  {/* Adopción */}
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adopción</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuidado</label>
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
            // Selects
            return (
              <div key={i} className={`col-span-1 md:col-span-${cfg.colspan}`}>  
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700">{cfg.label}</label>
                  {renderSortButton(cfg.sortKey, cfg.label)}
                </div>
                <select
                  name={cfg.name}
                  value={filters[cfg.name]}
                  onChange={onFilterChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-1.5 focus:ring-2 focus:ring-blue-500 transition-all"
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