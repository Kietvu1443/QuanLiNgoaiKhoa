import React from 'react';

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <section className="mb-8 overflow-x-auto no-scrollbar flex gap-3 -mx-6 px-6">
      {categories.map((cat) => (
        <button
          type="button"
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-5 py-2.5 rounded-full font-label text-sm whitespace-nowrap transition-colors ${
            selectedCategory === cat
              ? 'bg-primary text-white'
              : 'bg-secondary-fixed-dim text-on-secondary-fixed-variant hover:bg-teal-50/50'
          }`}
        >
          {cat}
        </button>
      ))}
    </section>
  );
}
