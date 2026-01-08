import React from "react";
import { View, Text } from "react-native";
import { CFA } from "../../constants/theme";
import { useSession } from "../../hooks/useSession";

export default function Users() {
  const { user } = useSession();

  return (
    <View style={{ flex: 1, backgroundColor: CFA.cream, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "900", color: CFA.ink }}>
        Users
      </Text>
      <Text style={{ color: CFA.muted, marginTop: 8 }}>
        Admin-only screen. You are: {user?.role}
      </Text>
      <Text style={{ color: CFA.muted, marginTop: 8 }}>
        Coming next: create users, role changes, audit log.
      </Text>
    </View>
  );
}
