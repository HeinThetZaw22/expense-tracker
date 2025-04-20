import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import { Image } from "expo-image";
import {
  getProfileImage,
  uploadImageToImageKit,
} from "@/services/imageService";
import { Pencil, Trash } from "phosphor-react-native";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { UserDataType, WalletType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { updateUser } from "@/services/userService";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { createOrUpdateWallet, deleteWallet } from "@/services/walletService";

const WalletModal = () => {
  const [wallet, setWallet] = useState<WalletType>({
    name: "",
    image: null,
  });
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.id || params?.name) {
      setWallet((prev) => ({
        ...prev,
        id: params.id as string,
        name: params.name as string,
      }));
    }
  }, []);

  const onSubmit = async () => {
    const { name, image } = wallet;

    if (!name.trim()) {
      Alert.alert("User", "Please fill all the fields");
      return;
    }

    setIsLoading(true);

    //include wallet id if update
    let data: WalletType = {
      name,
      image,
      uid: user?.uid,
    };
    if (params?.id) {
      data.id = params?.id as string;
    }
    // Update Firebase
    const res = await createOrUpdateWallet(data);

    setIsLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };

  const onDelete = async () => {
    if (!params?.id) return;
    setIsLoading(true);
    const res = await deleteWallet(params?.id as string);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this wallet? \n This action will remove all the related transactions",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("cancel delete wallet"),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={params?.id ? "Update Wallet" : "Add Wallet"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Name</Typo>
            <Input
              placeholder="Wallet Name"
              value={wallet.name}
              onChangeText={(value) => setWallet({ ...wallet, name: value })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Icon</Typo>
            {/* wallet icon select instead of image */}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {params?.id && !isLoading && (
            <Button
              onPress={showDeleteAlert}
              style={{
                backgroundColor: colors.rose,
                paddingHorizontal: spacingX._15,
              }}
            >
              <Trash
                size={verticalScale(20)}
                color={colors.white}
                weight="bold"
              />
            </Button>
          )}
          <Button loading={isLoading} onPress={onSubmit} style={{ flex: 1 }}>
            <Typo color={colors.black} fontWeight={"700"}>
              {params?.id ? "Update Wallet" : "Add Wallet"}
            </Typo>
          </Button>
        </View>
      </View>
    </ModalWrapper>
  );
};

export default WalletModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
    paddingBottom: spacingY._10,
  },

  scrollContainer: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    borderTopWidth: 1,
    marginBottom: spacingY._5,
  },
  form: {
    gap: spacingY._30,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer: {
    gap: spacingY._10,
  },
});
