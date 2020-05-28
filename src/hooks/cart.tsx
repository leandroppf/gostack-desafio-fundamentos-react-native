import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const addedProduct = products.filter(el => el.id === product.id);
      const newProduct = product;

      if (addedProduct.length) {
        const currentQuantity = addedProduct[0].quantity;
        const productsAux = products.filter(el => el.id !== product.id);

        newProduct.quantity = currentQuantity + 1;
        productsAux.push(newProduct);
        setProducts(productsAux);
      } else {
        newProduct.quantity = 1;
        setProducts([...products, newProduct]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productToIncrement = products.filter(el => el.id === id)[0];

      const currentQuantity = productToIncrement.quantity;
      const productsAux = products.filter(el => el.id !== id);

      productToIncrement.quantity = currentQuantity + 1;
      productsAux.push(productToIncrement);
      setProducts(productsAux);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productToIncrement = products.filter(el => el.id === id)[0];

      const currentQuantity = productToIncrement.quantity;
      const productsAux = products.filter(el => el.id !== id);

      productToIncrement.quantity = currentQuantity - 1;
      if (productToIncrement.quantity > 0) {
        productsAux.push(productToIncrement);
      }
      setProducts(productsAux);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
