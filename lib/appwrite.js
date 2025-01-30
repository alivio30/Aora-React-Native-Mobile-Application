import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteconfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.jja.aora",
  projectId: "679b762d002185a53552",
  databaseId: "679b7731003594cd0836",
  userCollectionId: "679b7747002368131866",
  videoCollectionId: "679b775f0014c55b922b",
  storageId: "679b785c000ee928b4fa",
};

const client = new Client();

client
  .setEndpoint(appwriteconfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteconfig.projectId) // Your project ID
  .setPlatform(appwriteconfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteconfig.databaseId,
      appwriteconfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    // Check if the user is already logged in
    const currentSession = await account.get();

    if (currentSession) {
      console.log("User already logged in:", currentSession);
      return currentSession; // Return existing session
    }
  } catch (error) {
    // If there's no active session, we proceed with login
    console.log("No active session found, proceeding to log in...");
  }

  try {
    // Create a new session only if no active session exists
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteconfig.databaseId,
      appwriteconfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Get all video Posts
export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteconfig.databaseId,
      appwriteconfig.videoCollectionId
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

// Get latest created video posts
export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteconfig.databaseId,
      appwriteconfig.videoCollectionId,
      [(Query.orderDesc("$createdAt"), Query.limit(7))]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}
