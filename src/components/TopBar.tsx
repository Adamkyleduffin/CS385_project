// src/components/TopBar.tsx
import { Appbar, Avatar } from 'react-native-paper';

type Props = {
  title: string;
  leftIcon?: string;
  onLeftPress?: () => void;
  showAvatar?: boolean;
  onAvatarPress?: () => void;
};

export default function TopBar({ title, leftIcon, onLeftPress, showAvatar, onAvatarPress }: Props) {
  return (
    <Appbar.Header mode="center-aligned">
      {leftIcon && <Appbar.Action icon={leftIcon} onPress={onLeftPress} />}
      <Appbar.Content title={title} />
      {showAvatar && (
        <Appbar.Action
          icon={() => <Avatar.Icon size={32} icon="account" />}
          onPress={onAvatarPress}
        />
      )}
    </Appbar.Header>
  );
}
