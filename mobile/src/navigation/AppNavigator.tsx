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
import AssetsScreen from '../screens/AssetsScreen';
import AssetDetailScreen from '../screens/AssetDetailScreen';
import CreateAssetScreen from '../screens/CreateAssetScreen';
import CreateRentalScreen from '../screens/CreateRentalScreen';
import CraftsmanHomeScreen from '../screens/CraftsmanHomeScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CreatePackageScreen from '../screens/CreatePackageScreen';
import PackageDetailScreen from '../screens/PackageDetailScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ConversationDetailScreen from '../screens/ConversationDetailScreen';
import PublicProjectsScreen from '../screens/PublicProjectsScreen';
import CraftsmenSearchScreen from '../screens/CraftsmenSearchScreen';
import CraftsmanDetailScreen from '../screens/CraftsmanDetailScreen';
import SelectLandOwnerScreen from '../screens/SelectLandOwnerScreen';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

// Üç ayrı yığın vardır: oturum kapalı, müteahhit ve usta. Giriş/kayıt ekranlarında
// açıkça yönlendirme yapılmaz; AuthContext'teki user dolduğunda bu bileşen yeniden
// render olur ve role karşılık gelen yığına geçilir.
//
// Yığınların ayrılması yetkilendirmenin bir parçası değil, yalnızca gezinme kolaylığıdır;
// asıl kontrol backend'deki RolesGuard tarafından yapılır.
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
        {!user ? (
          // Oturum kapalı: yalnızca giriş ve kayıt
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.role === 'craftsman' ? (
          // Usta: profil, hizmet paketleri, atanan projeler
          <>
            <Stack.Screen name="CraftsmanHome" component={CraftsmanHomeScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="CreatePackage" component={CreatePackageScreen} />
            <Stack.Screen name="PackageDetail" component={PackageDetailScreen} />
            <Stack.Screen name="Portfolio" component={PortfolioScreen} />
            <Stack.Screen name="Conversations" component={ConversationsScreen} />
            <Stack.Screen name="ConversationDetail" component={ConversationDetailScreen} />
            <Stack.Screen name="PublicProjects" component={PublicProjectsScreen} />
          </>
        ) : (
          // Müteahhit: proje ve finans yönetimi
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
            <Stack.Screen name="Assets" component={AssetsScreen} />
            <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />
            <Stack.Screen name="CreateAsset" component={CreateAssetScreen} />
            <Stack.Screen name="CreateRental" component={CreateRentalScreen} />
            <Stack.Screen name="Conversations" component={ConversationsScreen} />
            <Stack.Screen name="ConversationDetail" component={ConversationDetailScreen} />
            <Stack.Screen name="CraftsmenSearch" component={CraftsmenSearchScreen} />
            <Stack.Screen name="CraftsmanDetail" component={CraftsmanDetailScreen} />
            <Stack.Screen name="SelectLandOwner" component={SelectLandOwnerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
