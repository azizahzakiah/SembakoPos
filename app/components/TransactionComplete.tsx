import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Printer, Mail, X, ArrowRight, Home } from "lucide-react-native";

type TransactionItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type PaymentDetails = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "mobile";
  amountPaid?: number;
  change?: number;
};

type TransactionCompleteProps = {
  transactionId?: string;
  items?: TransactionItem[];
  paymentDetails?: PaymentDetails;
  date?: Date;
};

const TransactionComplete = ({
  transactionId = "TRX-12345",
  items = [
    {
      id: "1",
      name: "Rice 5kg",
      quantity: 2,
      unitPrice: 50000,
      totalPrice: 100000,
    },
    {
      id: "2",
      name: "Sugar 1kg",
      quantity: 3,
      unitPrice: 15000,
      totalPrice: 45000,
    },
    {
      id: "3",
      name: "Cooking Oil 2L",
      quantity: 1,
      unitPrice: 35000,
      totalPrice: 35000,
    },
    {
      id: "4",
      name: "Instant Noodles",
      quantity: 10,
      unitPrice: 3500,
      totalPrice: 35000,
    },
  ],
  paymentDetails = {
    subtotal: 215000,
    tax: 21500,
    discount: 10000,
    total: 226500,
    paymentMethod: "cash",
    amountPaid: 250000,
    change: 23500,
  },
  date = new Date(),
}: TransactionCompleteProps) => {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrintReceipt = () => {
    // In a real app, this would connect to a Bluetooth printer
    console.log("Connecting to printer...");
  };

  const handleEmailReceipt = () => {
    // In a real app, this would open an email dialog
    console.log("Opening email dialog...");
  };

  const handleNewTransaction = () => {
    router.push("/components/POSInterface");
  };

  const handleBackToDashboard = () => {
    router.push("/");
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="items-center mb-6 bg-green-50 py-4 rounded-lg">
        <View className="bg-green-500 p-3 rounded-full mb-2">
          <ArrowRight size={24} color="white" />
        </View>
        <Text className="text-2xl font-bold text-green-800">
          Transaction Complete
        </Text>
        <Text className="text-gray-600">{date.toLocaleString()}</Text>
        <Text className="text-gray-600 font-semibold">{transactionId}</Text>
      </View>

      {/* Transaction Summary */}
      <ScrollView className="flex-1 mb-4">
        <View className="bg-gray-50 p-4 rounded-lg mb-4">
          <Text className="text-lg font-bold mb-2">Items Purchased</Text>
          {items.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between py-2 border-b border-gray-200"
            >
              <View className="flex-1">
                <Text className="font-medium">{item.name}</Text>
                <Text className="text-gray-500">
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                </Text>
              </View>
              <Text className="font-medium">
                {formatCurrency(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-gray-50 p-4 rounded-lg mb-4">
          <Text className="text-lg font-bold mb-2">Payment Details</Text>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Subtotal</Text>
            <Text>{formatCurrency(paymentDetails.subtotal)}</Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Tax (10%)</Text>
            <Text>{formatCurrency(paymentDetails.tax)}</Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Discount</Text>
            <Text className="text-red-500">
              -{formatCurrency(paymentDetails.discount)}
            </Text>
          </View>
          <View className="flex-row justify-between py-2 border-t border-gray-300 mt-1">
            <Text className="font-bold">Total</Text>
            <Text className="font-bold">
              {formatCurrency(paymentDetails.total)}
            </Text>
          </View>
          <View className="mt-2 pt-2 border-t border-gray-300">
            <View className="flex-row justify-between py-1">
              <Text className="text-gray-600">Payment Method</Text>
              <Text className="capitalize">{paymentDetails.paymentMethod}</Text>
            </View>
            {paymentDetails.paymentMethod === "cash" && (
              <>
                <View className="flex-row justify-between py-1">
                  <Text className="text-gray-600">Amount Paid</Text>
                  <Text>{formatCurrency(paymentDetails.amountPaid || 0)}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-gray-600">Change</Text>
                  <Text>{formatCurrency(paymentDetails.change || 0)}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Receipt Options */}
      <View className="flex-row justify-around mb-6">
        <TouchableOpacity
          className="items-center bg-blue-100 p-3 rounded-lg flex-1 mx-1"
          onPress={handlePrintReceipt}
        >
          <Printer size={24} color="#1e40af" />
          <Text className="text-blue-800 mt-1">Print Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center bg-purple-100 p-3 rounded-lg flex-1 mx-1"
          onPress={handleEmailReceipt}
        >
          <Share2 size={24} color="#6b21a8" />
          <Text className="text-purple-800 mt-1">Share Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center bg-gray-100 p-3 rounded-lg flex-1 mx-1"
          onPress={handleNewTransaction}
        >
          <X size={24} color="#4b5563" />
          <Text className="text-gray-800 mt-1">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View className="flex-row">
        <TouchableOpacity
          className="bg-green-500 p-4 rounded-lg flex-1 items-center mr-2"
          onPress={handleNewTransaction}
        >
          <Text className="text-white font-bold text-lg">New Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-gray-200 p-4 rounded-lg items-center w-12"
          onPress={handleBackToDashboard}
        >
          <Home size={24} color="#4b5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TransactionComplete;
