import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation';

import Onboarding from '../screens/Onboarding';
import Register from '../screens/Register';

import ProfileName from '../screens/ProfileName';
import Gender from '../screens/Gender';         // <-- Import Gender screen
import Interests from '../screens/Interests';   // <-- Import Interests screen
import Home from '../screens/Home';
import Login from '../screens/Login';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} />
        
        <Stack.Screen name="ProfileName" component={ProfileName} />
        <Stack.Screen name="Gender" component={Gender} />
        <Stack.Screen name="Interests" component={Interests} />
        <Stack.Screen name="Home" component={Home} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}