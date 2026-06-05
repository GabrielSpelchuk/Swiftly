const { Op } = require('sequelize');

const REPLACEMENTS = [
  ['щ', 'shch'], ['ш', 'sh'], ['ч', 'ch'], ['х', 'kh'], ['ц', 'ts'],
  ['є', 'ye'], ['ї', 'yi'], ['ю', 'yu'], ['я', 'ya'], ['ж', 'zh'],
  ['ґ', 'g'], ['ё', 'yo'],
  ['а', 'a'], ['б', 'b'], ['в', 'v'], ['г', 'h'], ['д', 'd'],
  ['е', 'e'], ['з', 'z'], ['и', 'y'], ['і', 'i'], ['й', 'y'],
  ['к', 'k'], ['л', 'l'], ['м', 'm'], ['н', 'n'], ['о', 'o'],
  ['п', 'p'], ['р', 'r'], ['с', 's'], ['т', 't'], ['у', 'u'],
  ['ф', 'f'], ['ь', ''], ['ъ', ''], ['ы', 'y'], ['э', 'e'],
];

function slugify(text) {
  if (!text?.trim()) return '';

  let value = text.trim().toLowerCase();
  for (const [from, to] of REPLACEMENTS) {
    value = value.split(from).join(to);
  }

  return value
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueCategorySlug(Category, name, excludeId = null) {
  let base = slugify(name);
  if (!base) base = 'category';

  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const where = { slug: candidate };
    if (excludeId) where.id = { [Op.ne]: excludeId };

    const existing = await Category.findOne({ where });
    if (!existing) return candidate;

    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

module.exports = { slugify, uniqueCategorySlug };
