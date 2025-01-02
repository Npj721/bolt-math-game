// useDeviceReady.js
import { ref, onMounted } from 'vue';

export function useDeviceReady() {
  const isReady = ref(false);

  const waitForDeviceReady = () => {
    document.addEventListener(
      'deviceready',
      () => {
        isReady.value = true;
        console.log('Device is ready!');
      },
      { once: true }
    );
  };

  onMounted(() => {
    if (window.cordova) {
      waitForDeviceReady();
    } else {
      console.warn('Cordova is not available');
    }
  });

  return { isReady };
}
