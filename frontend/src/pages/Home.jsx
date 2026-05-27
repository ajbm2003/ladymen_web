import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "../components/ProductCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { fetchJSON } from "../utils/api.js";

const Home = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const debouncedSearch = useDebounce(search, 300);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchJSON("/api/categories")
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (minPrice) params.set("minPrice", String(minPrice));
    if (maxPrice) params.set("maxPrice", String(maxPrice));
    return params.toString();
  }, [category, debouncedSearch, minPrice, maxPrice]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", queryString],
    queryFn: () => fetchJSON(`/api/products?${queryString}`)
  });

  const featuredCards = useMemo(() => {
    const defaults = [
      {
        tone: "camo",
        tag: "Tacticos",
        title: "Proteccion con estilo",
        text: "Equipamiento tactico para Fuerza armada terrestre, aerea y naval, escoltas profesionales, seguridad privada y policia",
        cta: "Ver tacticos",
        categorySlug: "tacticos",
        imagePath: "/imagenes/tacticos.png"
      },
      {
        tone: "teal",
        tag: "Paramedicos",
        title: "Listas para la accion",
        text: "Herramientas y kits que responden cuando importa.",
        cta: "Ver paramedicos",
        categorySlug: "paramedicos",
        imagePath: "/imagenes/paramedicos.png"
      },
      {
        tone: "rose",
        tag: "Bisuteria americana",
        title: "Brillo que marca",
        text: "Piezas modernas para elevar cada look.",
        cta: "Ver bisuteria",
        categorySlug: "bisuteria-americana",
        imagePath: "/imagenes/bisuteria.png"
      },
      {
        tone: "green",
        tag: "Motos",
        title: "Ruta con actitud",
        text: "Accesorios y estilo urbano para la carretera.",
        cta: "Ver motos",
        categorySlug: "motos",
        imagePath: "/imagenes/motos.png"
      },
      {
        tone: "dark",
        tag: "Boutique",
        title: "Elegancia diaria",
        text: "Detalles finos que convierten lo simple en especial.",
        cta: "Ver boutique",
        categorySlug: "boutique",
        imagePath: "/imagenes/boutique.png"
      }
    ];

    return defaults.map((item, index) => {
      const image = item.imagePath || "";

      return {
        ...item,
        image
      };
    });
  }, [products]);

  const featuredCategories = categories.slice(0, 6);
  const carouselButtons = [
    { label: "Tacticos", slug: "tacticos" },
    { label: "Paramedicos", slug: "paramedicos" },
    { label: "Bisuteria Americana", slug: "bisuteria-americana" },
    { label: "Motos", slug: "motos" },
    { label: "Boutique", slug: "boutique" }
  ];

  const carouselIndexBySlug = useMemo(() => {
    return featuredCards.reduce((acc, item, index) => {
      acc[item.categorySlug] = index;
      return acc;
    }, {});
  }, [featuredCards]);

  useEffect(() => {
    if (!featuredCards.length) return undefined;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredCards.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredCards.length]);

  const goToSlide = (index) => {
    if (!featuredCards.length) return;
    const total = featuredCards.length;
    const next = (index + total) % total;
    setActiveSlide(next);
  };

  const handleCarouselCategory = (slug) => {
    setCategory(slug);
    const index = carouselIndexBySlug[slug];
    if (typeof index === "number") {
      setActiveSlide(index);
    }
  };

  const activeTone = useMemo(() => {
    if (!category) return "";
    const match = featuredCards.find((item) => item.categorySlug === category);
    return match?.tone || "";
  }, [category, featuredCards]);

  return (
    <div className={`lm-page ${activeTone ? `lm-bar-${activeTone}` : ""}`}>
      
      <header className="lm-header">
        <div className="lm-header-decor" aria-hidden="true" />
        <div className="lm-header-inner">
          <div className="lm-brand">
            <div className="lm-logo-mark">
              <img src="/logo.png" alt="LadyMen" />
            </div>
          </div>
        </div>
      </header>

      <main className="lm-main">
        <section className="lm-hero">
          <div className="lm-hero-badge">
            <span className="lm-badge-dot" /> Envios rapidos · <span>Atencion personalizada</span>
          </div>
          <p className="lm-hero-title">Catalogo digital</p>
          <h1 className="lm-hero-heading">
            Una vitrina para <em>todo</em>
            <br />
            público.
          </h1>
          <p className="lm-hero-subtitle">
            Descubre nuestra coleccion exclusiva de productos boutique y equipamiento tactico.
          </p>

        </section>

        <section className="lm-carousel">
          <div className="lm-carousel-window">
            {featuredCards.map((card, index) => (
              <button
                key={`${card.title}-${index}`}
                type="button"
                onClick={() => handleCarouselCategory(card.categorySlug)}
                className={`lm-carousel-slide tone-${card.tone} ${
                  index === activeSlide ? "is-active" : ""
                }`}
                aria-hidden={index !== activeSlide}
                tabIndex={index === activeSlide ? 0 : -1}
              >
                <div className="lm-carousel-content">
                  <div className="lm-featured-tag">{card.tag}</div>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                  <span className="lm-featured-cta">{card.cta}</span>
                </div>
                {card.image && (
                  <div className="lm-carousel-image">
                    <img src={card.image} alt={card.title} loading="lazy" />
                  </div>
                )}
              </button>
            ))}
            <div className="lm-carousel-nav">
              <button
                type="button"
                className="lm-carousel-arrow"
                onClick={() => goToSlide(activeSlide - 1)}
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                type="button"
                className="lm-carousel-arrow"
                onClick={() => goToSlide(activeSlide + 1)}
                aria-label="Siguiente"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <section className="lm-filter">
          <button
            type="button"
            className="lm-filter-toggle"
            onClick={() => setFiltersOpen((prev) => !prev)}
            aria-expanded={filtersOpen}
            aria-controls="mobile-filters"
          >
            <span>Filtros</span>
            <span className="lm-filter-toggle-icon">{filtersOpen ? "-" : "+"}</span>
          </button>
          <div
            id="mobile-filters"
            className={`lm-filter-card ${filtersOpen ? "is-open" : ""}`}
          >
            <div className="lm-filter-group">
              <label>Buscar</label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="text"
                placeholder="Buscar por nombre"
              />
            </div>
            <div className="lm-filter-group">
              <label>Categoria</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Todas</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-filter-group">
              <label>Rango de precio</label>
              <div className="lm-range">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={minPrice}
                  onChange={(event) => setMinPrice(Number(event.target.value))}
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                />
                <div className="lm-range-values">
                  <span>${minPrice}</span>
                  <span>${maxPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lm-categories">
          <div className="lm-section-title">
            <h2>Categorias destacadas</h2>
            <span>Explorar</span>
          </div>
          <div className="lm-category-grid">
            {featuredCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.slug)}
                className="lm-category-card"
              >
                <div className="lm-category-icon">✦</div>
                <div>
                  <p>{item.name}</p>
                  <span>Ver mas</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="lm-products">
          <div className="lm-products-header">
            <h2>Productos</h2>
            <span>{products.length} productos</span>
          </div>
          <div className="lm-products-grid">
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      </main>

      <footer className="lm-footer">
        <div className="lm-footer-inner">
          <div className="lm-footer-brand">
            <span className="lm-brand-name">LadyMen</span>
            <span className="lm-brand-author">Andres Merchan</span>
            <p>
              Tu destino para productos boutique, motos y equipamiento tctico.
            </p>
          </div>
          <div className="lm-footer-columns">
            <div>
              <h4>Tienda</h4>
              <div className="lm-footer-filters">
                {carouselButtons.map((button) => (
                  <button
                    key={button.slug}
                    type="button"
                    onClick={() => handleCarouselCategory(button.slug)}
                    className={`lm-carousel-btn ${
                      category === button.slug ? "active" : ""
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4>Ayuda</h4>
              <ul>
                <li>Preguntas frecuentes</li>
                <li>Envios y devoluciones</li>
                <li>Contacto</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="lm-footer-bottom">
          <span>© 2026 LadyMen by Andres Merchan. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
