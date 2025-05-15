import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertCircle,
  X,
  ChevronDown,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Supplier {
  id: string;
  name: string;
  contact: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  supplier: Supplier;
  lowStockThreshold: number;
}

interface ProductManagementProps {
  products?: Product[];
  onAddProduct?: (product: Omit<Product, "id">) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
  products: initialProducts = [
    {
      id: "1",
      name: "Rice",
      price: 15000,
      stock: 50,
      category: "Grains",
      supplier: {
        id: "s1",
        name: "Farm Fresh Supplies",
        contact: "+62812345678",
      },
      lowStockThreshold: 10,
    },
    {
      id: "2",
      name: "Sugar",
      price: 12000,
      stock: 8,
      category: "Baking",
      supplier: {
        id: "s2",
        name: "Sweet Distributors",
        contact: "+62823456789",
      },
      lowStockThreshold: 10,
    },
    {
      id: "3",
      name: "Cooking Oil",
      price: 20000,
      stock: 25,
      category: "Oils",
      supplier: {
        id: "s3",
        name: "Kitchen Essentials",
        contact: "+62834567890",
      },
      lowStockThreshold: 10,
    },
    {
      id: "4",
      name: "Instant Noodles",
      price: 3500,
      stock: 100,
      category: "Instant Food",
      supplier: { id: "s4", name: "Quick Meals Inc.", contact: "+62845678901" },
      lowStockThreshold: 20,
    },
    {
      id: "5",
      name: "Coffee",
      price: 25000,
      stock: 15,
      category: "Beverages",
      supplier: { id: "s5", name: "Morning Brew Co.", contact: "+62856789012" },
      lowStockThreshold: 5,
    },
  ],
  onAddProduct = () => {},
  onEditProduct = () => {},
  onDeleteProduct = () => {},
}) => {
  // State management
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // New state for categories and suppliers management
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSupplier, setNewSupplier] = useState<Supplier>({
    id: "",
    name: "",
    contact: "",
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Extract unique categories from products
  useEffect(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];
    setCategories(uniqueCategories);

    const uniqueSuppliers = products.reduce((acc: Supplier[], product) => {
      if (!acc.some((supplier) => supplier.id === product.supplier.id)) {
        acc.push(product.supplier);
      }
      return acc;
    }, []);
    setSuppliers(uniqueSuppliers);
  }, [products]);

  // Load data from AsyncStorage
  const loadData = async () => {
    try {
      const storedProducts = await AsyncStorage.getItem("products");
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        // If no stored products, save the initial products
        await AsyncStorage.setItem("products", JSON.stringify(initialProducts));
      }
    } catch (error) {
      console.error("Error loading data from AsyncStorage:", error);
    }
  };

  // Save data to AsyncStorage
  const saveData = async (updatedProducts: Product[]) => {
    try {
      await AsyncStorage.setItem("products", JSON.stringify(updatedProducts));
    } catch (error) {
      console.error("Error saving data to AsyncStorage:", error);
    }
  };

  // Filter products based on search query and selected category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // CRUD Operations
  const handleAddProduct = () => {
    setCurrentProduct({
      id: "",
      name: "",
      price: 0,
      stock: 0,
      category: categories.length > 0 ? categories[0] : "",
      supplier:
        suppliers.length > 0 ? suppliers[0] : { id: "", name: "", contact: "" },
      lowStockThreshold: 10,
    });
    setIsNewProduct(true);
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsNewProduct(false);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedProducts = products.filter(
              (product) => product.id !== id,
            );
            setProducts(updatedProducts);
            saveData(updatedProducts);
            onDeleteProduct(id);
          },
        },
      ],
    );
  };

  const handleSaveProduct = () => {
    if (!currentProduct) return;

    let updatedProducts: Product[];

    if (isNewProduct) {
      const newProduct = {
        ...currentProduct,
        id: Date.now().toString(), // Generate a unique ID
      };
      updatedProducts = [...products, newProduct];
      onAddProduct({
        name: newProduct.name,
        price: newProduct.price,
        stock: newProduct.stock,
        category: newProduct.category,
        supplier: newProduct.supplier,
        lowStockThreshold: newProduct.lowStockThreshold,
      });
    } else {
      updatedProducts = products.map((product) =>
        product.id === currentProduct.id ? currentProduct : product,
      );
      onEditProduct(currentProduct);
    }

    setProducts(updatedProducts);
    saveData(updatedProducts);
    setShowProductModal(false);
  };

  // Category Management
  const handleAddCategory = () => {
    if (newCategory.trim() === "") return;

    if (!categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      if (currentProduct) {
        setCurrentProduct({ ...currentProduct, category: newCategory });
      }
    }

    setNewCategory("");
    setShowCategoryModal(false);
  };

  // Supplier Management
  const handleAddSupplier = () => {
    if (newSupplier.name.trim() === "") return;

    const supplierId = Date.now().toString();
    const supplierToAdd = {
      ...newSupplier,
      id: supplierId,
    };

    const updatedSuppliers = [...suppliers, supplierToAdd];
    setSuppliers(updatedSuppliers);

    if (currentProduct) {
      setCurrentProduct({ ...currentProduct, supplier: supplierToAdd });
    }

    setNewSupplier({ id: "", name: "", contact: "" });
    setShowSupplierModal(false);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const isLowStock = item.stock <= item.lowStockThreshold;

    return (
      <View className="bg-white p-4 mb-2 rounded-lg shadow">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-lg font-bold">{item.name}</Text>
            <Text className="text-gray-600">
              Rp {item.price.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row items-center">
            <View
              className={`px-3 py-1 rounded-full mr-2 ${isLowStock ? "bg-red-100" : "bg-green-100"}`}
            >
              <Text
                className={`${isLowStock ? "text-red-700" : "text-green-700"}`}
              >
                Stock: {item.stock}
              </Text>
            </View>

            <TouchableOpacity
              className="p-2 bg-blue-100 rounded-full mr-2"
              onPress={() => handleEditProduct(item)}
            >
              <Edit size={18} color="#1d4ed8" />
            </TouchableOpacity>

            <TouchableOpacity
              className="p-2 bg-red-100 rounded-full"
              onPress={() => handleDeleteProduct(item.id)}
            >
              <Trash2 size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-2">
          <Text className="text-gray-500">Category: {item.category}</Text>
          <Text className="text-gray-500">Supplier: {item.supplier.name}</Text>
          {isLowStock && (
            <View className="flex-row items-center mt-1">
              <AlertCircle size={16} color="#dc2626" />
              <Text className="text-red-600 ml-1">Low stock alert</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Search and Filter Bar */}
      <View className="flex-row mb-4">
        <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-2 mr-2 shadow">
          <Search size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2"
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-2 justify-center items-center shadow"
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Selected Category Indicator */}
      {selectedCategory && (
        <View className="flex-row mb-4">
          <View className="flex-row items-center bg-blue-100 rounded-full px-3 py-1">
            <Text className="text-blue-700">{selectedCategory}</Text>
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              className="ml-2"
            >
              <X size={16} color="#1d4ed8" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500 text-lg">No products found</Text>
          </View>
        }
      />

      {/* Add Product Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        onPress={handleAddProduct}
      >
        <PlusCircle size={30} color="white" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-80">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  className={`p-3 mb-2 rounded-lg ${selectedCategory === category ? "bg-blue-100" : "bg-gray-100"}`}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowFilterModal(false);
                  }}
                >
                  <Text
                    className={
                      selectedCategory === category
                        ? "text-blue-700"
                        : "text-gray-800"
                    }
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="mt-4 p-3 bg-gray-200 rounded-lg items-center"
              onPress={() => {
                setSelectedCategory(null);
                setShowFilterModal(false);
              }}
            >
              <Text className="font-medium">Clear Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Product Add/Edit Modal */}
      <Modal
        visible={showProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">
                {isNewProduct ? "Add New Product" : "Edit Product"}
              </Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              {currentProduct && (
                <>
                  <View className="mb-4">
                    <Text className="text-gray-700 mb-1">Product Name</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-2"
                      value={currentProduct.name}
                      onChangeText={(text) =>
                        setCurrentProduct({ ...currentProduct, name: text })
                      }
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 mb-1">Price (Rp)</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-2"
                      value={currentProduct.price.toString()}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        setCurrentProduct({
                          ...currentProduct,
                          price: parseFloat(text) || 0,
                        })
                      }
                    />
                  </View>

                  {/* Category Selection with Dropdown */}
                  <View className="mb-4">
                    <Text className="text-gray-700 mb-1">Category</Text>
                    <View className="relative">
                      <TouchableOpacity
                        className="border border-gray-300 rounded-lg p-2 flex-row justify-between items-center"
                        onPress={() =>
                          setShowCategoryDropdown(!showCategoryDropdown)
                        }
                      >
                        <Text>
                          {currentProduct.category || "Select Category"}
                        </Text>
                        <ChevronDown size={18} color="#6b7280" />
                      </TouchableOpacity>

                      {showCategoryDropdown && (
                        <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-10 max-h-40">
                          <ScrollView>
                            {categories.map((category) => (
                              <TouchableOpacity
                                key={category}
                                className="p-3 border-b border-gray-100"
                                onPress={() => {
                                  setCurrentProduct({
                                    ...currentProduct,
                                    category,
                                  });
                                  setShowCategoryDropdown(false);
                                }}
                              >
                                <Text>{category}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                          <TouchableOpacity
                            className="p-3 bg-blue-50 items-center"
                            onPress={() => {
                              setShowCategoryModal(true);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            <Text className="text-blue-600 font-medium">
                              + Add New Category
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 mb-1">Stock Quantity</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-2"
                      value={currentProduct.stock.toString()}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        setCurrentProduct({
                          ...currentProduct,
                          stock: parseInt(text) || 0,
                        })
                      }
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 mb-1">
                      Low Stock Threshold
                    </Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-2"
                      value={currentProduct.lowStockThreshold.toString()}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        setCurrentProduct({
                          ...currentProduct,
                          lowStockThreshold: parseInt(text) || 0,
                        })
                      }
                    />
                  </View>

                  {/* Supplier Selection with Dropdown */}
                  <View className="mb-4">
                    <Text className="text-gray-700 mb-1">Supplier</Text>
                    <View className="relative">
                      <TouchableOpacity
                        className="border border-gray-300 rounded-lg p-2 flex-row justify-between items-center"
                        onPress={() =>
                          setShowSupplierDropdown(!showSupplierDropdown)
                        }
                      >
                        <Text>
                          {currentProduct.supplier.name || "Select Supplier"}
                        </Text>
                        <ChevronDown size={18} color="#6b7280" />
                      </TouchableOpacity>

                      {showSupplierDropdown && (
                        <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-10 max-h-40">
                          <ScrollView>
                            {suppliers.map((supplier) => (
                              <TouchableOpacity
                                key={supplier.id}
                                className="p-3 border-b border-gray-100"
                                onPress={() => {
                                  setCurrentProduct({
                                    ...currentProduct,
                                    supplier,
                                  });
                                  setShowSupplierDropdown(false);
                                }}
                              >
                                <Text>{supplier.name}</Text>
                                <Text className="text-gray-500 text-xs">
                                  {supplier.contact}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                          <TouchableOpacity
                            className="p-3 bg-blue-50 items-center"
                            onPress={() => {
                              setShowSupplierModal(true);
                              setShowSupplierDropdown(false);
                            }}
                          >
                            <Text className="text-blue-600 font-medium">
                              + Add New Supplier
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-gray-700 mb-1">Supplier Contact</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg p-2"
                      value={currentProduct.supplier.contact}
                      editable={false}
                      selectTextOnFocus={false}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View className="flex-row mt-4">
              <TouchableOpacity
                className="flex-1 mr-2 p-3 bg-gray-200 rounded-lg items-center"
                onPress={() => setShowProductModal(false)}
              >
                <Text className="font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 ml-2 p-3 bg-blue-500 rounded-lg items-center"
                onPress={handleSaveProduct}
              >
                <Text className="font-medium text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add New Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 w-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Add New Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Category Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2"
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Enter category name"
              />
            </View>

            <View className="flex-row mt-4">
              <TouchableOpacity
                className="flex-1 mr-2 p-3 bg-gray-200 rounded-lg items-center"
                onPress={() => setShowCategoryModal(false)}
              >
                <Text className="font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 ml-2 p-3 bg-blue-500 rounded-lg items-center"
                onPress={handleAddCategory}
              >
                <Text className="font-medium text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add New Supplier Modal */}
      <Modal
        visible={showSupplierModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSupplierModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 w-4/5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Add New Supplier</Text>
              <TouchableOpacity onPress={() => setShowSupplierModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Supplier Name</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2"
                value={newSupplier.name}
                onChangeText={(text) =>
                  setNewSupplier({ ...newSupplier, name: text })
                }
                placeholder="Enter supplier name"
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Contact Number</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2"
                value={newSupplier.contact}
                onChangeText={(text) =>
                  setNewSupplier({ ...newSupplier, contact: text })
                }
                placeholder="Enter contact number"
                keyboardType="phone-pad"
              />
            </View>

            <View className="flex-row mt-4">
              <TouchableOpacity
                className="flex-1 mr-2 p-3 bg-gray-200 rounded-lg items-center"
                onPress={() => setShowSupplierModal(false)}
              >
                <Text className="font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 ml-2 p-3 bg-blue-500 rounded-lg items-center"
                onPress={handleAddSupplier}
              >
                <Text className="font-medium text-white">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductManagement;
