import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CashInScreen from './src/screens/CashInScreen';
import TransferScreen from './src/screens/TransferScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user == null ? (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard"    component={DashboardScreen} />
            <Stack.Screen name="CashIn"       component={CashInScreen} />
            <Stack.Screen name="Transfer"     component={TransferScreen} />
            <Stack.Screen name="Transactions" component={TransactionsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
