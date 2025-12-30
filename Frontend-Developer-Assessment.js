import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [cart, setCart] = useState(() => {
    // Initialize from localStorage safely
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://api.example.com/products`, {
        params: { filter }
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Product loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300); // Debounce API calls
    
    return () => clearTimeout(timer);
  }, [filter, loadProducts]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const newCart = [...prevCart, product];
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]);

  return (
    <div className="product-list">
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="search-input"
      />
      
      {error && <div className="error-message" role="alert">{error}</div>}
      {loading && <div className="loading">Loading...</div>}
      
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <img 
              src={product.image} 
              alt={product.name}
              className="product-image"
            />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button 
              onClick={() => addToCart(product)}
              className="add-to-cart-btn"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        Cart: {cart.length} items
      </div>
    </div>
  );
}

export default ProductList;