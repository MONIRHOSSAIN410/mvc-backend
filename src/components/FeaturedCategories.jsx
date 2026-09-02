import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CATEGORIES } from "../data/catalog.js";
import { fetchCategories } from "../redux/slices/productSlice.js";
import SectionHeader from "./SectionHeader.jsx";
import InfiniteMarquee from "./InfiniteMarquee.jsx";

/**
 * "Shop by Category" as a nonstop carousel.
 *
 * Categories come from the API and fall back to the bundled list, so the strip
 * grows by itself when a new category is added to the database.
 */
export default function FeaturedCategories() {
  const dispatch = useDispatch();
  const fromApi = useSelector((s) => s.products.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const categories = useMemo(() => {
    const list = fromApi?.length ? fromApi : CATEGORIES;
    // Match every API category with its picture from the bundled catalogue.
    return list.map((c) => ({
      ...c,
      image: c.image || CATEGORIES.find((x) => x.slug === c.slug)?.image,
      icon: c.icon || CATEGORIES.find((x) => x.slug === c.slug)?.icon || "",
    }));
  }, [fromApi]);

  if (!categories.length) return null;

  return (
    <section className="mt-10">
      <div className="container-app">
        <SectionHeader
          title="Shop by Category"
          subtitle="Find what you need, faster"
          viewAllTo="/shop"
        />
      </div>

      {/* Keeps running even while the pointer is over it. */}
      <InfiniteMarquee className="px-4 sm:px-6 lg:px-8" pauseOnHover={false}>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/category/${c.slug}`}
            className="zoom-img group relative block h-32 w-44 shrink-0 overflow-hidden
                       rounded-xl shadow-card transition-shadow hover:shadow-lift
                       sm:h-40 sm:w-56"
          >
            <img
              src={c.image}
              alt={c.name}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <p className="text-sm font-semibold drop-shadow">
                {c.icon} {c.name}
              </p>
              <p className="text-[11px] text-white/80">
                {c.productCount ? `${c.productCount} items · ` : ""}Shop now →
              </p>
            </div>
          </Link>
        ))}
      </InfiniteMarquee>
    </section>
  );
}
