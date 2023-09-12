import { type User, UserSchema } from '@/schema'
import { useAlertStore } from '@/stores/alertStore'
import { useUsersStore } from '@/stores/usersStore'
import { useDropZone, useFileDialog } from '@vueuse/core'
import { users } from 'telegram/client'
import { type Ref, ref } from 'vue'

function areUsers(data: any): data is User[] {
  try {
    const parsedUsers = UserSchema.array().parse(data)
    return parsedUsers.length === data.length
  } catch (error) {
    return false
  }
}

export function removeUsers() {
  const usersStore = useUsersStore()
  usersStore.users = []
}

export function useFileSelector(
  dropZoneRef: Ref<HTMLElement | undefined> | false,
  usersProcessFn: (users: User[], usersStore: ReturnType<typeof useUsersStore>) => void
) {
  const alertStore = useAlertStore()
  const usersStore = useUsersStore()

  const fileError = ref(false)
  const loading = ref(false)

  const parseJsonFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => {
        reject(reader.error)
      }
      reader.readAsText(file)
    })
  }

  const loadFile = (file: File) => {
    parseJsonFile(file)
      .then((data) => {
        if (areUsers(data)) {
          usersProcessFn(data, usersStore)
        } else {
          fileError.value = true
          alertStore.error('El archivo no tiene el formato correcto')
        }
      })
      .catch(() => {
        fileError.value = true
        alertStore.error('El archivo no tiene un formato JSON')
      })
      .finally(() => (loading.value = false))
  }

  const fileHandler = (files: File[] | FileList | null, tooManyErrorMsg: string) => {
    fileError.value = false
    alertStore.clear()
    if (files && files.length > 0) {
      if (files.length === 1) {
        loading.value = true
        loadFile(files[0])
      } else {
        fileError.value = true
        alertStore.error(tooManyErrorMsg)
      }
    } else {
      fileError.value = true
      alertStore.error('No se ha podido conseguir el archivo')
    }
  }

  const { isOverDropZone } = (() =>
    dropZoneRef
      ? useDropZone(dropZoneRef, (files) =>
          fileHandler(files, `No puedes arrastrar más de un archivo`)
        )
      : { isOverDropZone: false })()

  const { open, reset, onChange } = useFileDialog()
  onChange((files) => {
    fileHandler(files, 'No puedes elegir más de un archivo')
  })

  return { fileError, loading, isOverDropZone, fileHandler, dialogOpen: open, dialogReset: reset }
}
