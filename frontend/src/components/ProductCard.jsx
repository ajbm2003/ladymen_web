import { Link } from "react-router-dom";

const optimizeImageUrl = (url) => {
  if (!url) return "";
  const hasQuery = url.includes("?");
  const suffix = "w=400&h=400&fit=crop&auto=format";
  return hasQuery ? `${url}&${suffix}` : `${url}?${suffix}`;
};

const ProductCard = ({ product }) => {
  const imageUrl = product.images?.[0]?.url;

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="lm-product-card"
    >
      <div className="lm-product-image">
        {imageUrl ? (
          <img
            src={optimizeImageUrl(imageUrl)}
            alt={product.name}
            className="lm-product-img"
            loading="lazy"
          />
        ) : (
          <div className="lm-product-empty">
            Sin imagen
          </div>
        )}
      </div>
      <div className="lm-product-info">
        <span className="lm-product-cat">
          {product.category?.name || "Categoria"}
        </span>
        <h3 className="lm-product-name">{product.name}</h3>
        <div className="lm-product-price">
          <span>${product.price}</span>
          <span className="lm-product-action">Ver detalle</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
