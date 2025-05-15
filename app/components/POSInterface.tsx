import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Search,
  ShoppingCart as CartIcon,
  Plus,
  Minus,
} from "lucide-react-native";
import ShoppingCart from "./ShoppingCart";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

interface POSInterfaceProps {
  onCheckout?: (items: CartItem[]) => void;
}

export default function POSInterface({
  onCheckout = () => {},
}: POSInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Mock data for categories
  const categories = [
    "All",
    "Beverages",
    "Snacks",
    "Dairy",
    "Grains",
    "Produce",
    "Household",
  ];

  // Mock data for products
  const products: Product[] = [
    { id: "1", name: "Rice 5kg", price: 50000, category: "Grains" },
    { id: "2", name: "Sugar 1kg", price: 15000, category: "Grains" },
    { id: "3", name: "Cooking Oil 1L", price: 20000, category: "Household" },
    { id: "4", name: "Instant Noodles", price: 3500, category: "Snacks" },
    { id: "5", name: "Milk 1L", price: 18000, category: "Dairy" },
    { id: "6", name: "Eggs (12)", price: 25000, category: "Dairy" },
    { id: "7", name: "Bottled Water", price: 5000, category: "Beverages" },
    { id: "8", name: "Soft Drink", price: 8000, category: "Beverages" },
    { id: "9", name: "Potato Chips", price: 10000, category: "Snacks" },
    { id: "10", name: "Tomatoes 500g", price: 12000, category: "Produce" },
    { id: "11", name: "Onions 500g", price: 8000, category: "Produce" },
    { id: "12", name: "Detergent", price: 22000, category: "Household" },
  ];

  // Filter products based on search query and selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to cart
  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id,
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === productId,
      );
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        );
      } else {
        return prevItems.filter((item) => item.product.id !== productId);
      }
    });
  };

  // Get quantity of a product in cart
  const getQuantityInCart = (productId: string) => {
    const item = cartItems.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Calculate total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  // Handle checkout
  const handleCheckout = () => {
    setIsCartOpen(true);
  };

  // Render product item
  const renderProductItem = ({ item }: { item: Product }) => {
    const quantityInCart = getQuantityInCart(item.id);

    return (
      <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-2">
        <Text className="text-lg font-bold">{item.name}</Text>
        <Text className="text-gray-600 mb-2">
          Rp {item.price.toLocaleString()}
        </Text>

        <View className="flex-row items-center justify-between mt-2">
          {quantityInCart > 0 ? (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => removeFromCart(item.id)}
                className="bg-gray-200 rounded-full p-1"
              >
                <Minus size={16} color="#000" />
              </TouchableOpacity>

              <Text className="mx-3 font-bold">{quantityInCart}</Text>

              <TouchableOpacity
                onPress={() => addToCart(item)}
                className="bg-blue-500 rounded-full p-1"
              >
                <Plus size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => addToCart(item)}
              className="bg-blue-500 py-2 px-4 rounded-lg"
            >
              <Text className="text-white font-bold">Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Search Bar */}
      <View className="bg-white p-4 shadow-sm">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} color="#666" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-3 bg-white mb-2"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            className={`px-4 py-2 mx-1 rounded-full ${selectedCategory === category ? "bg-blue-500" : "bg-gray-200"}`}
          >
            <Text
              className={`font-medium ${selectedCategory === category ? "text-white" : "text-gray-800"}`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 10,
        }}
        contentContainerStyle={{ paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Summary (Fixed at bottom) */}
      <View className="bg-white p-3 border-t border-gray-200 shadow-lg">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-600">{totalItems} items</Text>
            <Text className="text-xl font-bold">
              Rp {subtotal.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCheckout}
            className="bg-blue-500 py-3 px-6 rounded-lg flex-row items-center"
            disabled={cartItems.length === 0}
          >
            <CartIcon size={20} color="#fff" />
            <Text className="text-white font-bold ml-2">Checkout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shopping Cart Modal */}
      {isCartOpen && (
        <ShoppingCart
          isVisible={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={(productId, quantity) => {
            if (quantity === 0) {
              setCartItems((prev) =>
                prev.filter((item) => item.product.id !== productId),
              );
            } else {
              setCartItems((prev) =>
                prev.map((item) =>
                  item.product.id === productId ? { ...item, quantity } : item,
                ),
              );
            }
          }}
          onCheckout={() => {
            onCheckout(cartItems);
            setIsCartOpen(false);
          }}
        />
      )}
    </View>
  );
}
