<template>
  <Navbar />
  <div class="bg-gray-200">
    <Breadcrumb :pages="pages" />
  </div>
  <div class="flex flex-row flex-wrap gap-3 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex flex-row items-center gap-1 bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg" v-for="folder in userFolders">
      <router-link :to="`/${folder}`" class="flex flex-row items-center">
        <svg viewBox="0 0 40 40" fill="none" role="img" class="dig-ContentIcon dig-ContentIcon--small" focusable="false" width="55" height="55" data-testid="FolderBaseDefaultSmall"><path d="M15.002 7.004c.552.018.993.252 1.295.7l.785 2.12c.145.298.363.576.561.779.252.257.633.4 1.156.4H35.5l-.002 18c-.027.976-.3 1.594-.836 2.142-.565.577-1.383.858-2.41.858H8.748c-1.026 0-1.844-.28-2.409-.858-.564-.577-.838-1.415-.838-2.465V7.003h9.502Z" fill="#8AA8CA"></path><path d="M15.002 7.001c.552.018.993.252 1.295.7l.785 2.12c.145.298.363.576.561.779.252.257.633.4 1.156.4H35.5l-.002 16.84c-.027.976-.3 1.754-.836 2.302-.565.577-1.383.858-2.41.858H8.748c-1.026 0-1.844-.28-2.409-.858-.564-.577-.838-1.415-.838-2.465V7l9.502.001Z" fill="#A1C9F7"></path></svg>
        <span class="text-sm font-medium text-gray-500">{{ folder }}</span>
      </router-link>
    </div>
    <div class="flex flex-row items-center bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg" v-for="file in userFiles">
      <a class="flex flex-row items-center gap-1" :href="file.urlPath[0]" target="_blank">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40px" height="40px"><path fill="#90CAF9" d="M40 45L8 45 8 3 30 3 40 13z"></path><path fill="#E1F5FE" d="M38.5 14L29 14 29 4.5z"></path></svg>
        <span class="text-sm font-medium text-gray-500">{{ file.name }}</span>
      </a>
      <button @click="() => deleteFile(file.name)" class="text-red-500 hover:text-red-700 focus:outline-none">
          Delete
        </button>
        <button @click="() => copyFilePath(file.urlPath[0])" class="text-blue-500 hover:text-blue-700 focus:outline-none">
          Copy
        </button>
    </div>
  </div>

<!--  <pre>
    {{ getAuth() }}
  </pre>-->
</template>

<script setup>
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref as fireStoreRef, getStorage, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import Navbar from "@/components/Navbar.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { useMainStore } from "@/stores/MainStore";

const mainStore = useMainStore();
const route = useRoute();

const pages = [
  {
    name: 'Home',
    link: false
  }
]

const userFolders = ref([]);
const userFiles = ref([]);

const storage = getStorage();

const isLoggedIn = ref(false);

let auth = getAuth();
onMounted(() => {
  document.title = 'Home | My Dropbox'
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isLoggedIn.value = true;
    } else {
      isLoggedIn.value = false
    }
  })
  getListAll()
})

const listRef = fireStoreRef(storage, `${auth.currentUser.uid}`);

const getListAll = () => {
  listAll(listRef)
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          const allFiles = folderRef.fullPath.split('/').slice(-1)
          userFolders.value.push(allFiles[0])
        });
        res.items.forEach((itemRef) => {
          const storage = getStorage();
          const filePath = fireStoreRef(storage, itemRef.fullPath)

          getDownloadURL(filePath).then((...url) => {
            let fileDate = {
              name: itemRef.name,
              urlPath: url,
            }
            userFiles.value.push(fileDate)
          })
        });

      }).catch((error) => {
        mainStore.setError(error.message)
      });
}

const deleteFile = async (fileName) => {
  try {
    const storage = getStorage();
    const fileRef = fireStoreRef(storage, `${auth.currentUser.uid}/${route.fullPath}/${fileName}`);

    // Delete the file
    await deleteObject(fileRef);

    // Remove the deleted file from userFiles
    userFiles.value = userFiles.value.filter(file => file.name !== fileName);

    mainStore.setSuccess('File deleted successfully');
  } catch (error) {
    mainStore.setError(error.message);
  }
}

const copyFilePath = (path) => {
  navigator.clipboard.writeText(path)
    .then(() => {
      mainStore.setSuccess('File path copied to clipboard');
    })
    .catch((error) => {
      mainStore.setError(`Unable to copy file path: ${error.message}`);
    });
}

</script>