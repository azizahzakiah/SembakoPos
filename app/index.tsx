import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  BarChart3,
  Package,
  ShoppingCart,
  User,
  Home,
  AlertCircle,
} from "lucide-react-native";
import POSInterface from "./components/POSInterface";
import ProductManagement from "./components/ProductManagement";
import TransactionComplete from "./components/TransactionComplete";

type Module = "dashboard" | "pos" | "products" | "transactions";

export default function MainDashboard() {
  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const [userName, setUserName] = useState("John Doe");
  const [storeName, setStoreName] = useState("Grocery Store POS");

  // Mock data for dashboard
  const salesSummary = {
    totalSales: "Rp 5,250,000",
    transactions: 42,
    averageSale: "Rp 125,000",
  };

  const inventoryAlerts = [
    { id: 1, name: "Rice", currentStock: 5, threshold: 10 },
    { id: 2, name: "Sugar", currentStock: 3, threshold: 15 },
    { id: 3, name: "Cooking Oil", currentStock: 8, threshold: 20 },
  ];

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <ScrollView className="flex-1 bg-gray-50 px-4 py-2">
            {/* Daily Sales Summary */}
            <View className="bg-white rounded-xl p-4 shadow mb-4">
              <Text className="text-lg font-bold mb-2">
                Daily Sales Summary
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Total Sales:</Text>
                <Text className="font-bold">{salesSummary.totalSales}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Transactions:</Text>
                <Text className="font-bold">{salesSummary.transactions}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Average Sale:</Text>
                <Text className="font-bold">{salesSummary.averageSale}</Text>
              </View>
            </View>

            {/* Inventory Alerts */}
            <View className="bg-white rounded-xl p-4 shadow mb-4">
              <Text className="text-lg font-bold mb-2">Inventory Alerts</Text>
              {inventoryAlerts.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between py-2 border-b border-gray-100"
                >
                  <View className="flex-row items-center">
                    <AlertCircle size={16} color="#EF4444" />
                    <Text className="ml-2">{item.name}</Text>
                  </View>
                  <Text className="text-red-500">{item.currentStock} left</Text>
                </View>
              ))}
            </View>

            {/* Quick Access */}
            <View className="bg-white rounded-xl p-4 shadow mb-4">
              <Text className="text-lg font-bold mb-2">Quick Access</Text>
              <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity
                  className="bg-blue-500 p-3 rounded-lg w-[48%] mb-3 items-center"
                  onPress={() => setActiveModule("pos")}
                >
                  <ShoppingCart color="white" size={24} />
                  <Text className="text-white mt-1">New Sale</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-green-500 p-3 rounded-lg w-[48%] mb-3 items-center"
                  onPress={() => setActiveModule("products")}
                >
                  <Package color="white" size={24} />
                  <Text className="text-white mt-1">Manage Products</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-purple-500 p-3 rounded-lg w-[48%] items-center">
                  <BarChart3 color="white" size={24} />
                  <Text className="text-white mt-1">Sales Report</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-orange-500 p-3 rounded-lg w-[48%] items-center">
                  <User color="white" size={24} />
                  <Text className="text-white mt-1">Manage Users</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );
      case "pos":
        return <POSInterface />;
      case "products":
        return <ProductManagement />;
      case "transactions":
        return <TransactionComplete />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />

      {/* Header */}
      <View className="bg-blue-600 px-4 py-3 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-xl font-bold">{storeName}</Text>
          <Text className="text-white text-sm opacity-80">
            Welcome, {userName}
          </Text>
        </View>
        <TouchableOpacity className="bg-blue-700 p-2 rounded-full">
          <User color="white" size={24} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1">{renderModule()}</View>

      {/* Bottom Navigation */}
      <View className="flex-row bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeModule === "dashboard" ? "bg-blue-50" : ""}`}
          onPress={() => setActiveModule("dashboard")}
        >
          <Home
            size={24}
            color={activeModule === "dashboard" ? "#2563EB" : "#6B7280"}
          />
          <Text
            className={
              activeModule === "dashboard" ? "text-blue-600" : "text-gray-500"
            }
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeModule === "pos" ? "bg-blue-50" : ""}`}
          onPress={() => setActiveModule("pos")}
        >
          <ShoppingCart
            size={24}
            color={activeModule === "pos" ? "#2563EB" : "#6B7280"}
          />
          <Text
            className={
              activeModule === "pos" ? "text-blue-600" : "text-gray-500"
            }
          >
            POS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeModule === "products" ? "bg-blue-50" : ""}`}
          onPress={() => setActiveModule("products")}
        >
          <Package
            size={24}
            color={activeModule === "products" ? "#2563EB" : "#6B7280"}
          />
          <Text
            className={
              activeModule === "products" ? "text-blue-600" : "text-gray-500"
            }
          >
            Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeModule === "transactions" ? "bg-blue-50" : ""}`}
          onPress={() => setActiveModule("transactions")}
        >
          <BarChart3
            size={24}
            color={activeModule === "transactions" ? "#2563EB" : "#6B7280"}
          />
          <Text
            className={
              activeModule === "transactions"
                ? "text-blue-600"
                : "text-gray-500"
            }
          >
            Reports
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
