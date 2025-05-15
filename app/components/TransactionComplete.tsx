import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Printer, Share2, X, ArrowRight, Home } from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  taxRate?: number;
};

type TransactionCompleteProps = {
  transactionId?: string;
  items?: TransactionItem[];
  paymentDetails?: PaymentDetails;
  date?: Date;
};

const TransactionComplete = ({
  transactionId: propTransactionId = "TRX-12345",
  items: propItems = [
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
  paymentDetails: propPaymentDetails = {
    subtotal: 215000,
    tax: 21500,
    discount: 10000,
    total: 226500,
    paymentMethod: "cash",
    amountPaid: 250000,
    change: 23500,
    taxRate: 11,
  },
  date: propDate = new Date(),
}: TransactionCompleteProps) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [transactionId, setTransactionId] = useState(propTransactionId);
  const [items, setItems] = useState(propItems);
  const [paymentDetails, setPaymentDetails] = useState(propPaymentDetails);
  const [date, setDate] = useState(propDate);

  useEffect(() => {
    // Parse URL parameters if available
    if (params.transactionId) {
      setTransactionId(params.transactionId as string);
    }

    if (params.date) {
      setDate(new Date(params.date as string));
    }

    if (params.items) {
      try {
        const parsedItems = JSON.parse(params.items as string);
        // Convert to TransactionItem format
        const formattedItems = parsedItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        }));
        setItems(formattedItems);
      } catch (error) {
        console.error("Error parsing items:", error);
      }
    }

    if (params.paymentDetails) {
      try {
        const parsedDetails = JSON.parse(params.paymentDetails as string);
        setPaymentDetails(parsedDetails);
      } catch (error) {
        console.error("Error parsing payment details:", error);
      }
    }

    // Save transaction to history
    saveTransactionToHistory();
  }, [params]);

  const saveTransactionToHistory = async () => {
    try {
      // Get existing history
      const historyString = await AsyncStorage.getItem("transaction_history");
      const history = historyString ? JSON.parse(historyString) : [];

      // Add current transaction
      const transaction = {
        id: transactionId,
        date: date.toISOString(),
        total: paymentDetails.total,
        items: items.length,
      };

      // Save updated history
      await AsyncStorage.setItem(
        "transaction_history",
        JSON.stringify([transaction, ...history]),
      );
    } catch (error) {
      console.error("Error saving transaction history:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const generateReceiptHTML = () => {
    const itemsHTML = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rp ${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rp ${item.totalPrice.toLocaleString()}</td>
      </tr>
    `,
      )
      .join("");

    return `
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; max-width: 580px; margin: 0 auto; }
          h1 { font-size: 24px; text-align: center; margin-bottom: 10px; }
          .receipt-header { text-align: center; margin-bottom: 20px; }
          .receipt-header p { margin: 5px 0; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .summary { margin-top: 20px; border-top: 2px solid #ddd; padding-top: 10px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total { font-weight: bold; font-size: 18px; margin-top: 10px; }
          .payment-info { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="receipt-header">
          <h1>Grocery Store POS</h1>
          <p>Receipt #${transactionId}</p>
          <p>${date.toLocaleString()}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>Rp ${paymentDetails.subtotal.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Tax (${paymentDetails.taxRate || 11}%):</span>
            <span>Rp ${paymentDetails.tax.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Discount:</span>
            <span>-Rp ${paymentDetails.discount.toLocaleString()}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>Rp ${paymentDetails.total.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="payment-info">
          <div class="summary-row">
            <span>Payment Method:</span>
            <span>${paymentDetails.paymentMethod.charAt(0).toUpperCase() + paymentDetails.paymentMethod.slice(1)}</span>
          </div>
          ${
            paymentDetails.paymentMethod === "cash"
              ? `
            <div class="summary-row">
              <span>Amount Paid:</span>
              <span>Rp ${paymentDetails.amountPaid.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Change:</span>
              <span>Rp ${paymentDetails.change.toLocaleString()}</span>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="footer">
          <p>Thank you for your purchase!</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintReceipt = async () => {
    try {
      // Generate HTML receipt
      const html = generateReceiptHTML();

      // Print the receipt
      const { uri } = await Print.printToFileAsync({ html });

      // On web, open the PDF in a new tab
      if (Platform.OS === "web") {
        window.open(uri, "_blank");
        return;
      }

      // On mobile, check if sharing is available
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
        });
      } else {
        Alert.alert(
          "Sharing not available",
          "Printing is not available on this device",
        );
      }
    } catch (error) {
      console.error("Error printing receipt:", error);
      Alert.alert("Print Error", "Could not print receipt");
    }
  };

  const handleEmailReceipt = async () => {
    try {
      // Generate HTML receipt
      const html = generateReceiptHTML();

      // Create a PDF file
      const { uri } = await Print.printToFileAsync({ html });

      // Share the PDF file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: "Share Receipt",
        });
      } else {
        Alert.alert(
          "Sharing not available",
          "Email sharing is not available on this device",
        );
      }
    } catch (error) {
      console.error("Error sharing receipt:", error);
      Alert.alert("Share Error", "Could not share receipt");
    }
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
            <Text className="text-gray-600">
              Tax ({paymentDetails.taxRate || 11}%)
            </Text>
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
