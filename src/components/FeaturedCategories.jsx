import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CATEGORIES } from "../data/catalog.js";
import { fetchCategories } from "../redux/slices/productSlice.js";
import SectionHeader from "./SectionHeader.jsx";
import InfiniteMarquee from "./InfiniteMarquee.jsx";

export default function FeaturedCategories() {
  const dispatch = useDispatch();
  const fromApi = useSelector((s) => s.products.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const categories = useMemo(() => {
    const list = fromApi?.length ? fromApi : CATEGORIES;
    return list.map((c) => ({
      ...c,
      image: c.image || CATEGORIES.find((x) => x.slug === c.slug)?.image,
      icon: c.icon || CATEGORIES.find((x) => x.slug === c.slug)?.icon || "",
    }));
  }, [fromApi]);

  if (!categories.length) return null;

  return (
    <section className="my-12">
      <div className="container-app mb-6">
        <SectionHeader
          title="Shop by Category"
          subtitle="Find what you need, faster"
          viewAllTo="/shop"
        />
      </div>

      {/* Non-stop carousel that never pauses */}
      <InfiniteMarquee speed={30} pauseOnHover={false}>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/category/${c.slug}`}
            className="group relative block h-36 w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:h-44 sm:w-60"
          >
            {/* Image with smooth zoom effect */}
            <img
              src={c.image}
              alt={c.name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-white drop-shadow-sm">
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-300">
                <span>{c.productCount ? `${c.productCount} items` : "Explore"}</span>
                <span className="font-medium text-brand-300 transition-transform duration-300 group-hover:translate-x-1">
                  Shop now →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </InfiniteMarquee>
    </section>
  );
}