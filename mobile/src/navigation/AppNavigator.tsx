import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import CreateBlockScreen from '../screens/CreateBlockScreen';
import CreateUnitScreen from '../screens/CreateUnitScreen';
import UnitDetailScreen from '../screens/UnitDetailScreen';
import SelectBuyerScreen from '../screens/SelectBuyerScreen';
import CreateBuyerScreen from '../screens/CreateBuyerScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import CreatePaymentScreen from '../screens/CreatePaymentScreen';
import CostsScreen from '../screens/CostsScreen';
import CreateCostItemScreen from '../screens/CreateCostItemScreen';
import CreateCostCategoryScreen from '../screens/CreateCostCategoryScreen';
import CostItemDetailScreen from '../screens/CostItemDetailScreen';
import CashflowScreen from '../screens/CashflowScreen';
import CashflowEntryDetailScreen from '../screens/CashflowEntryDetailScreen';
import CreateCashflowEntryScreen from '../screens/CreateCashflowEntryScreen';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
            <Stack.Screen name="CreateBlock" component={CreateBlockScreen} />
            <Stack.Screen name="CreateUnit" component={CreateUnitScreen} />
            <Stack.Screen name="UnitDetail" component={UnitDetailScreen} />
            <Stack.Screen name="SelectBuyer" component={SelectBuyerScreen} />
            <Stack.Screen name="CreateBuyer" component={CreateBuyerScreen} />
            <Stack.Screen name="Payments" component={PaymentsScreen} />
            <Stack.Screen name="CreatePayment" component={CreatePaymentScreen} />
            <Stack.Screen name="Costs" component={CostsScreen} />
            <Stack.Screen name="CreateCostItem" component={CreateCostItemScreen} />
            <Stack.Screen name="CreateCostCategory" component={CreateCostCategoryScreen} />
            <Stack.Screen name="CostItemDetail" component={CostItemDetailScreen} />
            <Stack.Screen name="Cashflow" component={CashflowScreen} />
            <Stack.Screen name="CashflowEntryDetail" component={CashflowEntryDetailScreen} />
            <Stack.Screen name="CreateCashflowEntry" component={CreateCashflowEntryScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
