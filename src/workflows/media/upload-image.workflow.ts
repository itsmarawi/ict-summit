import { theWorkflows } from '../the.workflows';
import { firebaseService } from 'src/services/firebase.service';

async function uploadImage(file: File, path: string) {
  return await (new Promise<string | undefined>((resolve) => {
    if (file) {
      resolve(firebaseService.uploadImage(file, {
        path
      }))
    } else {
      resolve(undefined);
    }
  }))
}
theWorkflows.on({
  type: 'uploadImage',
  info: { module: 'media', icon: 'image', featured: true },
  loggable: 'post-operation',
  async cb(e) {
    try {
      const upload = await uploadImage(e.payload, e.path)
      if (upload && e.done) {
        e.done(upload);
      } else if (e.error) {
        e.error(new Error('Failed to upload ' + e.payload.name));
      }
    } catch (error) {
      e.error && e.error(new Error(String(error)));
    }
  },
})
