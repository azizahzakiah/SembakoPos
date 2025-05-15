import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import {
  Minus,
  Plus,
  Trash2,
  X,
  Percent,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
} from "lucide-react-native";
import { useRouter } from "expo-router";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
};

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShoppingCartProps {
  items?: CartItem[];
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemoveItem?: (id: string) => void;
  onApplyDiscount?: (amount: number, isPercentage: boolean) => void;
  onProcessPayment?: (method: "cash" | "card" | "mobile") => void;
  onCancel?: () => void;
  isExpanded?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
  cartItems?: any[];
  onCheckout?: () => void;
}

const ShoppingCart = ({
  items = [
    { id: "1", name: "Rice 5kg", price: 50000, quantity: 2 },
    { id: "2", name: "Sugar 1kg", price: 15000, quantity: 1 },
    { id: "3", name: "Cooking Oil 2L", price: 30000, quantity: 1 },
  ],
  onUpdateQuantity = () => {},
  onRemoveItem = () => {},
  onApplyDiscount = () => {},
  onProcessPayment = () => {},
  onCancel = () => {},
  isExpanded = true,
  isVisible = false,
  onClose = () => {},
  cartItems = [],
  onCheckout = () => {},
}: ShoppingCartProps) => {
  const router = useRouter();
  const [discountAmount, setDiscountAmount] = useState("0");
  const [isPercentage, setIsPercentage] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "cash" | "card" | "mobile"
  >("cash");
  const [taxRate, setTaxRate] = useState("11");
  const [amountPaid, setAmountPaid] = useState("");

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const discount = isPercentage
    ? subtotal * (parseFloat(discountAmount) / 100)
    : parseFloat(discountAmount) || 0;
  const tax = (subtotal - discount) * (parseFloat(taxRate) / 100); // Custom tax rate
  const total = subtotal - discount + tax;

  // Calculate change
  const amountPaidValue = parseFloat(amountPaid) || 0;
  const change = amountPaidValue > total ? amountPaidValue - total : 0;

  const handleApplyDiscount = () => {
    onApplyDiscount(parseFloat(discountAmount), isPercentage);
  };

  const handleProcessPayment = () => {
    if (selectedPaymentMethod === "cash" && amountPaidValue < total) {
      Alert.alert(
        "Payment Error",
        "Amount paid must be equal to or greater than the total amount.",
      );
      return;
    }

    // Navigate to transaction complete screen with transaction details
    router.push({
      pathname: "/components/TransactionComplete",
      params: {
        items: JSON.stringify(items),
        paymentDetails: JSON.stringify({
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: selectedPaymentMethod,
          amountPaid: amountPaidValue,
          change,
          taxRate: parseFloat(taxRate),
        }),
        transactionId: `TRX-${Math.floor(Math.random() * 100000)}`,
        date: new Date().toISOString(),
      },
    });

    onProcessPayment(selectedPaymentMethod);
    if (onClose) onClose();
  };

  if (!isExpanded) {
    return (
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-bold">{items.length} items</Text>
          <Text className="text-lg font-bold">Rp {total.toLocaleString()}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white h-full">
      <View className="bg-blue-600 p-4 flex-row justify-between items-center">
        <Text className="text-white text-xl font-bold">Shopping Cart</Text>
        <TouchableOpacity onPress={onCancel}>
          <X color="white" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {items.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-500 text-lg">Your cart is empty</Text>
          </View>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center py-3 border-b border-gray-200"
            >
              <View className="flex-1">
                <Text className="text-lg font-medium">{item.name}</Text>
                <Text className="text-gray-600">
                  Rp {item.price.toLocaleString()} x {item.quantity}
                </Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="bg-gray-200 rounded-full p-1"
                  onPress={() =>
                    onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                >
                  <Minus size={18} color="#4B5563" />
                </TouchableOpacity>

                <Text className="px-3 text-lg">{item.quantity}</Text>

                <TouchableOpacity
                  className="bg-gray-200 rounded-full p-1"
                  onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus size={18} color="#4B5563" />
                </TouchableOpacity>

                <TouchableOpacity
                  className="ml-4 p-1"
                  onPress={() => onRemoveItem(item.id)}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View className="mt-6 bg-gray-50 p-4 rounded-lg">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="font-medium">Rp {subtotal.toLocaleString()}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Discount</Text>
            <Text className="font-medium text-green-600">
              - Rp {discount.toLocaleString()}
            </Text>
          </View>

          <View className="mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Tax Rate (%)</Text>
              <View className="flex-row items-center w-20">
                <TextInput
                  className="border border-gray-300 rounded px-2 py-1 w-full text-right bg-white"
                  keyboardType="numeric"
                  value={taxRate}
                  onChangeText={setTaxRate}
                  placeholder="11"
                />
              </View>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Tax ({taxRate}%)</Text>
              <Text className="font-medium">Rp {tax.toLocaleString()}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-300">
            <Text className="text-lg font-bold">Total</Text>
            <Text className="text-lg font-bold">
              Rp {total.toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="mt-6 bg-gray-50 p-4 rounded-lg">
          <Text className="font-bold mb-2">Apply Discount</Text>
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 border border-gray-300 rounded-l-lg p-2 bg-white"
              keyboardType="numeric"
              value={discountAmount}
              onChangeText={setDiscountAmount}
              placeholder="Amount"
            />
            <TouchableOpacity
              className={`p-3 ${isPercentage ? "bg-blue-600" : "bg-gray-300"}`}
              onPress={() => setIsPercentage(true)}
            >
              <Percent size={20} color={isPercentage ? "white" : "black"} />
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-3 rounded-r-lg ${!isPercentage ? "bg-blue-600" : "bg-gray-300"}`}
              onPress={() => setIsPercentage(false)}
            >
              <Text className={!isPercentage ? "text-white" : "text-black"}>
                Rp
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="mt-2 bg-blue-600 p-3 rounded-lg items-center"
            onPress={handleApplyDiscount}
          >
            <Text className="text-white font-medium">Apply Discount</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6 bg-gray-50 p-4 rounded-lg">
          <Text className="font-bold mb-2">Payment Method</Text>
          {selectedPaymentMethod === "cash" && (
            <View className="mb-4">
              <Text className="mb-1">Amount Paid</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2 bg-white"
                keyboardType="numeric"
                value={amountPaid}
                onChangeText={setAmountPaid}
                placeholder="Enter amount"
              />
              {amountPaidValue >= total && (
                <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-300">
                  <Text className="font-bold">Change</Text>
                  <Text className="font-bold text-green-600">
                    Rp {change.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          )}
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg mr-2 items-center ${selectedPaymentMethod === "cash" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setSelectedPaymentMethod("cash")}
            >
              <Banknote
                size={24}
                color={selectedPaymentMethod === "cash" ? "white" : "black"}
              />
              <Text
                className={`mt-1 ${selectedPaymentMethod === "cash" ? "text-white" : "text-black"}`}
              >
                Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg mx-1 items-center ${selectedPaymentMethod === "card" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setSelectedPaymentMethod("card")}
            >
              <CreditCard
                size={24}
                color={selectedPaymentMethod === "card" ? "white" : "black"}
              />
              <Text
                className={`mt-1 ${selectedPaymentMethod === "card" ? "text-white" : "text-black"}`}
              >
                Card
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg ml-2 items-center ${selectedPaymentMethod === "mobile" ? "bg-blue-600" : "bg-gray-200"}`}
              onPress={() => setSelectedPaymentMethod("mobile")}
            >
              <Smartphone
                size={24}
                color={selectedPaymentMethod === "mobile" ? "white" : "black"}
              />
              <Text
                className={`mt-1 ${selectedPaymentMethod === "mobile" ? "text-white" : "text-black"}`}
              >
                Mobile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-green-600 p-4 rounded-lg items-center mb-2 flex-row justify-center"
          onPress={handleProcessPayment}
        >
          <Receipt size={20} color="white" />
          <Text className="text-white font-bold text-lg ml-2">
            Complete Transaction
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-600 p-4 rounded-lg items-center"
          onPress={onCancel}
        >
          <Text className="text-white font-bold">Cancel Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShoppingCart;
