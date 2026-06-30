import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { tokenStore } from './src/api';
import { theme } from './src/theme';
import { CartProvider } from './src/state/cart';
import { AuthProvider } from './src/state/auth';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderPlacedScreen from './src/screens/OrderPlacedScreen';
import AccountScreen from './src/screens/AccountScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import WishlistsScreen from './src/screens/WishlistsScreen';
import LocationScreen from './src/screens/LocationScreen';

const Stack = createNativeStackNavigator();
const AccStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const headerStyle = { headerStyle: { backgroundColor: theme.paper }, headerTitleStyle: { color: theme.ink }, headerTintColor: theme.ink };

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={headerStyle}>
      <Stack.Screen name="Shop" component={CatalogScreen} options={{ title: 'Sri Lakshmi Crackers' }} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderPlaced" component={OrderPlacedScreen} options={{ title: 'Order placed', headerBackVisible: false }} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <AccStack.Navigator screenOptions={headerStyle}>
      <AccStack.Screen name="AccountHome" component={AccountScreen} options={{ title: 'Account' }} />
      <AccStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Your orders' }} />
      <AccStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
      <AccStack.Screen name="Wishlists" component={WishlistsScreen} options={{ title: 'Wishlists' }} />
      <AccStack.Screen name="Location" component={LocationScreen} options={{ title: 'Details & location' }} />
    </AccStack.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { tokenStore.hydrate().finally(() => setReady(true)); }, []);
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.paper }}><ActivityIndicator color={theme.ember} /></View>;
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.ember }}>
            <Tab.Screen name="Store" component={ShopStack} />
            <Tab.Screen name="Account" component={AccountStack} />
          </Tab.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
