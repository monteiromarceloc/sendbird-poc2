import { Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    SendbirdUIKitContainer,
    useSendbirdChat,
    createGroupChannelListFragment,
    createGroupChannelCreateFragment,
    createGroupChannelFragment,
    useConnection,
    createNativeClipboardService,
    createNativeNotificationService,
} from '@sendbird/uikit-react-native';
import { useGroupChannel } from '@sendbird/uikit-chat-hooks';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import messaging from '@react-native-firebase/messaging';
import * as Permissions from 'expo-permissions';

const APP_ID = "C3CA0C7D-CF8C-4A1C-9455-FC72FCB7AAF4";
const USER_ID = "bc8ed4ea-70de-4df0-b73f-473d7f7e82c2";

const ClipboardService = createNativeClipboardService(Clipboard);
const NotificationService = createNativeNotificationService({
  messagingModule: messaging,
  permissionModule: Permissions,
});

export default App = () => {
    return (
        <SendbirdUIKitContainer
            appId={APP_ID}
            chatOptions={{ localCacheStorage: AsyncStorage }}
            platformServices={{
              clipboard: ClipboardService,
              notification: NotificationService
            }}
        >
            <Navigation />
        </SendbirdUIKitContainer>
    );
};

const RootStack = createNativeStackNavigator();
const Navigation = () => {
    const { currentUser } = useSendbirdChat();
    console.log('currentUser', currentUser);

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {!currentUser ? (
                    <RootStack.Screen name={'SignIn'} component={SignInScreen} />
                ) : (
                    <>
                        <RootStack.Screen name={'GroupChannelList'} component={GroupChannelListScreen} />
                        <RootStack.Screen name={'GroupChannelCreate'} component={GroupChannelCreateScreen} />
                        <RootStack.Screen name={'GroupChannel'} component={GroupChannelScreen} />
                    </>
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};


const GroupChannelListFragment = createGroupChannelListFragment();
const GroupChannelCreateFragment = createGroupChannelCreateFragment();
const GroupChannelFragment = createGroupChannelFragment();

const GroupChannelListScreen = () => {
    const navigation = useNavigation();
    return (
        <GroupChannelListFragment
            onPressCreateChannel={(channelType) => {
                // Navigate to GroupChannelCreate function.
                navigation.navigate('GroupChannelCreate', { channelType });
            }}
            onPressChannel={(channel) => {
                // Navigate to GroupChannel function.
                navigation.navigate('GroupChannel', { channelUrl: channel.url });
            }}
        />
    );
};

const GroupChannelCreateScreen = () => {
    const navigation = useNavigation();

    return (
        <GroupChannelCreateFragment
            onCreateChannel={async (channel) => {
                // Navigate to GroupChannel function.
                navigation.replace('GroupChannel', { channelUrl: channel.url });
            }}
            onPressHeaderLeft={() => {
                // Go back to the previous screen.
                navigation.goBack();
            }}
        />
    );
};

const GroupChannelScreen = () => {
    const navigation = useNavigation();
    const { params } = useRoute();

    const { sdk } = useSendbirdChat();
    const { channel } = useGroupChannel(sdk, params.channelUrl);
    if (!channel) return null;

    return (
        <GroupChannelFragment
            channel={channel}
            onChannelDeleted={() => {
                // Navigate to GroupChannelList function.
                navigation.navigate('GroupChannelList');
            }}
            onPressHeaderLeft={() => {
                // Go back to the previous screen.
                navigation.goBack();
            }}
            onPressHeaderRight={() => {
                // Navigate to GroupChannelSettings function.
                navigation.navigate('GroupChannelSettings', { channelUrl: params.channelUrl });
            }}
        />
    );
};

const SignInScreen = () => {
  const { connect } = useConnection();

  return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity
              style={{
                  width: 120,
                  height: 30,
                  backgroundColor: '#742DDD',
                  alignItems: 'center',
                  justifyContent: 'center',
              }}
              onPress={connect(USER_ID, { nickname: 'MyNickname' })}
          >
              <Text>Sign in</Text>
          </TouchableOpacity>
      </View>
  );
};