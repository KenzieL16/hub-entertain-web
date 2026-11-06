import { useEffect, useState } from 'react';
import { api } from '../lib/api';

let cache = null; // kategori jarang berubah, cukup diambil sekali per sesi

export function useCategories() {
  const [categories, setCategories] = useState(cache || []);

  useEffect(() => {
    if (cache) return;
    api.get('/categories')
      .then((d) => {
        cache = d.categories;
        setCategories(cache);
      })
      .catch(() => {});
  }, []);

  return categories;
}
