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
import { Pencil } from "phosphor-react-native";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { UserDataType } from "@/types";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { updateUser } from "@/services/userService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const ProfileModal = () => {
  const [userData, setUserData] = useState<UserDataType>({
    name: "",
    image: null,
  });
  const { user, updateUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  console.log("User Data", userData);

  useEffect(() => {
    setUserData({
      name: user?.name || "",
      image: user?.image || null,
    });
  }, [user]);

  const onSubmit = async () => {
    const { name, image } = userData;

    if (!name.trim()) {
      Alert.alert("User", "Please fill all the fields");
      return;
    }

    setIsLoading(true);

    let imageUrl = user?.image;

    try {
      // Upload only if image is newly picked (has local uri)
      if (image && "uri" in image) {
        const response = await fetch(image.uri);
        const blob = await response.blob();

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64Data = (reader.result as string).split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = () => reject("Failed to read image");
          reader.readAsDataURL(blob);
        });

        const uploadRes = await uploadImageToImageKit(
          base64,
          `profile_${user?.uid}.jpg`
        );

        if (!uploadRes.success || !uploadRes.url) {
          Alert.alert("Upload", uploadRes.msg || "Upload failed");
          setIsLoading(false);
          return;
        }

        imageUrl = uploadRes.url;
      }

      // Update Firebase
      const updateRes = await updateUser(user?.uid!, {
        name,
        image: imageUrl,
      });

      if (updateRes.success) {
        updateUserData(user?.uid!);
        router.back();
      } else {
        Alert.alert("User", updateRes.msg);
      }
    } catch (error) {
      console.error("Submission error", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);
    if (!result.canceled) {
      setUserData({ ...userData, image: result.assets[0] });
    }
  };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Update Profile"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={getProfileImage(userData.image)}
              contentFit="cover"
              transition={100}
            />
            <TouchableOpacity onPress={onPickImage} style={styles.editIcon}>
              <Pencil size={verticalScale(20)} color={colors.neutral800} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Name</Typo>
            <Input
              placeholder="Name"
              value={userData.name}
              onChangeText={(value) =>
                setUserData({ ...userData, name: value })
              }
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button loading={isLoading} onPress={onSubmit} style={{ flex: 1 }}>
            <Typo color={colors.black} fontWeight={"700"}>
              Update
            </Typo>
          </Button>
        </View>
      </View>
    </ModalWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
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
