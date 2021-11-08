<template>
  <v-dialog
    dark
    v-model="imagePopup"
    max-width="1200px"
    >
      <v-card 
      class="glass2"
      dark
      >
        <v-card-title>Bild editor</v-card-title>
        <v-divider></v-divider>
        <v-toolbar
        class="glass2 my-2"
        >
            <v-file-input
            id="imageSelector"
            @change="getSelectedFile"
            outlined
            style="height: 58px !important; margin: 0px !important"
            v-model="selectedFile"
            placeholder="Datei auswählen"
            clearable
            ></v-file-input>
        </v-toolbar>
        <v-col class="relative">
            <Cropper
                id="cropper" 
                :src="imgUrl"
                @change="change"
                :width="1080"
                :height="1080"
            />
        </v-col>
        <v-col>
        </v-col>
            <v-card-actions>
                <v-btn
                  text
                  color="primary"
                  dark
                  @click="closeImagePopup()">
                Schließen
                </v-btn>
                <v-btn
                  :loading="imgLoading"
                  text
                  color="accent"
                  dark
                  @click="Compress()">
                  Speichern
                </v-btn>
            </v-card-actions>
      </v-card>
  </v-dialog>

</template>

<script>
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import imageCompression from 'browser-image-compression';

export default {
    props: ['imagePopup'],
    components: {
        Cropper
    },
    data:() => {
        return {
            selectedFile: null,
            imgUrl: null,
            canvasData: null,
            imgLoading: false,
        }
    },
    methods: {
        async Compress () {
          this.imgLoading = true
          await imageCompression.getFilefromDataUrl(this.canvasData, this.selectedFile.name, {
            quality: 0.8,
            maxSizeMB: 1,
            maxWidth: 1920,
            maxHeight: 1080,
            mimeType: 'image/jpeg'
          }).then(async imageFile => {
              const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            }
            try {
                const compressedFile = await imageCompression(imageFile, options);
                console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
                console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

                this.$emit('croppedImage', compressedFile)
            } catch (error) {
                console.log(error);
            }
          });
        },
        closeImagePopup() {
            this.$emit('closeImagePopup')
        },
        getSelectedFile() {
            const files = document.getElementById('imageSelector').files[0];
            let self = this
            if (files) {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(files);
                fileReader.addEventListener("load", function () {
                    self.imgUrl = this.result
                });    
            }
        },
        change({ coordinates, canvas, }) {
            console.log(coordinates)
            this.canvasData = canvas.toDataURL()
        }
    },
}
</script>

<style>
    img {
        width:100%;
        height: auto;
    }
</style>