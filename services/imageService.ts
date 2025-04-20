import axios from "axios";

type UploadResponse = {
  success: boolean;
  url?: string;
  msg?: string;
};

export const uploadImageToImageKit = async (
  base64: string,
  fileName: string
): Promise<UploadResponse> => {
  try {
    const response = await axios.post("https://upload.imagekit.io/api/v1/files/upload", {
      file: base64,
      fileName,
      publicKey: "public_X+vCzAQw4pYvxnoTFy0nDgwi1iY=",
    });

    return {
      success: true,
      url: response.data.url,
    };
  } catch (error: any) {
    console.error("ImageKit Upload Error:", error.message);
    return {
      success: false,
      msg: "Image upload failed",
    };
  }
};



export const getProfileImage = (file: any) => {
  if (file && typeof file == "string") return file;
  if (file && typeof file == "object") return file.uri;

  return require("../assets/images/defaultAvatar.png");
};

// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import * as FileSystem from "expo-file-system";
// import mime from "react-native-mime-types";

// const storage = getStorage();

// export const uploadImageAsync = async (uri: string, path: string) => {
//   try {
//     const file = await FileSystem.readAsStringAsync(uri, {
//       encoding: FileSystem.EncodingType.Base64,
//     });

//     const blob = await fetch(uri).then((res) => res.blob());
//     const fileType = mime.lookup(uri) || "image/jpeg";

//     const storageRef = ref(storage, path);
//     const snapshot = await uploadBytes(storageRef, blob, {
//       contentType: fileType,
//     });

//     const downloadURL = await getDownloadURL(snapshot.ref);
//     return { success: true, url: downloadURL };
//   } catch (error) {
//     console.error("Image upload failed", error);
//     return { success: false, msg: "Upload failed" };
//   }
// };